import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/lib/constants'
import { BrandMark } from '@/components/brand/BrandMark'
import styles from './Auth.module.scss'

export default function Signup() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signUp(email, password, name)
    if (result.existingUser) {
      navigate('/login', {
        state: {
          flash: 'An account with this email already exists. Please sign in or reset your password.',
          prefillEmail: email,
        },
      })
      return
    }
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}>📬</span>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.subtitle}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
            </p>
          </div>
          <p className={styles.footerText}>
            <Link to="/login" className={styles.link}>Go to Sign In</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <BrandMark size={64} className={styles.logo} />
          <h1 className={styles.title}>{APP_NAME}</h1>
          <p className={styles.subtitle}>Create your account to start tracking.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
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
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
