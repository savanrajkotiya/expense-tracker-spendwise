import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Tags,
  PiggyBank,
  Split,
  FileBarChart,
  Settings,
} from 'lucide-react'
import styles from './Sidebar.module.scss'
import { APP_NAME } from '@/lib/constants'
import { BrandMark } from '@/components/brand/BrandMark'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/expenses/new', icon: PlusCircle, label: 'Add Expense' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/splits', icon: Split, label: 'Split Bills' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <BrandMark size={34} />
        <span className={styles.logoText}>{APP_NAME}</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
