-- Run with `supabase test db` against a disposable local/test project after migration and service seeding.
begin;
select plan(10);

select has_table('public', 'services', 'service catalog table exists');
select has_table('public', 'website_requests', 'website request table exists');
select has_table('public', 'inquiries', 'customer inquiry table exists');
select has_table('public', 'ledger_entries', 'accounting ledger table exists');

set local role anon;
select ok((select count(*) > 0 from public.services where active), 'anonymous visitors can read active services');
select is((select count(*) from public.inquiries), 0::bigint, 'anonymous visitors cannot read inquiries');
select is((select count(*) from public.website_requests), 0::bigint, 'anonymous visitors cannot read website requests');
select throws_ok(
  $$insert into public.website_requests(request_no,name,whatsapp,service_id,brand,consent) values ('test','Test Client','96890000000','missing','evx',true)$$,
  '42501', null, 'anonymous clients cannot insert directly into website requests'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000000', true);
select is(public.v6_is_manager(), false, 'an authenticated user without an active staff profile is not management');
select is(public.v6_can_accounting(), false, 'an authenticated user without the accounting role cannot see the ledger');

reset role;
select * from finish();
rollback;
