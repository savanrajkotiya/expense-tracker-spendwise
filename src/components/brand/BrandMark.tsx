import type { CSSProperties } from 'react'
import styles from './BrandMark.module.scss'

interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 36, className = '' }: BrandMarkProps) {
  return (
    <img
      src="/spendx-logo.jpg"
      alt=""
      aria-hidden="true"
      className={`${styles.mark} ${className}`}
      style={{ '--brand-mark-size': `${size}px` } as CSSProperties}
    />
  )
}
