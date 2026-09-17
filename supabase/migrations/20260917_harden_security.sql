-- Ukalism Real Estate security hardening
-- Applied to the live Supabase project on 2026-09-17.

-- Prevent mutable search_path behavior in trigger functions.
create or replace function public.set_property_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_vehicle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_enquiry_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Evaluate auth.jwt() once per statement instead of once per row.
drop policy if exists "Admin can insert properties" on public.properties;
create policy "Admin can insert properties"
on public.properties for insert to authenticated
with check (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can update properties" on public.properties;
create policy "Admin can update properties"
on public.properties for update to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can delete properties" on public.properties;
create policy "Admin can delete properties"
on public.properties for delete to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can insert vehicles" on public.vehicles;
create policy "Admin can insert vehicles"
on public.vehicles for insert to authenticated
with check (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can update vehicles" on public.vehicles;
create policy "Admin can update vehicles"
on public.vehicles for update to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can delete vehicles" on public.vehicles;
create policy "Admin can delete vehicles"
on public.vehicles for delete to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can read enquiries" on public.enquiries;
create policy "Admin can read enquiries"
on public.enquiries for select to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can update enquiries" on public.enquiries;
create policy "Admin can update enquiries"
on public.enquiries for update to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');

drop policy if exists "Admin can delete enquiries" on public.enquiries;
create policy "Admin can delete enquiries"
on public.enquiries for delete to authenticated
using (((select auth.jwt()) ->> 'email') = 'deejayjohnkay@gmail.com');