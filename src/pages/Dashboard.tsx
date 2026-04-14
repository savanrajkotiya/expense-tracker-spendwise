import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  TrendingDown, CalendarDays, CalendarRange, Calendar, Plus, ArrowRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useDashboardSummary, useSpendingByCategory, useDailySpending } from '@/hooks/useDashboard'
import { useExpenses } from '@/hooks/useExpenses'
import { useCurrency } from '@/contexts/CurrencyContext'
import { formatDate } from '@/lib/utils'
import styles from './Dashboard.module.scss'

export default function Dashboard() {
  const { formatAmount } = useCurrency()
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: byCategory = [] } = useSpendingByCategory()
  const { data: dailyData = [] } = useDailySpending(14)
  const { data: recentExpenses = [] } = useExpenses({ limit: 5 })

  if (summaryLoading) {
    return <div className={styles.center}><Spinner size="lg" /></div>
  }

  const summaryCards = [
    { label: 'Today', value: summary?.today || 0, icon: <CalendarDays size={20} /> },
    { label: 'This Week', value: summary?.thisWeek || 0, icon: <CalendarRange size={20} /> },
    { label: 'This Month', value: summary?.thisMonth || 0, icon: <Calendar size={20} /> },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.summaryRow}>
        {summaryCards.map(card => (
          <Card key={card.label}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>{card.icon}</div>
              <div>
                <p className={styles.summaryLabel}>{card.label}</p>
                <p className={styles.summaryValue}>{formatAmount(card.value)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                    formatter={(value) => [formatAmount(Number(value)), 'Spent']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#areaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Category (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className={styles.emptyChart}>No data yet</p>
            ) : (
              <div className={styles.pieWrap}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {byCategory.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      formatter={(value) => formatAmount(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.legend}>
                  {byCategory.slice(0, 5).map(entry => (
                    <div key={entry.name} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: entry.color }} />
                      <span className={styles.legendName}>{entry.icon} {entry.name}</span>
                      <span className={styles.legendValue}>{formatAmount(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <Link to="/expenses">
            <Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <div className={styles.emptyRecent}>
              <TrendingDown size={32} />
              <p>No expenses yet. Start tracking!</p>
              <Link to="/expenses/new">
                <Button icon={<Plus size={16} />} size="sm">Add Expense</Button>
              </Link>
            </div>
          ) : (
            <div className={styles.recentList}>
              {recentExpenses.map(exp => (
                <div key={exp.id} className={styles.recentRow}>
                  <div
                    className={styles.recentIcon}
                    style={{ background: (exp.category?.color || '#64748b') + '20' }}
                  >
                    {exp.category?.icon || '📌'}
                  </div>
                  <div className={styles.recentInfo}>
                    <span className={styles.recentNote}>
                      {exp.note || exp.category?.name || 'Expense'}
                    </span>
                    <span className={styles.recentDate}>{formatDate(exp.date)}</span>
                  </div>
                  <span className={styles.recentAmount}>-{formatAmount(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
