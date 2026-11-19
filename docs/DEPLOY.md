# Database and deployment notes

## Current state

The UI is static and remains compatible with GitHub Pages. Existing authentication and legacy job/task documents are kept. The v6 data migration is additive and is stored at `supabase/migrations/202611190001_v6_business_data.sql`; it has **not** been applied to any Supabase project. The two data scripts are manual tools and must not be run against production before review.

The migration assumes the current Supabase project already has `auth.users`, `public.profiles` (`id`, `role`, `status`), `public.docs` (`path`, `data`), Supabase Storage, and the `supabase_realtime` publication. These are used by the existing app. Confirm that assumption against a backup or disposable clone before running it. It also adds atomic deal registration and employee share entries: accounting users can create them, while each employee can read only their own share rows.

## Local preview

```powershell
npx --yes serve -l 4173 .
```

Open `http://127.0.0.1:4173/`. The app uses the configured Supabase project for authentication. The public lead form is at `/request.html`; submitting it writes only through the new RPC, so it cannot store a request until the migration exists.

## Test project sequence

1. Create or restore a non-production Supabase project from a recent backup.
2. Confirm the prerequisite tables/columns listed above and review existing Storage policies.
3. Apply the migration to that test project. It creates the private `receipts` bucket if absent and preserves any existing bucket settings.
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in the local process environment, then run `node scripts/seed-services.mjs`. The key bypasses RLS and must never be committed or printed.
5. Run `node scripts/migrate-acct-docs.mjs` only after checking a backup and validating the old `acct`/`ledger` document shapes. It is idempotent by `source_legacy_path` and never deletes source documents.
6. Run `supabase test db` where pgTAP and the Supabase CLI are installed. The RLS test file covers public catalog visibility and denies anonymous access/writes to internal tables.
7. Sign in as an owner, deputy, employee, and employee with the `acc` business role. Verify that accounting access is restricted to the assigned role and that receipt links are signed and private.
8. Check inquiry ownership, public request validation/rate limits, task conversion, CSV export, and mobile layouts before considering production rollout.

## Production rollout

The production database and `main` branch are intentionally untouched by this work. For a production rollout, first review a concrete diff and the successful test-project results. Back up the production project, obtain explicit approval to apply the migration, then seed services and migrate ledger docs as separate reviewed steps. Publish the branch through a pull request; do not push directly to `main` or merge without a separate approval.

## Catalog seed behavior

`scripts/seed-services.mjs` upserts by service ID, verifies that all 58 starter IDs exist, checks that the row count did not decrease, and never deletes. It prints counts only. The catalog includes 10 CC142 services and owner-confirmed sedan/4WD prices. The migration adds `price_sedan`, `price_4wd`, `price_flat`, and `price_note`; apply the migration to a test database before seeding. The owner may edit prices or deactivate catalog entries in the UI.

## Legacy finance migration

`scripts/migrate-acct-docs.mjs` reads `docs` collection rows from `acct` and `ledger`, maps legacy `l_income` rows to payments, and keeps unclassified expense rows as `legacy_expense` until a person reviews them. It records the old document path and uses schema version 6. If the legacy record has no valid employee/user UUID, `created_by` stays null for history. It does not infer fees, taxes, or brands from notes; missing or unknown brands are temporarily displayed as EVOXHUB with a visible review flag. Source documents remain untouched.
