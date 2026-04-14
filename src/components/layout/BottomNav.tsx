import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PlusCircle, PiggyBank, Settings } from 'lucide-react'
import styles from './BottomNav.module.scss'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/expenses/new', icon: PlusCircle, label: 'Add' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/settings', icon: Settings, label: 'More' },
]

export function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
        >
          <Icon size={22} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
