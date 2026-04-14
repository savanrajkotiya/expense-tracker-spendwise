import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, Pencil, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/contexts/CurrencyContext'
import { formatDate } from '@/lib/utils'
import styles from './Expenses.module.scss'

export default function Expenses() {
  const { formatAmount } = useCurrency()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const { data: expenses, isLoading } = useExpenses({
    search: search || undefined,
    categoryId: categoryFilter || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  })
  const { data: categories = [] } = useCategories()
  const deleteExpense = useDeleteExpense()

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this expense?')) {
      deleteExpense.mutate(id)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link to="/expenses/new">
          <Button icon={<Plus size={18} />}>Add</Button>
        </Link>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={styles.filterDate}
          value={dateRange.start}
          onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
          placeholder="From"
        />
        <input
          type="date"
          className={styles.filterDate}
          value={dateRange.end}
          onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
          placeholder="To"
        />
      </div>

      {isLoading ? (
        <div className={styles.center}><Spinner /></div>
      ) : !expenses?.length ? (
        <EmptyState
          icon={<Receipt />}
          title="No expenses found"
          description="Start tracking your spending by adding your first expense."
          action={
            <Link to="/expenses/new">
              <Button icon={<Plus size={18} />}>Add Expense</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.list}>
          {expenses.map(exp => (
            <Card key={exp.id} padding="none" hoverable>
              <div className={styles.row}>
                <div
                  className={styles.categoryDot}
                  style={{ background: exp.category?.color || '#64748b' }}
                >
                  <span>{exp.category?.icon || '📌'}</span>
                </div>
                <div className={styles.info}>
                  <span className={styles.note}>
                    {exp.note || exp.category?.name || 'Expense'}
                  </span>
                  <span className={styles.meta}>
                    {formatDate(exp.date)} {exp.is_recurring && (
                      <Badge variant="info">Recurring</Badge>
                    )}
                  </span>
                </div>
                <div className={styles.right}>
                  <span className={styles.amount}>
                    -{formatAmount(exp.amount)}
                  </span>
                  <div className={styles.actions}>
                    <Link to={`/expenses/${exp.id}/edit`} className={styles.actionBtn}>
                      <Pencil size={15} />
                    </Link>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleDelete(exp.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
