-- Finish MVP schema
-- Run this in the Supabase SQL editor after creating a new project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  taste_profile_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,24}$')
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  title text,
  description text,
  thumbnail_url text,
  platform text,
  content_type text,
  estimated_duration integer,
  rating integer not null check (rating between 1 and 5),
  comment text,
  category text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.taste_dna (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  knowledge integer not null default 0,
  entertainment integer not null default 0,
  practical integer not null default 0,
  emotional integer not null default 0,
  trend integer not null default 0,
  longform integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists posts_user_created_idx on public.posts (user_id, created_at desc);
create index if not exists posts_platform_idx on public.posts (platform);
create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_tags_idx on public.posts using gin (tags);
create index if not exists likes_post_idx on public.likes (post_id);
create index if not exists bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(regexp_replace(lower(new.raw_user_meta_data->>'username'), '[^a-z0-9_]', '', 'g'), ''),
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    left(base_username, 24),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.taste_dna (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_for_new_user on auth.users;
create trigger create_profile_for_new_user
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace view public.post_stats as
select
  p.id as post_id,
  count(distinct l.id)::integer as like_count,
  count(distinct b.id)::integer as bookmark_count
from public.posts p
left join public.likes l on l.post_id = p.id
left join public.bookmarks b on b.post_id = p.id
group by p.id;

create or replace view public.profile_stats as
select
  profiles.id as user_id,
  count(posts.id)::integer as finish_count,
  coalesce(avg(posts.rating), 0)::numeric(10,2) as average_rating,
  coalesce(sum(coalesce(posts.estimated_duration, 0)), 0)::integer as total_minutes
from public.profiles
left join public.posts on posts.user_id = profiles.id
group by profiles.id;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.taste_dna enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users insert their own profile" on public.profiles;
create policy "Users insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Posts are public" on public.posts;
create policy "Posts are public"
on public.posts for select
using (true);

drop policy if exists "Users create their own posts" on public.posts;
create policy "Users create their own posts"
on public.posts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update their own posts" on public.posts;
create policy "Users update their own posts"
on public.posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete their own posts" on public.posts;
create policy "Users delete their own posts"
on public.posts for delete
using (auth.uid() = user_id);

drop policy if exists "Likes are public" on public.likes;
create policy "Likes are public"
on public.likes for select
using (true);

drop policy if exists "Users manage their own likes" on public.likes;
create policy "Users manage their own likes"
on public.likes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Bookmarks are visible to owner" on public.bookmarks;
create policy "Bookmarks are visible to owner"
on public.bookmarks for select
using (auth.uid() = user_id);

drop policy if exists "Users manage their own bookmarks" on public.bookmarks;
create policy "Users manage their own bookmarks"
on public.bookmarks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Taste DNA follows profile visibility" on public.taste_dna;
create policy "Taste DNA follows profile visibility"
on public.taste_dna for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles
    where profiles.id = taste_dna.user_id
      and profiles.taste_profile_public = true
  )
);

drop policy if exists "Users manage their own Taste DNA" on public.taste_dna;
create policy "Users manage their own Taste DNA"
on public.taste_dna for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
