-- EVOXHUB v6 additive schema. Review and run against a non-production project first.
-- This migration is intentionally not applied to the live Supabase project.
begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.v6_is_manager()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner', 'deputy')
      and coalesce(p.status, 'active') = 'active'
  );
$$;

create or replace function public.v6_is_owner()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and coalesce(p.status, 'active') = 'active'
  );
$$;

revoke all on function public.v6_is_manager() from public;
revoke all on function public.v6_is_owner() from public;
grant execute on function public.v6_is_manager() to authenticated;
grant execute on function public.v6_is_owner() to anon, authenticated;

create or replace function public.v6_can_accounting()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.v6_is_manager() or exists (
    select 1 from public.docs d
    where d.path = 'roles/' || auth.uid()::text
      and d.data ->> 'role' = 'acc'
  );
$$;
revoke all on function public.v6_can_accounting() from public;
grant execute on function public.v6_can_accounting() to authenticated;

create table if not exists public.services (
  id text primary key,
  brand text not null check (brand in ('evx','reve','cc142')),
  domain text not null default '',
  name_ar text not null,
  name_en text not null default '',
  needs_verification boolean not null default true,
  featured boolean not null default false,
  popular boolean not null default false,
  authority text,
  default_docs jsonb not null default '[]'::jsonb check (jsonb_typeof(default_docs) = 'array'),
  active boolean not null default true,
  sort integer not null default 999,
  price_sedan numeric(12,3),
  price_4wd numeric(12,3),
  price_flat numeric(12,3),
  price_note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services add column if not exists price_sedan numeric(12,3);
alter table public.services add column if not exists price_4wd numeric(12,3);
alter table public.services add column if not exists price_flat numeric(12,3);
alter table public.services add column if not exists price_note text not null default '';

create table if not exists public.website_requests (
  id uuid primary key default gen_random_uuid(),
  request_no text not null unique,
  name text not null check (char_length(name) between 2 and 120),
  whatsapp text not null check (char_length(whatsapp) between 8 and 32),
  service_id text not null references public.services(id) on update cascade on delete restrict,
  brand text not null check (brand in ('evx','reve','cc142')),
  governorate text not null default '' check (char_length(governorate) <= 80),
  note text not null default '' check (char_length(note) <= 1500),
  consent boolean not null check (consent),
  status text not null default 'new' check (status in ('new','reviewing','contacted','converted','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_at timestamptz,
  check (request_no <> '')
);

create table if not exists public.website_request_limits (
  phone_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0)
);

create sequence if not exists public.website_request_no_seq;

create table if not exists public.inquiries (
  id text primary key,
  client_name text not null default '',
  phone text not null default '',
  client_id text,
  brand text not null default 'evx' check (brand in ('evx','reve','cc142')),
  service_id text references public.services(id) on update cascade on delete set null,
  service_name text not null default '',
  request text not null default '',
  details text not null default '',
  feasibility text not null default 'undecided' check (feasibility in ('undecided','yes','partial','no')),
  feasibility_reason text not null default '',
  required_docs jsonb not null default '[]'::jsonb check (jsonb_typeof(required_docs) = 'array'),
  resources text not null default '',
  goal text not null default '',
  government_fee_note text not null default '',
  estimated_fee numeric(12,3) check (estimated_fee is null or estimated_fee >= 0),
  due date,
  status text not null default 'new' check (status in ('new','studying','accepted','converted','rejected')),
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  source_website_request_id uuid references public.website_requests(id) on delete set null,
  job_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_at timestamptz
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  schema_version smallint not null default 6,
  entry_type text not null check (entry_type in ('invoice','payment_received','internal_expense','external_expense','project_fund_spend','salary','advance','legacy_expense','employee_share')),
  brand text not null check (brand in ('evx','reve','cc142')),
  legacy_brand_unverified boolean not null default false,
  legacy_type_unverified boolean not null default false,
  status text not null default 'paid' check (status in ('paid','unpaid','repaying','partial')),
  amount numeric(12,3) not null check (amount >= 0),
  share_base_amount numeric(12,3) check (share_base_amount is null or share_base_amount >= 0),
  deal_id uuid,
  date date not null,
  note text not null default '',
  client_name text,
  employee_id uuid references auth.users(id) on delete set null,
  job_id text,
  legacy_category text,
  legacy_monthly boolean not null default false,
  source_legacy_path text unique,
  service_id text references public.services(id) on update cascade on delete set null,
  receipt_path text,
  receipt_name text,
  receipt_size bigint check (receipt_size is null or receipt_size >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ledger_entries add column if not exists share_base_amount numeric(12,3) check (share_base_amount is null or share_base_amount >= 0);
alter table public.ledger_entries add column if not exists deal_id uuid;
alter table public.ledger_entries drop constraint if exists ledger_entries_entry_type_check;
alter table public.ledger_entries add constraint ledger_entries_entry_type_check check (entry_type in ('invoice','payment_received','internal_expense','external_expense','project_fund_spend','salary','advance','legacy_expense','employee_share'));

create table if not exists public.client_errors (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  message text not null check (char_length(message) <= 500),
  source text not null default '' check (char_length(source) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists services_brand_active_sort_idx on public.services(brand, active, sort);
create index if not exists website_requests_created_at_idx on public.website_requests(created_at desc);
create index if not exists website_requests_status_idx on public.website_requests(status, brand);
create index if not exists inquiries_owner_created_idx on public.inquiries(created_by, created_at desc);
create index if not exists inquiries_assignee_status_idx on public.inquiries(assigned_to, status, due);
create index if not exists ledger_entries_date_idx on public.ledger_entries(date desc);
create index if not exists ledger_entries_employee_date_idx on public.ledger_entries(employee_id, date desc);
create index if not exists ledger_entries_job_idx on public.ledger_entries(job_id);
create index if not exists ledger_entries_deal_idx on public.ledger_entries(deal_id);
create index if not exists client_errors_created_at_idx on public.client_errors(created_at desc);

alter table public.services enable row level security;
alter table public.website_requests enable row level security;
alter table public.website_request_limits enable row level security;
alter table public.inquiries enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.client_errors enable row level security;

drop policy if exists v6_services_read_active on public.services;
drop policy if exists v6_services_owner_all on public.services;
create policy v6_services_read_active on public.services for select to anon, authenticated using (active or public.v6_is_owner());
create policy v6_services_owner_all on public.services for all to authenticated using (public.v6_is_owner()) with check (public.v6_is_owner());

drop policy if exists v6_website_requests_manager_read on public.website_requests;
drop policy if exists v6_website_requests_manager_update on public.website_requests;
create policy v6_website_requests_manager_read on public.website_requests for select to authenticated using (public.v6_is_manager());
create policy v6_website_requests_manager_update on public.website_requests for update to authenticated using (public.v6_is_manager()) with check (public.v6_is_manager());

drop policy if exists v6_inquiries_read_scope on public.inquiries;
drop policy if exists v6_inquiries_insert_scope on public.inquiries;
drop policy if exists v6_inquiries_update_scope on public.inquiries;
create policy v6_inquiries_read_scope on public.inquiries for select to authenticated using (public.v6_is_manager() or created_by = auth.uid() or assigned_to = auth.uid());
create policy v6_inquiries_insert_scope on public.inquiries for insert to authenticated with check (created_by = auth.uid() and (public.v6_is_manager() or assigned_to = auth.uid()));
create policy v6_inquiries_update_scope on public.inquiries for update to authenticated using (public.v6_is_manager() or created_by = auth.uid() or assigned_to = auth.uid()) with check (public.v6_is_manager() or created_by = auth.uid() or assigned_to = auth.uid());

create or replace function public.v6_guard_inquiry_assignment()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.v6_is_manager() and (new.created_by is distinct from old.created_by or new.assigned_to is distinct from old.assigned_to) then
    raise exception 'Only management may change inquiry ownership' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists v6_guard_inquiry_assignment on public.inquiries;
create trigger v6_guard_inquiry_assignment before update on public.inquiries
  for each row execute function public.v6_guard_inquiry_assignment();

create or replace function public.v6_set_staff_access(
  p_user_id uuid,
  p_access_role text,
  p_status text,
  p_job_title text,
  p_business_role text,
  p_phone text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_role text;
begin
  if not public.v6_is_manager() then
    raise exception 'Management access required' using errcode = '42501';
  end if;
  if p_access_role not in ('employee','deputy') or p_status not in ('pending','active','disabled') or p_business_role not in ('pm','emp','acc') then
    raise exception 'Invalid staff access values' using errcode = '22023';
  end if;
  select role into v_target_role from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Staff profile not found' using errcode = 'P0002'; end if;
  if v_target_role = 'owner' then raise exception 'Owner profile cannot be edited here' using errcode = '42501'; end if;
  if not public.v6_is_owner() and (p_user_id = auth.uid() or v_target_role = 'deputy' or p_access_role = 'deputy') then
    raise exception 'Only the owner may change manager access' using errcode = '42501';
  end if;

  update public.profiles set role = p_access_role, status = p_status where id = p_user_id;
  insert into public.docs as existing_doc(path, col, data, updated_at)
  values ('members/' || p_user_id::text, 'members', jsonb_build_object('role',p_access_role,'isAdmin',p_access_role='deputy','job_title',left(coalesce(p_job_title,''),100),'phone',left(coalesce(p_phone,''),32)), now())
  on conflict (path) do update set
    col = excluded.col,
    data = coalesce(existing_doc.data,'{}'::jsonb) || excluded.data,
    updated_at = excluded.updated_at;
  insert into public.docs as existing_doc(path, col, data, updated_at)
  values ('roles/' || p_user_id::text, 'roles', jsonb_build_object('role',p_business_role), now())
  on conflict (path) do update set
    col = excluded.col,
    data = coalesce(existing_doc.data,'{}'::jsonb) || excluded.data,
    updated_at = excluded.updated_at;

  return jsonb_build_object('ok', true, 'user_id', p_user_id);
end;
$$;
revoke all on function public.v6_set_staff_access(uuid,text,text,text,text,text) from public;
grant execute on function public.v6_set_staff_access(uuid,text,text,text,text,text) to authenticated;

drop policy if exists v6_ledger_manager_read on public.ledger_entries;
drop policy if exists v6_ledger_employee_share_read on public.ledger_entries;
drop policy if exists v6_ledger_manager_insert on public.ledger_entries;
drop policy if exists v6_ledger_manager_update on public.ledger_entries;
create policy v6_ledger_manager_read on public.ledger_entries for select to authenticated using (public.v6_can_accounting());
create policy v6_ledger_employee_share_read on public.ledger_entries for select to authenticated using (entry_type = 'employee_share' and employee_id = auth.uid());
create policy v6_ledger_manager_insert on public.ledger_entries for insert to authenticated with check (public.v6_can_accounting() and created_by = auth.uid());
create policy v6_ledger_manager_update on public.ledger_entries for update to authenticated using (public.v6_can_accounting()) with check (public.v6_can_accounting());

create or replace function public.v6_record_deal(
  p_deal_id uuid,
  p_brand text,
  p_amount numeric,
  p_payment_status text,
  p_date date,
  p_client_name text,
  p_job_id text,
  p_service_id text,
  p_employee_id uuid,
  p_share_amount numeric,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_income_id uuid := gen_random_uuid();
  v_share_id uuid := gen_random_uuid();
begin
  if not public.v6_can_accounting() then
    raise exception 'ليس لديك صلاحية تسجيل الصفقة.';
  end if;
  if p_brand not in ('evx','reve','cc142') then
    raise exception 'القسم غير صحيح.';
  end if;
  if p_payment_status not in ('paid','unpaid') then
    raise exception 'حالة التحصيل غير صحيحة.';
  end if;
  if p_amount <= 0 or p_share_amount <= 0 or p_share_amount > p_amount then
    raise exception 'تحقق من قيمة الصفقة وحصة الموظف.';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = p_employee_id and p.role = 'employee' and coalesce(p.status,'active') = 'active'
  ) then
    raise exception 'اختر حساب موظف نشطًا من فريق EVOXHUB.';
  end if;

  insert into public.ledger_entries
    (id, deal_id, entry_type, brand, status, amount, date, note, client_name, job_id, service_id, created_by)
  values
    (v_income_id, p_deal_id,
     case when p_payment_status = 'paid' then 'payment_received' else 'invoice' end,
     p_brand, p_payment_status, p_amount, p_date,
     coalesce(nullif(btrim(p_note),''), 'صفقة جديدة'), nullif(btrim(p_client_name),''),
     nullif(btrim(p_job_id),''), nullif(btrim(p_service_id),''), auth.uid());

  insert into public.ledger_entries
    (id, deal_id, entry_type, brand, status, amount, share_base_amount, date, note, client_name, employee_id, job_id, service_id, created_by)
  values
    (v_share_id, p_deal_id, 'employee_share', p_brand, 'unpaid', p_share_amount, p_amount, p_date,
     coalesce(nullif(btrim(p_note),''), 'حصة الموظف من الصفقة'), nullif(btrim(p_client_name),''),
     p_employee_id, nullif(btrim(p_job_id),''), nullif(btrim(p_service_id),''), auth.uid());

  return jsonb_build_object('ok', true, 'deal_id', p_deal_id, 'income_entry_id', v_income_id, 'share_entry_id', v_share_id);
end;
$$;
revoke all on function public.v6_record_deal(uuid,text,numeric,text,date,text,text,text,uuid,numeric,text) from public;
grant execute on function public.v6_record_deal(uuid,text,numeric,text,date,text,text,text,uuid,numeric,text) to authenticated;

drop policy if exists v6_client_errors_insert_self on public.client_errors;
drop policy if exists v6_client_errors_manager_read on public.client_errors;
create policy v6_client_errors_insert_self on public.client_errors for insert to authenticated with check (user_id = auth.uid());
create policy v6_client_errors_manager_read on public.client_errors for select to authenticated using (public.v6_is_manager());

grant select on public.services to anon, authenticated;
grant insert, update on public.services to authenticated;
grant select, update on public.website_requests to authenticated;
grant select, insert, update on public.inquiries to authenticated;
grant select, insert, update on public.ledger_entries to authenticated;
grant select, insert on public.client_errors to authenticated;
revoke all on public.website_request_limits from anon, authenticated;

create or replace function public.submit_website_request(
  p_name text,
  p_whatsapp text,
  p_service_id text,
  p_brand text,
  p_governorate text default '',
  p_note text default '',
  p_consent boolean default false,
  p_website text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := btrim(coalesce(p_whatsapp, ''));
  v_digits text;
  v_hash text;
  v_count integer;
  v_now timestamptz := now();
  v_request_no text;
  v_id uuid;
begin
  -- A filled honeypot receives a success-shaped response without storing anything.
  if length(btrim(coalesce(p_website, ''))) > 0 then
    return jsonb_build_object('accepted', true, 'request_no', null);
  end if;

  v_digits := regexp_replace(v_phone, '[^0-9]', '', 'g');
  if length(v_name) < 2 or length(v_name) > 120
     or length(v_phone) < 8 or length(v_phone) > 32
     or length(v_digits) < 8 or length(v_digits) > 15
     or length(coalesce(p_governorate, '')) > 80
     or length(coalesce(p_note, '')) > 1500
     or p_brand not in ('evx','reve','cc142')
     or p_consent is distinct from true then
    raise exception 'Invalid request fields' using errcode = '22023';
  end if;

  if not exists (select 1 from public.services s where s.id = p_service_id and s.brand = p_brand and s.active) then
    raise exception 'Service unavailable' using errcode = '22023';
  end if;

  v_hash := encode(digest(v_digits, 'sha256'), 'hex');
  insert into public.website_request_limits(phone_hash, window_started_at, request_count)
  values (v_hash, v_now, 1)
  on conflict (phone_hash) do update set
    request_count = case
      when public.website_request_limits.window_started_at < v_now - interval '15 minutes' then 1
      else public.website_request_limits.request_count + 1
    end,
    window_started_at = case
      when public.website_request_limits.window_started_at < v_now - interval '15 minutes' then v_now
      else public.website_request_limits.window_started_at
    end
  returning request_count into v_count;

  if v_count > 5 then
    return jsonb_build_object('accepted', false, 'rate_limited', true);
  end if;

  v_request_no := 'EX-' || to_char(v_now at time zone 'UTC', 'YYYYMMDD') || '-' || lpad(nextval('public.website_request_no_seq')::text, 5, '0');
  insert into public.website_requests(request_no, name, whatsapp, service_id, brand, governorate, note, consent)
  values (v_request_no, v_name, v_phone, p_service_id, p_brand, btrim(coalesce(p_governorate, '')), btrim(coalesce(p_note, '')), true)
  returning id into v_id;

  return jsonb_build_object('accepted', true, 'id', v_id, 'request_no', v_request_no, 'status', 'new');
end;
$$;

revoke all on function public.submit_website_request(text,text,text,text,text,text,boolean,text) from public;
grant execute on function public.submit_website_request(text,text,text,text,text,text,boolean,text) to anon, authenticated;

-- Keep the receipt bucket private. Existing bucket settings are preserved.
insert into storage.buckets(id, name, public)
values ('files', 'files', false)
on conflict (id) do nothing;
insert into storage.buckets(id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

drop policy if exists v6_files_read_scoped on storage.objects;
drop policy if exists v6_files_insert_own on storage.objects;
drop policy if exists v6_files_delete_scoped on storage.objects;
create policy v6_files_read_scoped on storage.objects for select to authenticated
  using (bucket_id = 'files' and ((storage.foldername(name))[1] = auth.uid()::text or public.v6_is_manager()));
create policy v6_files_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy v6_files_delete_scoped on storage.objects for delete to authenticated
  using (bucket_id = 'files' and ((storage.foldername(name))[1] = auth.uid()::text or public.v6_is_manager()));

drop policy if exists v6_receipts_read_scoped on storage.objects;
drop policy if exists v6_receipts_insert_own on storage.objects;
drop policy if exists v6_receipts_delete_scoped on storage.objects;
create policy v6_receipts_read_scoped on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.v6_can_accounting()));
create policy v6_receipts_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy v6_receipts_delete_scoped on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.v6_can_accounting()));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='services') then alter publication supabase_realtime add table public.services; end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='inquiries') then alter publication supabase_realtime add table public.inquiries; end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='website_requests') then alter publication supabase_realtime add table public.website_requests; end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='ledger_entries') then alter publication supabase_realtime add table public.ledger_entries; end if;
  end if;
end $$;

commit;
