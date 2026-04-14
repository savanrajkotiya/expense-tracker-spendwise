import { Moon, Sun, Bell, LogOut } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/utils'
import styles from './Header.module.scss'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  const displayName = user?.user_metadata?.full_name || user?.email || 'User'

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title || 'Dashboard'}</h1>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button className={styles.iconBtn} onClick={signOut} aria-label="Sign out">
          <LogOut size={20} />
        </button>
        <div className={styles.avatar} title={displayName}>
          <span>{getInitials(displayName)}</span>
        </div>
      </div>
    </header>
  )
}
