# SpendX - Daily Expense Tracker

A responsive PWA for tracking daily expenses,built with React, TypeScript, SCSS Modules, and Supabase.

## Features

- **Dashboard** -- Summary cards, spending trend chart, category breakdown pie chart, recent transactions
- **Expense Tracking** -- Add, edit, delete expenses with categories, dates, and notes
- **Categories** -- Customizable categories with emoji icons and colors
- **Budgets** -- Set daily/weekly/monthly spending limits with progress tracking
- **Split Expenses** -- Split bills with others and track settlement status
- **Reports & Export** -- Export expenses as Excel/CSV or PDF
- **Dark Mode** -- Full light/dark theme support
- **Responsive** -- Sidebar on desktop, bottom navigation on mobile
- **PWA** -- Installable, offline-friendly manifest

## Tech Stack

- **React 19** + TypeScript + Vite 8
- **SCSS Modules** -- Scoped, zero-runtime CSS
- **Supabase** -- PostgreSQL, Auth, Row Level Security
- **TanStack Query** -- Server state management
- **Recharts** -- Charts and visualizations
- **React Hook Form** -- Form validation
- **date-fns** -- Date utilities
- **Lucide React** -- Icons
- **xlsx + jsPDF** -- Data export

## Getting Started

### 1. Clone & install

```bash
cd expense-tracker
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in `supabase/migrations/` via the Supabase SQL editor
3. Copy your project URL and anon key into `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Project Structure

```
src/
  components/
    layout/     -- AppShell, Sidebar, Header, BottomNav
    ui/         -- Button, Card, Input, Dialog, etc.
  contexts/     -- ThemeContext, AuthContext
  hooks/        -- useExpenses, useCategories, useBudgets, useDashboard
  lib/          -- Supabase client, utilities, constants, export
  pages/        -- Route-level page components
  styles/       -- Global SCSS (variables, mixins, theme, reset)
  types/        -- TypeScript type definitions
supabase/
  migrations/   -- SQL schema and seed files
```
