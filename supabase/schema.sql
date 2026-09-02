-- ============================================================
-- CocoaGuard AI — Supabase schema (run in the SQL Editor)
-- ============================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  preferred_language  text not null default 'en',
  created_at          timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup (also fires for anonymous sign-ins)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- ---------- SCANS ----------
create table public.scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  image_url       text,
  predicted_class text not null check (predicted_class in ('healthy','black_pod','cssvd','anthracnose')),
  confidence      numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  source          text not null default 'trained_model' check (source in ('trained_model','llm_fallback')),
  lat             double precision,
  lng             double precision,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index scans_user_id_idx      on public.scans(user_id);
create index scans_created_at_idx   on public.scans(created_at desc);
create index scans_lat_lng_idx      on public.scans(lat, lng) where lat is not null and lng is not null;

alter table public.scans enable row level security;

create policy "scans_select_own" on public.scans for select using (auth.uid() = user_id);
create policy "scans_insert_own" on public.scans for insert with check (auth.uid() = user_id);
create policy "scans_update_own" on public.scans for update using (auth.uid() = user_id);
create policy "scans_delete_own" on public.scans for delete using (auth.uid() = user_id);

-- ---------- PUBLIC MAP PATH ----------
-- Owner-privileged view => runs with table-owner rights, so anon can read it
-- even though RLS blocks anon on public.scans. Exposes ONLY sanitized columns.
create or replace view public.community_scans as
select id, predicted_class, confidence, source, lat, lng, created_at
from public.scans
where lat is not null and lng is not null and is_public = true;

grant select on public.community_scans to anon, authenticated;
grant select on public.community_scans to service_role;

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', true)
on conflict (id) do nothing;

create policy "scan_images_public_read" on storage.objects
  for select using (bucket_id = 'scan-images');

create policy "scan_images_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'scan-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
