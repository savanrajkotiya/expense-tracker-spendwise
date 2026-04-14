import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import styles from './Auth.module.scss'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
        setChecking(false)
      }
    })

    // Also check if there's already a session (user may have arrived with valid token)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      }
      setChecking(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error: err } = await updatePassword(password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      navigate('/login', {
        state: { flash: 'Password updated successfully! Please sign in with your new password.' },
      })
    }
  }

  if (checking) {
    return (
      <div className={styles.wrapper}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (!ready) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}>⚠️</span>
            <h1 className={styles.title}>Invalid or Expired Link</h1>
            <p className={styles.subtitle}>
              This password reset link is no longer valid. Please request a new one.
            </p>
          </div>
          <p className={styles.footerText}>
            <Link to="/forgot-password" className={styles.link}>Request New Reset Link</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>🔒</span>
          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>Enter your new password below.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" fullWidth loading={loading} icon={<Lock size={16} />}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  )
}
