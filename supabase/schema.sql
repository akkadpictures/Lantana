-- LANTANA — PostgreSQL schema for Supabase.
-- Run this first in the Supabase SQL editor, then run seed.sql.

create extension if not exists "pgcrypto";

create table if not exists products (
  id text primary key,
  slug text unique not null,
  name jsonb not null,
  tagline jsonb not null default '{}',
  description jsonb not null default '{}',
  size text not null default '50 ml',
  concentration text not null default 'Eau de Parfum',
  collection text not null default 'signature',
  notes jsonb not null default '{}',
  accord jsonb not null default '{}',
  image text not null,
  gallery jsonb not null default '[]',
  base_price_usd numeric not null default 0,
  prices jsonb not null default '{}',        -- per-currency overrides e.g. {"SYP":1950000,"AED":495}
  inventory integer not null default 0,
  featured boolean not null default false,
  hero boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists collections (
  id text primary key,
  slug text unique not null,
  name jsonb not null,
  description jsonb not null default '{}',
  image text not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  status text not null default 'pending',
  payment_method text not null,
  currency text not null,
  country text not null,
  subtotal numeric not null,
  shipping numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  coupon_code text,
  customer jsonb not null,
  items jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

create table if not exists coupons (
  code text primary key,
  type text not null check (type in ('percent','fixed')),
  value numeric not null,
  active boolean not null default true,
  min_subtotal_usd numeric not null default 0
);

create table if not exists shipping_rates (
  country text primary key,
  label jsonb not null,
  price_usd numeric not null,
  eta_min integer not null,
  eta_max integer not null
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews (product_id);

create table if not exists blog_posts (
  id text primary key,
  slug text unique not null,
  title jsonb not null,
  excerpt jsonb not null default '{}',
  body jsonb not null default '{}',
  image text not null,
  published_at timestamptz not null default now()
);

create table if not exists newsletter (
  email text primary key,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────
-- The app's server uses the SERVICE ROLE key, which bypasses RLS.
-- These policies only affect the public ANON key (used nowhere sensitive here),
-- allowing read-only access to the public catalog.
alter table products enable row level security;
alter table collections enable row level security;
alter table blog_posts enable row level security;
alter table reviews enable row level security;
alter table shipping_rates enable row level security;
alter table orders enable row level security;
alter table coupons enable row level security;
alter table newsletter enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products" on products for select using (status = 'active');

drop policy if exists "public read collections" on collections;
create policy "public read collections" on collections for select using (true);

drop policy if exists "public read posts" on blog_posts;
create policy "public read posts" on blog_posts for select using (true);

drop policy if exists "public read approved reviews" on reviews;
create policy "public read approved reviews" on reviews for select using (approved = true);

drop policy if exists "public read shipping" on shipping_rates;
create policy "public read shipping" on shipping_rates for select using (true);
-- orders, coupons, newsletter: no anon policies → service role only.
