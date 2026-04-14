import styles from './Progress.module.scss'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function Progress({ value, max = 100, variant = 'default', size = 'md', showLabel, className }: ProgressProps) {
  const pct = Math.min((value / max) * 100, 100)
  const autoVariant = variant === 'default'
    ? pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success'
    : variant

  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={cn(styles.track, styles[size])}>
        <div
          className={cn(styles.fill, styles[autoVariant])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.label}>{Math.round(pct)}%</span>
      )}
    </div>
  )
}
