-- TableFlow 3D — schéma cible pour une future migration vers Supabase.
-- Le prototype actuel n'utilise PAS ce schéma : il fonctionne entièrement en local (localStorage).
-- Les tables reprennent les types de src/types.ts.

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table memberships (
  restaurant_id uuid references restaurants on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('manager', 'server')),
  primary key (restaurant_id, user_id)
);

-- Plan de salle : un objet par meuble / mur / zone
create table layout_items (
  id text primary key,
  restaurant_id uuid not null references restaurants on delete cascade,
  kind text not null,
  x real not null, z real not null, rotation real not null default 0,
  w real not null, d real not null, h real,
  props jsonb not null default '{}' -- number, shape, capacity, seating, zoneType, name…
);

create table table_service (
  table_id text primary key references layout_items on delete cascade,
  restaurant_id uuid not null references restaurants on delete cascade,
  status text not null check (status in ('available','reserved','occupied','cleaning','blocked')),
  guests int not null default 0,
  seated_at timestamptz,
  waiter_id uuid,
  customer_id uuid,
  reservation_id uuid,
  changed_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants on delete cascade,
  name text not null, phone text, email text,
  preferences text, allergies text, vip boolean not null default false,
  prior_visits int not null default 0,
  created_at timestamptz not null default now()
);

-- Notes internes séparées : lisibles uniquement par les responsables (RLS)
create table customer_private_notes (
  customer_id uuid primary key references customers on delete cascade,
  restaurant_id uuid not null references restaurants on delete cascade,
  notes text not null default ''
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants on delete cascade,
  customer_id uuid references customers on delete set null,
  table_id text references layout_items on delete set null,
  starts_at timestamptz not null,
  duration_min int not null default 90,
  party_size int not null,
  status text not null check (status in ('pending','confirmed','seated','completed','cancelled','noshow')),
  note text,
  created_at timestamptz not null default now()
);

-- Empêche deux réservations actives qui se chevauchent sur la même table
create extension if not exists btree_gist;
alter table reservations add constraint no_overlap exclude using gist (
  table_id with =,
  tstzrange(starts_at, starts_at + make_interval(mins => duration_min)) with &&
) where (status in ('pending','confirmed','seated'));

create table sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants on delete cascade,
  table_id text, started_at timestamptz not null, ended_at timestamptz not null,
  guests int not null, waiter_id uuid, customer_id uuid
);

-- Row Level Security : chaque membre ne voit que son restaurant
alter table layout_items enable row level security;
alter table table_service enable row level security;
alter table customers enable row level security;
alter table customer_private_notes enable row level security;
alter table reservations enable row level security;
alter table sessions enable row level security;

create function is_member(r uuid) returns boolean language sql security definer stable as $$
  select exists (select 1 from memberships m where m.restaurant_id = r and m.user_id = auth.uid())
$$;
create function is_manager(r uuid) returns boolean language sql security definer stable as $$
  select exists (select 1 from memberships m where m.restaurant_id = r and m.user_id = auth.uid() and m.role = 'manager')
$$;

create policy member_all on layout_items for all using (is_member(restaurant_id));
create policy member_all on table_service for all using (is_member(restaurant_id));
create policy member_all on customers for all using (is_member(restaurant_id));
create policy member_all on reservations for all using (is_member(restaurant_id));
create policy member_all on sessions for all using (is_member(restaurant_id));
create policy manager_only on customer_private_notes for all using (is_manager(restaurant_id));
