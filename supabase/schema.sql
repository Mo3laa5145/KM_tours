-- =====================================================================
-- KM Tours — Supabase schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query → Run
-- Then run supabase/seed.sql to load the current trips.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Admins: users listed here can manage the site.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Destinations (cities)
-- name / description are JSON objects: {"en": "...", "ar": "...", "fr": "...", "de": "..."}
-- ---------------------------------------------------------------------
create table if not exists public.destinations (
  id text primary key,
  name jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  cover_photo text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Trips (experiences)
-- content = {"en": {title, duration, description, highlights[], itinerary[], included[],
--            excluded[], meetingPoint, whatToBring[], cancellationPolicy, faq[]}, "ar": {...}, ...}
-- ---------------------------------------------------------------------
create table if not exists public.experiences (
  id text primary key,
  destination_id text not null references public.destinations (id) on update cascade on delete restrict,
  category text not null default 'Cultural & Historical',
  price numeric(12, 2) not null default 0 check (price >= 0),
  child_price numeric(12, 2) check (child_price is null or child_price >= 0),
  duration_hours numeric(5, 2),
  tour_languages text[] not null default array['English']::text[],
  pickup_available boolean not null default true,
  free_cancellation boolean not null default true,
  provider text,
  photos text[] not null default '{}'::text[],
  rating numeric(2, 1) not null default 5.0,
  review_count int not null default 0,
  reviews jsonb not null default '[]'::jsonb,
  content jsonb not null default '{}'::jsonb,
  max_guests int,
  children_allowed boolean not null default true,
  child_min_age int not null default 4 check (child_min_age between 0 and 17),
  child_max_age int not null default 11 check (child_max_age between 1 and 17),
  infants_allowed boolean not null default true,
  published boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_destination_idx on public.experiences (destination_id);


-- ---------------------------------------------------------------------
-- Closed dates (holidays, weather...). experience_id null = all trips
-- ---------------------------------------------------------------------
create table if not exists public.blocked_dates (
  id bigint generated always as identity primary key,
  experience_id text references public.experiences (id) on update cascade on delete cascade,
  day date not null,
  reason text,
  created_at timestamptz not null default now()
);
create unique index if not exists blocked_dates_unique on public.blocked_dates (coalesce(experience_id, '*'), day);
create index if not exists blocked_dates_day_idx on public.blocked_dates (day);

-- ---------------------------------------------------------------------
-- Bookings (no online payment — booking requests only)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  experience_id text references public.experiences (id) on update cascade on delete set null,
  experience_title text,
  destination_id text,
  trip_date date not null,
  adults int not null default 1 check (adults between 1 and 100),
  children int not null default 0 check (children between 0 and 100),
  infants int not null default 0 check (infants between 0 and 20),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text check (email is null or char_length(email) <= 200),
  phone text not null check (char_length(phone) between 5 and 40),
  whatsapp boolean not null default true,
  nationality text check (nationality is null or char_length(nationality) = 2),
  pickup_area text,
  hotel text,
  room text,
  tour_language text,
  notes text check (notes is null or char_length(notes) <= 2000),
  unit_price numeric(12, 2),
  child_price numeric(12, 2),
  total_price numeric(12, 2),
  currency text not null default 'EGP',
  site_language text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_trip_date_idx on public.bookings (trip_date);


-- Upgrades for databases created with an earlier version of this file
alter table public.experiences add column if not exists children_allowed boolean not null default true;
alter table public.experiences add column if not exists child_min_age int not null default 4;
alter table public.experiences add column if not exists child_max_age int not null default 11;
alter table public.experiences add column if not exists infants_allowed boolean not null default true;
alter table public.bookings add column if not exists infants int not null default 0;

-- Prices are calculated on the server so nobody can submit a fake price.
create or replace function public.bookings_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.experiences%rowtype;
begin
  if not public.is_admin() then
    new.status := 'pending';
    new.admin_notes := null;
    new.created_at := now();
    new.updated_at := now();
  end if;

  if new.trip_date < (now() at time zone 'Africa/Cairo')::date then
    raise exception 'Trip date must be today or later';
  end if;

  select * into t from public.experiences where id = new.experience_id;
  if not found then
    raise exception 'Unknown trip';
  end if;
  if not t.published and not public.is_admin() then
    raise exception 'Trip is not available';
  end if;
  if t.max_guests is not null and (new.adults + new.children + coalesce(new.infants, 0)) > t.max_guests then
    raise exception 'Too many guests for this trip';
  end if;
  if new.children > 0 and not t.children_allowed then
    raise exception 'Children are not allowed on this trip';
  end if;
  if coalesce(new.infants, 0) > 0 and not t.infants_allowed then
    raise exception 'Infants are not allowed on this trip';
  end if;
  if not public.is_admin() and exists (
    select 1 from public.blocked_dates b
    where b.day = new.trip_date and (b.experience_id is null or b.experience_id = new.experience_id)
  ) then
    raise exception 'Date not available';
  end if;

  new.destination_id := t.destination_id;
  new.experience_title := coalesce(t.content -> 'en' ->> 'title', t.id);
  new.unit_price := t.price;
  new.child_price := coalesce(t.child_price, round(t.price * 0.5));
  new.total_price := t.price * new.adults + coalesce(t.child_price, round(t.price * 0.5)) * new.children;
  new.currency := 'EGP';
  return new;
end;
$$;

drop trigger if exists bookings_before_insert on public.bookings;
create trigger bookings_before_insert
  before insert on public.bookings
  for each row execute function public.bookings_before_insert();

-- ---------------------------------------------------------------------
-- Visitor analytics (no IP addresses are stored)
-- ---------------------------------------------------------------------
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  session_id text not null,
  path text,
  destination_id text,
  experience_id text,
  country text,
  language text,
  referrer text,
  device text,
  created_at timestamptz not null default now()
);

create index if not exists visits_created_idx on public.visits (created_at desc);
create index if not exists visits_session_idx on public.visits (session_id);


-- ---------------------------------------------------------------------
-- Reviews: customers review after their trip (approved by an admin),
-- admins can also add reviews themselves.
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  experience_id text not null references public.experiences (id) on update cascade on delete cascade,
  booking_reference text unique,
  name text not null check (char_length(name) between 1 and 80),
  country text,
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 3 and 2000),
  language text,
  date_label text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  source text not null default 'customer' check (source in ('customer', 'admin', 'imported')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_experience_idx on public.reviews (experience_id, status, created_at desc);

-- Keep each trip's rating and review count in step with approved reviews.
create or replace function public.reviews_apply_rating(exp_id text, r int, delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if delta > 0 then
    update public.experiences
       set rating = round(((rating * review_count) + r) / (review_count + 1)::numeric, 1),
           review_count = review_count + 1
     where id = exp_id;
  else
    update public.experiences
       set rating = case when review_count > 1
                         then least(5, greatest(1, round(((rating * review_count) - r) / (review_count - 1)::numeric, 1)))
                         else rating end,
           review_count = greatest(review_count - 1, 0)
     where id = exp_id;
  end if;
end;
$$;

create or replace function public.reviews_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'approved' and new.source <> 'imported' then
      perform public.reviews_apply_rating(new.experience_id, new.rating, 1);
    end if;
  elsif tg_op = 'UPDATE' then
    if old.status = 'approved' and old.source <> 'imported' then
      perform public.reviews_apply_rating(old.experience_id, old.rating, -1);
    end if;
    if new.status = 'approved' and new.source <> 'imported' then
      perform public.reviews_apply_rating(new.experience_id, new.rating, 1);
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'approved' and old.source <> 'imported' then
      perform public.reviews_apply_rating(old.experience_id, old.rating, -1);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists reviews_after_change on public.reviews;
create trigger reviews_after_change
  after insert or update or delete on public.reviews
  for each row execute function public.reviews_after_change();

-- Public: check a booking reference before showing the review form.
create or replace function public.review_booking_info(ref text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  b public.bookings%rowtype;
  t public.experiences%rowtype;
begin
  select * into b from public.bookings where upper(reference) = upper(trim(ref));
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if exists (select 1 from public.reviews where booking_reference = b.reference) then
    return jsonb_build_object('ok', false, 'reason', 'already');
  end if;
  if b.status not in ('confirmed', 'completed') or b.trip_date > (now() at time zone 'Africa/Cairo')::date then
    return jsonb_build_object('ok', false, 'reason', 'not_yet');
  end if;
  select * into t from public.experiences where id = b.experience_id;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  return jsonb_build_object(
    'ok', true,
    'experience_id', t.id,
    'destination_id', t.destination_id,
    'titles', jsonb_build_object(
      'en', t.content -> 'en' ->> 'title', 'ar', t.content -> 'ar' ->> 'title',
      'fr', t.content -> 'fr' ->> 'title', 'de', t.content -> 'de' ->> 'title'),
    'photo', t.photos[1],
    'first_name', split_part(b.full_name, ' ', 1),
    'nationality', b.nationality
  );
end;
$$;

-- Public: submit a review for a finished booking (goes to admin approval).
create or replace function public.submit_review(ref text, p_rating int, p_comment text, p_name text, p_country text, p_language text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  info jsonb := public.review_booking_info(ref);
  b public.bookings%rowtype;
begin
  if not (info ->> 'ok')::boolean then
    return info;
  end if;
  select * into b from public.bookings where upper(reference) = upper(trim(ref));
  insert into public.reviews (experience_id, booking_reference, name, country, rating, comment, language, status, source)
  values (b.experience_id, b.reference, left(trim(coalesce(nullif(p_name, ''), split_part(b.full_name, ' ', 1))), 80),
          left(p_country, 2), p_rating, left(trim(p_comment), 2000), left(p_language, 5), 'pending', 'customer');
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.review_booking_info(text) to anon, authenticated;
grant execute on function public.submit_review(text, int, text, text, text, text) to anon, authenticated;
revoke all on function public.reviews_apply_rating(text, int, int) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists destinations_touch on public.destinations;
create trigger destinations_touch before update on public.destinations
  for each row execute function public.touch_updated_at();
drop trigger if exists experiences_touch on public.experiences;
create trigger experiences_touch before update on public.experiences
  for each row execute function public.touch_updated_at();
drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.destinations enable row level security;
alter table public.experiences enable row level security;
alter table public.bookings enable row level security;
alter table public.visits enable row level security;

alter table public.blocked_dates enable row level security;
alter table public.reviews enable row level security;

-- blocked dates: everyone can read (so the booking form can warn), admins manage
drop policy if exists "public read blocked dates" on public.blocked_dates;
create policy "public read blocked dates" on public.blocked_dates
  for select to anon, authenticated using (true);
drop policy if exists "admin write blocked dates" on public.blocked_dates;
create policy "admin write blocked dates" on public.blocked_dates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reviews: everyone reads approved ones, admins manage all (customers submit via submit_review)
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews
  for select to anon, authenticated using (status = 'approved' or public.is_admin());
drop policy if exists "admin write reviews" on public.reviews;
create policy "admin write reviews" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admins
drop policy if exists "admins read own" on public.admins;
create policy "admins read own" on public.admins
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- destinations
drop policy if exists "public read destinations" on public.destinations;
create policy "public read destinations" on public.destinations
  for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "admin write destinations" on public.destinations;
create policy "admin write destinations" on public.destinations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- experiences
drop policy if exists "public read experiences" on public.experiences;
create policy "public read experiences" on public.experiences
  for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "admin write experiences" on public.experiences;
create policy "admin write experiences" on public.experiences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- bookings: anyone can create a booking request, only admins can read/manage them
drop policy if exists "public create bookings" on public.bookings;
create policy "public create bookings" on public.bookings
  for insert to anon, authenticated with check (true);
drop policy if exists "admin read bookings" on public.bookings;
create policy "admin read bookings" on public.bookings
  for select to authenticated using (public.is_admin());
drop policy if exists "admin update bookings" on public.bookings;
create policy "admin update bookings" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete bookings" on public.bookings;
create policy "admin delete bookings" on public.bookings
  for delete to authenticated using (public.is_admin());

-- visits: anyone can record a visit, only admins can read
drop policy if exists "public insert visits" on public.visits;
create policy "public insert visits" on public.visits
  for insert to anon, authenticated with check (
    char_length(session_id) <= 64
    and (path is null or char_length(path) <= 300)
    and (referrer is null or char_length(referrer) <= 300)
  );
drop policy if exists "admin read visits" on public.visits;
create policy "admin read visits" on public.visits
  for select to authenticated using (public.is_admin());
drop policy if exists "admin delete visits" on public.visits;
create policy "admin delete visits" on public.visits
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage bucket for trip photos (public read, admin write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-images', 'trip-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = true;

drop policy if exists "public read trip images" on storage.objects;
create policy "public read trip images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'trip-images');
drop policy if exists "admin upload trip images" on storage.objects;
create policy "admin upload trip images" on storage.objects
  for insert to authenticated with check (bucket_id = 'trip-images' and public.is_admin());
drop policy if exists "admin update trip images" on storage.objects;
create policy "admin update trip images" on storage.objects
  for update to authenticated using (bucket_id = 'trip-images' and public.is_admin());
drop policy if exists "admin delete trip images" on storage.objects;
create policy "admin delete trip images" on storage.objects
  for delete to authenticated using (bucket_id = 'trip-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- Dashboard statistics (one call, computed on the server, admins only)
-- ---------------------------------------------------------------------
create or replace function public.admin_stats(days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since timestamptz := date_trunc('day', now() at time zone 'Africa/Cairo') at time zone 'Africa/Cairo'
                       - make_interval(days => greatest(days, 1) - 1);
  today timestamptz := date_trunc('day', now() at time zone 'Africa/Cairo') at time zone 'Africa/Cairo';
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'range_start', since,
    'page_views', (select count(*) from visits where created_at >= since),
    'visitors', (select count(distinct session_id) from visits where created_at >= since),
    'visitors_today', (select count(distinct session_id) from visits where created_at >= today),
    'page_views_today', (select count(*) from visits where created_at >= today),
    'countries_count', (select count(distinct country) from visits where created_at >= since and country is not null),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'views', d.views, 'visitors', d.visitors) order by d.day)
      from (
        select g.day::date as day,
               count(v.id) as views,
               count(distinct v.session_id) as visitors
        from generate_series(since at time zone 'Africa/Cairo', (now() at time zone 'Africa/Cairo'), interval '1 day') as g(day)
        left join visits v
          on (v.created_at at time zone 'Africa/Cairo')::date = g.day::date
        group by g.day::date
      ) d
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('country', c.country, 'visitors', c.visitors) order by c.visitors desc)
      from (
        select coalesce(country, '??') as country, count(distinct session_id) as visitors
        from visits where created_at >= since
        group by 1 order by 2 desc limit 25
      ) c
    ), '[]'::jsonb),
    'languages', coalesce((
      select jsonb_agg(jsonb_build_object('language', l.language, 'visitors', l.visitors) order by l.visitors desc)
      from (
        select coalesce(language, '??') as language, count(distinct session_id) as visitors
        from visits where created_at >= since group by 1
      ) l
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', x.device, 'visitors', x.visitors) order by x.visitors desc)
      from (
        select coalesce(device, 'unknown') as device, count(distinct session_id) as visitors
        from visits where created_at >= since group by 1
      ) x
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('referrer', r.referrer, 'visitors', r.visitors) order by r.visitors desc)
      from (
        select coalesce(nullif(referrer, ''), 'direct') as referrer, count(distinct session_id) as visitors
        from visits where created_at >= since group by 1 order by 2 desc limit 10
      ) r
    ), '[]'::jsonb),
    'top_trips', coalesce((
      select jsonb_agg(jsonb_build_object('experience_id', t.experience_id, 'views', t.views) order by t.views desc)
      from (
        select experience_id, count(*) as views
        from visits where created_at >= since and experience_id is not null
        group by 1 order by 2 desc limit 10
      ) t
    ), '[]'::jsonb),
    'bookings', jsonb_build_object(
      'total', (select count(*) from bookings where created_at >= since),
      'pending', (select count(*) from bookings where status = 'pending'),
      'confirmed', (select count(*) from bookings where created_at >= since and status = 'confirmed'),
      'completed', (select count(*) from bookings where created_at >= since and status = 'completed'),
      'cancelled', (select count(*) from bookings where created_at >= since and status = 'cancelled'),
      'revenue', (select coalesce(sum(total_price), 0) from bookings
                  where created_at >= since and status in ('confirmed', 'completed')),
      'guests', (select coalesce(sum(adults + children + infants), 0) from bookings
                 where created_at >= since and status <> 'cancelled'),
      'pending_reviews', (select count(*) from reviews where status = 'pending'),
      'upcoming', (select count(*) from bookings
                   where trip_date >= (now() at time zone 'Africa/Cairo')::date and status in ('pending', 'confirmed'))
    ),
    'bookings_daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', b.day, 'count', b.cnt) order by b.day)
      from (
        select (created_at at time zone 'Africa/Cairo')::date as day, count(*) as cnt
        from bookings where created_at >= since group by 1
      ) b
    ), '[]'::jsonb),
    'booking_nationalities', coalesce((
      select jsonb_agg(jsonb_build_object('country', n.nationality, 'bookings', n.cnt) order by n.cnt desc)
      from (
        select coalesce(nationality, '??') as nationality, count(*) as cnt
        from bookings where created_at >= since group by 1 order by 2 desc limit 15
      ) n
    ), '[]'::jsonb),
    'top_booked', coalesce((
      select jsonb_agg(jsonb_build_object('experience_id', b.experience_id, 'title', b.title, 'bookings', b.cnt, 'guests', b.guests) order by b.cnt desc)
      from (
        select experience_id, max(experience_title) as title, count(*) as cnt, sum(adults + children) as guests
        from bookings where created_at >= since and status <> 'cancelled'
        group by 1 order by 3 desc limit 10
      ) b
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;

-- ---------------------------------------------------------------------
-- After creating your admin user (Authentication → Users → Add user),
-- make it an admin by running (replace the email):
--
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'admin@example.com';
-- ---------------------------------------------------------------------
