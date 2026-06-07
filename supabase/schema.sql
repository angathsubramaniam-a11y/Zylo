create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.product_condition as enum ('New', 'Like New', 'Good', 'Used');
create type public.order_status as enum ('pending', 'paid', 'completed', 'cancelled');
create type public.payout_status as enum ('pending', 'paid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  campus text,
  role public.user_role not null default 'buyer',
  verified_student boolean not null default false,
  premium_seller boolean not null default false,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  joined_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price integer not null check (price > 0),
  original_price integer,
  category text not null,
  condition public.product_condition not null,
  location text,
  image_url text,
  image_urls text[] not null default '{}',
  tags text[] not null default '{}',
  featured boolean not null default false,
  trending boolean not null default false,
  sold boolean not null default false,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.wishlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  product_id uuid not null references public.products(id),
  amount integer not null,
  platform_commission integer not null,
  seller_earnings integer not null,
  razorpay_order_id text,
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id),
  order_id uuid references public.orders(id),
  amount integer not null,
  commission integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id),
  amount integer not null,
  status public.payout_status not null default 'pending',
  marked_paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  image_url text,
  seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id),
  buyer_id uuid not null references public.profiles(id),
  rating integer not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payouts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

create policy "Verified students can read products"
  on public.products for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.verified_student = true));

create policy "Sellers can manage own products"
  on public.products for all
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Users can manage own wishlist"
  on public.wishlists for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Conversation members can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
