import { readFile } from "node:fs/promises";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const baseUrl = process.env.SUPABASE_URL.replace(/\/+$/, "");
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const services = JSON.parse((await readFile(new URL("../data/services.json", import.meta.url), "utf8")).replace(/^\uFEFF/, ""));
if (!Array.isArray(services) || services.length !== 58) throw new Error("Expected the reviewed 58-item starter catalog.");
const ids = new Set(services.map((row) => row.id));
if (ids.size !== services.length) throw new Error("Catalog contains duplicate IDs; refusing to seed.");

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

const before = await request("services?select=id");
const rows = services.map(({ id, brand, domain, name_ar, name_en, needs_verification, featured, popular, authority, default_docs, active, sort, price_sedan, price_4wd, price_flat, price_note }) => ({
  id, brand, domain, name_ar, name_en, needs_verification, featured, popular, authority, default_docs, active, sort, price_sedan, price_4wd, price_flat, price_note,
}));
await request("services?on_conflict=id", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(rows),
});
const after = await request("services?select=id,brand");
const afterIds = new Set(after.map((row) => row.id));
const missingIds = [...ids].filter((id) => !afterIds.has(id));
if (missingIds.length) throw new Error(`Seed verification failed; missing ${missingIds.length} service IDs.`);
if (after.length < before.length) throw new Error("The service row count decreased; stop and review the database.");

const counts = after.reduce((result, row) => ({ ...result, [row.brand]: (result[row.brand] || 0) + 1 }), {});
console.log(`Seeded ${services.length} reviewed services. Existing rows before: ${before.length}; rows after: ${after.length}.`);
console.log(`Brand counts after seed: ${JSON.stringify(counts)}. No rows were deleted.`);
