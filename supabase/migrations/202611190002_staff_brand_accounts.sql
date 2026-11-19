begin;

alter table public.profiles add column if not exists job_title text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists team_name text not null default '';
alter table public.profiles add column if not exists brand_roles jsonb not null default '{}'::jsonb;
alter table public.ledger_entries add column if not exists invoice_no text;
create unique index if not exists ledger_entries_brand_invoice_no_idx
  on public.ledger_entries (brand, invoice_no) where invoice_no is not null;

create or replace function public.v6_can_brand_accounting(p_brand text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select p_brand in ('evx','reve','cc142') and (
    public.v6_can_accounting() or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.status,'active') = 'active'
        and p.brand_roles ->> p_brand in ('accounting','manager')
    )
  );
$$;
revoke all on function public.v6_can_brand_accounting(text) from public;
grant execute on function public.v6_can_brand_accounting(text) to authenticated;

create or replace function public.v6_set_staff_profile_access(
  p_user_id uuid,
  p_access_role text,
  p_status text,
  p_job_title text,
  p_business_role text,
  p_phone text default '',
  p_team_name text default '',
  p_brand_roles jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_role text;
  v_scope record;
begin
  if not public.v6_is_manager() then
    raise exception 'Management access required' using errcode = '42501';
  end if;
  if p_access_role not in ('employee','deputy')
     or p_status not in ('pending','active','disabled')
     or p_business_role not in ('pm','emp','acc')
     or jsonb_typeof(coalesce(p_brand_roles,'{}'::jsonb)) <> 'object' then
    raise exception 'Invalid staff access values' using errcode = '22023';
  end if;
  if p_business_role = 'acc' and not public.v6_is_owner() then
    raise exception 'Only the owner may grant global accounting access' using errcode = '42501';
  end if;
  for v_scope in select key,value from jsonb_each_text(coalesce(p_brand_roles,'{}'::jsonb)) loop
    if v_scope.key not in ('evx','reve','cc142') or v_scope.value not in ('none','employee','accounting','manager') then
      raise exception 'Invalid brand role' using errcode = '22023';
    end if;
    if v_scope.value = 'manager' and not public.v6_is_owner() then
      raise exception 'Only the owner may grant brand manager access' using errcode = '42501';
    end if;
  end loop;

  select role into v_target_role from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Staff profile not found' using errcode = 'P0002'; end if;
  if v_target_role = 'owner' then raise exception 'Owner profile cannot be edited here' using errcode = '42501'; end if;
  if not public.v6_is_owner() and (p_user_id = auth.uid() or v_target_role = 'deputy' or p_access_role = 'deputy') then
    raise exception 'Only the owner may change manager access' using errcode = '42501';
  end if;

  update public.profiles
  set role = p_access_role, status = p_status,
      job_title = left(coalesce(p_job_title,''),100),
      phone = left(coalesce(p_phone,''),32),
      team_name = left(coalesce(p_team_name,''),100),
      brand_roles = coalesce(p_brand_roles,'{}'::jsonb)
  where id = p_user_id;

  insert into public.docs as existing_doc(path, col, data, updated_at)
  values ('members/' || p_user_id::text, 'members', jsonb_build_object(
    'role',p_access_role,'isAdmin',p_access_role='deputy','job_title',left(coalesce(p_job_title,''),100),
    'phone',left(coalesce(p_phone,''),32),'team_name',left(coalesce(p_team_name,''),100),
    'brand_roles',coalesce(p_brand_roles,'{}'::jsonb)), now())
  on conflict (path) do update set col=excluded.col,
    data=coalesce(existing_doc.data,'{}'::jsonb)||excluded.data,updated_at=excluded.updated_at;
  insert into public.docs as existing_doc(path, col, data, updated_at)
  values ('roles/' || p_user_id::text, 'roles', jsonb_build_object('role',p_business_role), now())
  on conflict (path) do update set col=excluded.col,
    data=coalesce(existing_doc.data,'{}'::jsonb)||excluded.data,updated_at=excluded.updated_at;
  return jsonb_build_object('ok',true,'user_id',p_user_id);
end;
$$;
revoke all on function public.v6_set_staff_profile_access(uuid,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.v6_set_staff_profile_access(uuid,text,text,text,text,text,text,jsonb) to authenticated;
revoke all on function public.v6_set_staff_access(uuid,text,text,text,text,text) from authenticated;

drop policy if exists v6_ledger_manager_read on public.ledger_entries;
drop policy if exists v6_ledger_manager_insert on public.ledger_entries;
drop policy if exists v6_ledger_manager_update on public.ledger_entries;
create policy v6_ledger_manager_read on public.ledger_entries for select to authenticated
  using (public.v6_can_brand_accounting(brand));
create policy v6_ledger_manager_insert on public.ledger_entries for insert to authenticated
  with check (public.v6_can_brand_accounting(brand) and created_by = auth.uid());
create policy v6_ledger_manager_update on public.ledger_entries for update to authenticated
  using (public.v6_can_brand_accounting(brand)) with check (public.v6_can_brand_accounting(brand));

create or replace function public.v6_record_deal(
  p_deal_id uuid, p_brand text, p_amount numeric, p_payment_status text, p_date date,
  p_client_name text, p_job_id text, p_service_id text, p_employee_id uuid,
  p_share_amount numeric, p_note text
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
  if not public.v6_can_brand_accounting(p_brand) then
    raise exception 'ليس لديك صلاحية المحاسبة لهذا القسم.' using errcode = '42501';
  end if;
  if p_brand not in ('evx','reve','cc142') then raise exception 'القسم غير صحيح.'; end if;
  if p_payment_status not in ('paid','unpaid') then raise exception 'حالة التحصيل غير صحيحة.'; end if;
  if p_amount <= 0 or p_share_amount <= 0 or p_share_amount > p_amount then
    raise exception 'تحقق من قيمة الصفقة وحصة الموظف.';
  end if;
  if not exists (select 1 from public.profiles p where p.id=p_employee_id and p.role='employee' and coalesce(p.status,'active')='active') then
    raise exception 'اختر حساب موظف نشطًا من الفريق.';
  end if;
  insert into public.ledger_entries
    (id,deal_id,invoice_no,entry_type,brand,status,amount,date,note,client_name,job_id,service_id,created_by)
  values (v_income_id,p_deal_id,case when p_payment_status='unpaid' then
      (case p_brand when 'evx' then 'EVX' when 'reve' then 'REVE' else 'CC142' end)||'-INV-'||to_char(p_date,'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))
    else null end,case when p_payment_status='paid' then 'payment_received' else 'invoice' end,
    p_brand,p_payment_status,p_amount,p_date,coalesce(nullif(btrim(p_note),''),'صفقة جديدة'),
    nullif(btrim(p_client_name),''),nullif(btrim(p_job_id),''),nullif(btrim(p_service_id),''),auth.uid());
  insert into public.ledger_entries
    (id,deal_id,entry_type,brand,status,amount,share_base_amount,date,note,client_name,employee_id,job_id,service_id,created_by)
  values (v_share_id,p_deal_id,'employee_share',p_brand,'unpaid',p_share_amount,p_amount,p_date,
    coalesce(nullif(btrim(p_note),''),'حصة الموظف من الصفقة'),nullif(btrim(p_client_name),''),
    p_employee_id,nullif(btrim(p_job_id),''),nullif(btrim(p_service_id),''),auth.uid());
  return jsonb_build_object('ok',true,'deal_id',p_deal_id,'income_entry_id',v_income_id,'share_entry_id',v_share_id);
end;
$$;
revoke all on function public.v6_record_deal(uuid,text,numeric,text,date,text,text,text,uuid,numeric,text) from public;
grant execute on function public.v6_record_deal(uuid,text,numeric,text,date,text,text,text,uuid,numeric,text) to authenticated;

commit;
