import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface CurrencyContextValue {
  currency: string
  setCurrency: (c: string) => void
  formatAmount: (amount: number) => string
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

const LOCALE_CURRENCY_MAP: Record<string, string> = {
  US: 'USD', GB: 'GBP', IN: 'INR', JP: 'JPY', CN: 'CNY', DE: 'EUR', FR: 'EUR',
  IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', IE: 'EUR',
  FI: 'EUR', GR: 'EUR', CA: 'CAD', AU: 'AUD', NZ: 'NZD', SG: 'SGD', AE: 'AED',
  SA: 'SAR', BR: 'BRL', MX: 'MXN', KR: 'KRW', TH: 'THB', ID: 'IDR', MY: 'MYR',
  PH: 'PHP', ZA: 'ZAR', NG: 'NGN', EG: 'EGP', TR: 'TRY', RU: 'RUB', SE: 'SEK',
  NO: 'NOK', DK: 'DKK', CH: 'CHF', PK: 'PKR', BD: 'BDT', LK: 'LKR',
}

function detectBrowserCurrency(): string {
  try {
    const locale = navigator.language || navigator.languages?.[0] || 'en-US'
    const region = locale.split('-')[1]?.toUpperCase()
    if (region && LOCALE_CURRENCY_MAP[region]) return LOCALE_CURRENCY_MAP[region]
  } catch { /* fall through */ }
  return 'INR'
}

function getCachedCurrency(): string {
  return localStorage.getItem('currency') || detectBrowserCurrency()
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currency, setCurrencyState] = useState(getCachedCurrency)
  const [loading, setLoading] = useState(false)
  const didFetch = useRef(false)

  // Fetch user's saved currency from Supabase on login
  useEffect(() => {
    if (!user) {
      didFetch.current = false
      return
    }
    if (didFetch.current) return
    didFetch.current = true

    setLoading(true)
    supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.currency) {
          setCurrencyState(data.currency)
          localStorage.setItem('currency', data.currency)
        }
        setLoading(false)
      })
  }, [user])

  const setCurrency = useCallback(
    (c: string) => {
      setCurrencyState(c)
      localStorage.setItem('currency', c)

      // Persist to Supabase in the background
      if (user) {
        supabase
          .from('user_preferences')
          .upsert({ user_id: user.id, currency: c }, { onConflict: 'user_id' })
          .then(({ error }) => {
            if (error) console.error('Failed to save currency preference:', error)
          })
      }
    },
    [user],
  )

  const formatAmount = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(navigator.language || 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(amount),
    [currency],
  )

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
