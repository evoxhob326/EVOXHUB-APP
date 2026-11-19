import { createHash } from "node:crypto";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
const baseUrl = process.env.SUPABASE_URL.replace(/\/+$/, "");
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : null;
}

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((parseInt(hex[16], 16) & 3) | 8).toString(16);
  const raw = hex.join("");
  return `${raw.slice(0,8)}-${raw.slice(8,12)}-${raw.slice(12,16)}-${raw.slice(16,20)}-${raw.slice(20)}`;
}

async function listAllDocs(collection) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const page = await request(`docs?select=path,data&col=eq.${encodeURIComponent(collection)}&order=path.asc`, {
      headers: { Range: `${offset}-${offset + 499}` },
    });
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}

const [acctRows, ledgerRows, existing] = await Promise.all([
  listAllDocs("acct"),
  listAllDocs("ledger"),
  request("ledger_entries?select=id"),
]);
const uniqueDocs = new Map([...acctRows, ...ledgerRows].map((row) => [row.path, row]));
const sourceRows = [...uniqueDocs.values()];
const records = sourceRows.map(({ path, data = {} }) => {
  const date = /^\d{4}-\d{2}-\d{2}/.test(String(data.date || "")) ? String(data.date).slice(0,10) : new Date(Number(data.at) || Date.now()).toISOString().slice(0,10);
  const type = data.entry_type || (data.type === "l_income" ? "payment_received" : "legacy_expense");
  const status = ["paid","unpaid","repaying","partial"].includes(data.status) ? data.status : "paid";
  const rawAmount = Number(data.amount);
  const amount = Number.isFinite(rawAmount) ? Math.max(0, rawAmount) : 0;
  const creator = uuidRe.test(String(data.by || data.created_by || "")) ? String(data.by || data.created_by) : null;
  const employee = uuidRe.test(String(data.employee_id || "")) ? data.employee_id : null;
  const validBrand = ["evx","reve","cc142"].includes(data.brand);
  const brand = validBrand ? data.brand : "evx";
  const allowedTypes = new Set(["invoice","payment_received","internal_expense","external_expense","project_fund_spend","salary","advance","legacy_expense"]);
  return {
    id: stableUuid(path),
    schema_version: 6,
    source_legacy_path: path,
    entry_type: allowedTypes.has(type) ? type : "legacy_expense",
    brand,
    legacy_brand_unverified:!validBrand,
    legacy_type_unverified:!allowedTypes.has(type)||(!data.entry_type&&data.type==="l_expense")||(!data.entry_type&&!data.type),
    status,
    amount,
    date,
    note: String(data.note || data.title || "").slice(0, 2000),
    client_name: String(data.client_name || data.client || "").slice(0, 300) || null,
    employee_id: employee,
    job_id: String(data.job_id || data.job || "").slice(0, 300) || null,
    legacy_category: String(data.legacy_category || data.category || "").slice(0, 200) || null,
    legacy_monthly: !!(data.legacy_monthly || data.monthly),
    created_by: creator,
    created_at: Number.isFinite(Number(data.at)) ? new Date(Number(data.at)).toISOString() : `${date}T12:00:00.000Z`,
  };
});

let inserted = 0;
for (let offset = 0; offset < records.length; offset += 250) {
  const batch = records.slice(offset, offset + 250);
  if (!batch.length) continue;
  await request("ledger_entries?on_conflict=source_legacy_path", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(batch),
  });
  inserted += batch.length;
}
const after = await request("ledger_entries?select=id");
if (after.length < existing.length) throw new Error("Ledger row count decreased; stop and inspect the database.");
console.log(`Processed ${sourceRows.length} legacy finance records idempotently. Existing rows before: ${existing.length}; after: ${after.length}.`);
console.log(`Upserted ${inserted} records by source_legacy_path. Original docs remain untouched; no records were deleted.`);
