import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/lib/constants'
import { BrandMark } from '@/components/brand/BrandMark'
import styles from './Auth.module.scss'

interface LocationState {
  flash?: string
  prefillEmail?: string
}

export default function Login() {
  const { user, signIn } = useAuth()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [email, setEmail] = useState(state?.prefillEmail || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(state?.flash || '')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFlash('')
    setLoading(true)

    const { error: err } = await signIn(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <BrandMark size={64} className={styles.logo} />
          <h1 className={styles.title}>{APP_NAME}</h1>
          <p className={styles.subtitle}>Welcome back! Sign in to continue.</p>
        </div>

        {flash && <div className={styles.warning}>{flash}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <p className={styles.forgotLink}>
          <Link to="/forgot-password" className={styles.link}>Forgot your password?</Link>
        </p>

        <p className={styles.footerText}>
          Don't have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
