-- This function seeds default categories for new users.
-- Hook it to auth.users via a trigger in Supabase dashboard,
-- or call it manually after signup.

create or replace function public.seed_default_categories(uid uuid)
returns void as $$
begin
  insert into public.categories (user_id, name, icon, color, is_default) values
    (uid, 'Food & Dining',    '🍔', '#f97316', true),
    (uid, 'Transport',        '🚗', '#3b82f6', true),
    (uid, 'Shopping',         '🛍️', '#ec4899', true),
    (uid, 'Entertainment',    '🎬', '#8b5cf6', true),
    (uid, 'Bills & Utilities','📄', '#6366f1', true),
    (uid, 'Health',           '💊', '#ef4444', true),
    (uid, 'Education',        '📚', '#14b8a6', true),
    (uid, 'Travel',           '✈️', '#06b6d4', true),
    (uid, 'Groceries',        '🛒', '#22c55e', true),
    (uid, 'Subscriptions',    '📱', '#a855f7', true),
    (uid, 'Other',            '📌', '#64748b', true);
end;
$$ language plpgsql security definer;

-- Trigger to auto-seed categories on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  perform public.seed_default_categories(new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
