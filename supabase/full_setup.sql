-- =============================================
-- FULL DATABASE SETUP (safe to run from scratch)
-- =============================================

-- 1. Drop tables first (CASCADE removes their triggers + policies)
drop table if exists public.splits cascade;
drop table if exists public.expenses cascade;
drop table if exists public.budgets cascade;
drop table if exists public.categories cascade;
drop table if exists public.user_preferences cascade;

-- 2. Drop the auth trigger (auth.users always exists)
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Drop functions
drop function if exists public.update_updated_at();
drop function if exists public.seed_default_categories(uuid);
drop function if exists public.handle_new_user();

-- 4. Helper function: auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5. Categories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default '📌',
  color text not null default '#64748b',
  is_default boolean default false,
  created_at timestamptz default now() not null
);
alter table public.categories enable row level security;
create policy "Users can view their own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on public.categories for delete using (auth.uid() = user_id);
create index idx_categories_user on public.categories(user_id);

-- 6. Expenses
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  note text,
  date date not null default current_date,
  is_recurring boolean default false,
  recurring_frequency text check (recurring_frequency in ('daily','weekly','monthly','yearly')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.expenses enable row level security;
create policy "Users can view their own expenses" on public.expenses for select using (auth.uid() = user_id);
create policy "Users can insert their own expenses" on public.expenses for insert with check (auth.uid() = user_id);
create policy "Users can update their own expenses" on public.expenses for update using (auth.uid() = user_id);
create policy "Users can delete their own expenses" on public.expenses for delete using (auth.uid() = user_id);
create trigger expenses_updated_at before update on public.expenses for each row execute function public.update_updated_at();
create index idx_expenses_user_date on public.expenses(user_id, date desc);
create index idx_expenses_category on public.expenses(category_id);

-- 7. Budgets
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade,
  amount_limit numeric(12,2) not null check (amount_limit > 0),
  period text not null check (period in ('daily','weekly','monthly')),
  created_at timestamptz default now() not null
);
alter table public.budgets enable row level security;
create policy "Users can view their own budgets" on public.budgets for select using (auth.uid() = user_id);
create policy "Users can insert their own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users can update their own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users can delete their own budgets" on public.budgets for delete using (auth.uid() = user_id);
create index idx_budgets_user on public.budgets(user_id);

-- 8. Splits
create table public.splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  participant_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  is_settled boolean default false,
  created_at timestamptz default now() not null
);
alter table public.splits enable row level security;
create policy "Users can view splits for their expenses" on public.splits for select using (exists (select 1 from public.expenses where expenses.id = splits.expense_id and expenses.user_id = auth.uid()));
create policy "Users can insert splits for their expenses" on public.splits for insert with check (exists (select 1 from public.expenses where expenses.id = splits.expense_id and expenses.user_id = auth.uid()));
create policy "Users can update splits for their expenses" on public.splits for update using (exists (select 1 from public.expenses where expenses.id = splits.expense_id and expenses.user_id = auth.uid()));
create policy "Users can delete splits for their expenses" on public.splits for delete using (exists (select 1 from public.expenses where expenses.id = splits.expense_id and expenses.user_id = auth.uid()));
create index idx_splits_expense on public.splits(expense_id);

-- 9. User preferences
create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  currency text not null default 'INR',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.user_preferences enable row level security;
create policy "Users can view their own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert their own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update their own preferences" on public.user_preferences for update using (auth.uid() = user_id);
create trigger user_preferences_updated_at before update on public.user_preferences for each row execute function public.update_updated_at();
create index idx_user_preferences_user on public.user_preferences(user_id);

-- 10. Seed default categories for new users
create or replace function public.seed_default_categories(uid uuid)
returns void as $$
begin
  insert into public.categories (user_id, name, icon, color, is_default) values
    (uid, 'Food & Dining',     '🍔', '#f97316', true),
    (uid, 'Transport',         '🚗', '#3b82f6', true),
    (uid, 'Shopping',          '🛍️', '#ec4899', true),
    (uid, 'Entertainment',     '🎬', '#8b5cf6', true),
    (uid, 'Bills & Utilities', '📄', '#6366f1', true),
    (uid, 'Health',            '💊', '#ef4444', true),
    (uid, 'Education',         '📚', '#14b8a6', true),
    (uid, 'Travel',            '✈️', '#06b6d4', true),
    (uid, 'Groceries',         '🛒', '#22c55e', true),
    (uid, 'Subscriptions',     '📱', '#a855f7', true),
    (uid, 'Other',             '📌', '#64748b', true);
end;
$$ language plpgsql security definer;

-- 11. Signup trigger: seed categories + create preferences
create or replace function public.handle_new_user()
returns trigger as $$
begin
  perform public.seed_default_categories(new.id);
  insert into public.user_preferences (user_id, currency) values (new.id, 'INR');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 12. Wipe old users for a fresh start
delete from auth.users;
