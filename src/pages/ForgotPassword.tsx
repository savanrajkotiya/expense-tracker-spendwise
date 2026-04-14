import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Auth.module.scss'

export default function ForgotPassword() {
  const { user, resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await resetPasswordForEmail(email)
    if (err) {
      setError(err)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}>📬</span>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.subtitle}>
              We sent a password reset link to <strong>{email}</strong>.
              Click the link in the email to set a new password.
            </p>
          </div>
          <p className={styles.footerText}>
            <Link to="/login" className={styles.link}>Back to Sign In</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>🔑</span>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

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
          <Button type="submit" fullWidth loading={loading} icon={<Mail size={16} />}>
            Send Reset Link
          </Button>
        </form>

        <p className={styles.footerText}>
          <Link to="/login" className={`${styles.link} ${styles.backLink}`}>
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
