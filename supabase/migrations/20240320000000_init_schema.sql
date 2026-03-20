-- Enable extensions
create extension if not exists postgis;

-- Tabel provinsi (GIS data dari indonesia-geojson repo)
create table provinsi (
  id     serial primary key,
  name   text not null unique,
  geom   geometry(MultiPolygon, 4326)
);

-- Tabel profiles
create table profiles (
  id               uuid primary key references auth.users(id),
  wallet           text unique not null,
  is_verified_org  boolean default false,
  reputation       integer default 0,
  created_at       timestamp with time zone default now()
);

-- Tabel reports (independent dari sayembara)
create table reports (
  id               uuid default gen_random_uuid() primary key,
  reporter_wallet  text not null,
  category         text not null,          -- 'pothole' | 'crime'
  provinsi_id      integer references provinsi(id),
  lat              numeric not null,        -- dari EXIF foto
  lng              numeric not null,        -- dari EXIF foto
  photo_url        text not null,           -- Supabase Storage URL
  upvote_count     integer default 0,
  status           text default 'pending', -- 'pending' | 'confirmed' | 'rejected'
  solana_tx        text,                   -- TX hash setelah confirmed
  created_at       timestamp with time zone default now()
);

-- Tabel sayembara
create table sayembaras (
  id                uuid default gen_random_uuid() primary key,
  author_wallet     text not null,
  title             text not null,
  category          text not null,          -- 'pothole' | 'crime' | 'both'
  provinsi_id       integer references provinsi(id) not null,
  total_deposit     numeric not null,        -- dalam SOL
  deadline          timestamp with time zone not null,
  status            text default 'active',  -- 'active' | 'distributed'
  confirmed_count   integer default 0,
  reward_per_report numeric,                -- dikalkulasi saat distribute
  distribute_tx     text,
  solana_escrow_pda text not null,
  created_at       timestamp with time zone default now()
);

-- Tabel sayembara_confirmations
create table sayembara_confirmations (
  id             uuid default gen_random_uuid() primary key,
  sayembara_id   uuid references sayembaras(id),
  report_id      uuid references reports(id),
  confirmed_at   timestamp with time zone default now(),
  unique(sayembara_id, report_id)
);

-- Tabel votes
create table votes (
  id            uuid default gen_random_uuid() primary key,
  report_id     uuid references reports(id),
  voter_wallet  text not null,
  created_at    timestamp with time zone default now(),
  unique(report_id, voter_wallet)
);

-- Tabel auth_nonces (wallet auth)
create table auth_nonces (
  id         uuid default gen_random_uuid() primary key,
  wallet     text not null,
  nonce      text not null unique,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- PostGIS RPC Functions

-- Query reports dalam radius N km
create or replace function get_reports_nearby(
  user_lat numeric, user_lng numeric, radius_km numeric default 5
)
returns setof reports language sql as $$
  select * from reports
  where ST_DWithin(
    ST_SetSRID(ST_Point(lng, lat), 4326)::geography,
    ST_SetSRID(ST_Point(user_lng, user_lat), 4326)::geography,
    radius_km * 1000
  )
  order by created_at desc;
$$;

-- Query reports dalam satu provinsi, sorted by upvote
create or replace function get_reports_by_province(province_name text)
returns setof reports language sql as $$
  select r.* from reports r
  join provinsi p on ST_Contains(
    p.geom,
    ST_SetSRID(ST_Point(r.lng, r.lat), 4326)
  )
  where p.name = province_name
  order by r.upvote_count desc;
$$;

-- Check apakah titik dalam radius N km dari titik lain
create or replace function check_within_radius(
  point_lat numeric, point_lng numeric,
  target_lat numeric, target_lng numeric,
  radius_km numeric
)
returns boolean language sql as $$
  select ST_DWithin(
    ST_SetSRID(ST_Point(point_lng, point_lat), 4326)::geography,
    ST_SetSRID(ST_Point(target_lng, target_lat), 4326)::geography,
    radius_km * 1000
  );
$$;

-- Row Level Security (RLS)

-- Reports
alter table reports enable row level security;

create policy "Public read reports"
on reports for select using (true);

create policy "Authenticated reporter can insert"
on reports for insert
with check (reporter_wallet = auth.jwt() ->> 'wallet');

create policy "Sayembara author can confirm reports"
on reports for update
using (
  exists (
    select 1 from sayembaras s
    where s.author_wallet = auth.jwt() ->> 'wallet'
    and s.status = 'active'
  )
);

-- Sayembaras
alter table sayembaras enable row level security;

create policy "Public read active sayembaras"
on sayembaras for select using (true);

create policy "Verified org can create sayembara"
on sayembaras for insert
with check (
  exists (
    select 1 from profiles
    where wallet = auth.jwt() ->> 'wallet'
    and is_verified_org = true
  )
);

create policy "Author can update own sayembara"
on sayembaras for update
using (author_wallet = auth.jwt() ->> 'wallet');

-- Votes
alter table votes enable row level security;

create policy "Public read votes"
on votes for select using (true);

create policy "Authenticated user can vote"
on votes for insert
with check (voter_wallet = auth.jwt() ->> 'wallet');
