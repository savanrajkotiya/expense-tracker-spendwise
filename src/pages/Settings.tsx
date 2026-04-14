import { useState } from 'react'
import { Moon, Sun, LogOut, User, Palette, DollarSign, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { CURRENCIES } from '@/lib/constants'
import styles from './Settings.module.scss'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { currency, setCurrency, formatAmount } = useCurrency()
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const hasChanged = selectedCurrency !== currency

  const previewFormat = (amount: number) => {
    const cur = CURRENCIES.find(c => c.code === selectedCurrency)
    if (!cur) return formatAmount(amount)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleUpdateCurrency = () => {
    setCurrency(selectedCurrency)
  }

  const displayName = user?.user_metadata?.full_name || 'User'
  const email = user?.email || ''

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              <User size={24} />
            </div>
            <div>
              <p className={styles.name}>{displayName}</p>
              <p className={styles.email}>{email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <DollarSign size={18} />
            <span>Currency</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={styles.sectionDesc}>
            All amounts, budgets, and splits will display in this currency.
          </p>
          <div className={styles.currencyPreview}>
            Preview: <strong>{previewFormat(1234.56)}</strong>
            {hasChanged && <span className={styles.unsaved}>unsaved</span>}
          </div>
          <div className={styles.currencyGrid}>
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                className={`${styles.currencyOption} ${selectedCurrency === c.code ? styles.currencyActive : ''}`}
                onClick={() => setSelectedCurrency(c.code)}
              >
                <span className={styles.currencySymbol}>{c.symbol}</span>
                <span className={styles.currencyCode}>{c.code}</span>
                <span className={styles.currencyName}>{c.name}</span>
              </button>
            ))}
          </div>
          {hasChanged && (
            <div className={styles.currencyActions}>
              <Button onClick={handleUpdateCurrency} icon={<Check size={16} />}>
                Update Currency
              </Button>
              <Button variant="secondary" onClick={() => setSelectedCurrency(currency)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Palette size={18} />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.themeRow}>
            <button
              className={`${styles.themeOption} ${theme === 'light' ? styles.themeActive : ''}`}
              onClick={() => setTheme('light')}
            >
              <Sun size={20} />
              <span>Light</span>
            </button>
            <button
              className={`${styles.themeOption} ${theme === 'dark' ? styles.themeActive : ''}`}
              onClick={() => setTheme('dark')}
            >
              <Moon size={20} />
              <span>Dark</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="danger" icon={<LogOut size={18} />} onClick={signOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
