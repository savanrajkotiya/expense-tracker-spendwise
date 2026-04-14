import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import styles from './AppShell.module.scss'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/expenses/new': 'Add Expense',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/splits': 'Split Bills',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function AppShell() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'SpendWise'

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header title={title} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
