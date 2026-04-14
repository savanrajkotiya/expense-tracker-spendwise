import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.scss'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

export function Card({ className, padding = 'md', hoverable, children, ...props }: CardProps) {
  return (
    <div
      className={cn(styles.card, styles[`pad-${padding}`], hoverable && styles.hoverable, className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.header, className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn(styles.title, className)}>{children}</h3>
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  )
}
