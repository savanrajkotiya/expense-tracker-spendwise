-- Categories table
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

create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Expenses table
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

create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger expenses_updated_at
  before update on public.expenses
  for each row execute function public.update_updated_at();

-- Budgets table
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade,
  amount_limit numeric(12,2) not null check (amount_limit > 0),
  period text not null check (period in ('daily','weekly','monthly')),
  created_at timestamptz default now() not null
);

alter table public.budgets enable row level security;

create policy "Users can view their own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- Splits table
create table public.splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  participant_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  is_settled boolean default false,
  created_at timestamptz default now() not null
);

alter table public.splits enable row level security;

create policy "Users can view splits for their expenses"
  on public.splits for select
  using (
    exists (
      select 1 from public.expenses
      where expenses.id = splits.expense_id
      and expenses.user_id = auth.uid()
    )
  );

create policy "Users can insert splits for their expenses"
  on public.splits for insert
  with check (
    exists (
      select 1 from public.expenses
      where expenses.id = splits.expense_id
      and expenses.user_id = auth.uid()
    )
  );

create policy "Users can update splits for their expenses"
  on public.splits for update
  using (
    exists (
      select 1 from public.expenses
      where expenses.id = splits.expense_id
      and expenses.user_id = auth.uid()
    )
  );

create policy "Users can delete splits for their expenses"
  on public.splits for delete
  using (
    exists (
      select 1 from public.expenses
      where expenses.id = splits.expense_id
      and expenses.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index idx_expenses_user_date on public.expenses(user_id, date desc);
create index idx_expenses_category on public.expenses(category_id);
create index idx_categories_user on public.categories(user_id);
create index idx_budgets_user on public.budgets(user_id);
create index idx_splits_expense on public.splits(expense_id);
