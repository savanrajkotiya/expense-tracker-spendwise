-- User preferences table (currency, future settings)
create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  currency text not null default 'INR',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.user_preferences enable row level security;

create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.update_updated_at();

-- Auto-create preferences row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  perform public.seed_default_categories(new.id);
  insert into public.user_preferences (user_id, currency) values (new.id, 'INR');
  return new;
end;
$$ language plpgsql security definer;

create index idx_user_preferences_user on public.user_preferences(user_id);
