import { useState } from 'react'
import { Plus, Pencil, Trash2, PiggyBank } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBudgets, useBudgetSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/contexts/CurrencyContext'
import { BUDGET_PERIODS } from '@/lib/constants'
import type { Budget, BudgetFormData } from '@/types'
import styles from './Budgets.module.scss'

export default function Budgets() {
  const { formatAmount } = useCurrency()
  const { data: budgets, isLoading } = useBudgets()
  const { data: spending = {} } = useBudgetSpending(budgets)
  const { data: categories = [] } = useCategories()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form, setForm] = useState<BudgetFormData>({
    category_id: null,
    amount_limit: 0,
    period: 'monthly',
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ category_id: null, amount_limit: 0, period: 'monthly' })
    setDialogOpen(true)
  }

  const openEdit = (b: Budget) => {
    setEditing(b)
    setForm({ category_id: b.category_id, amount_limit: b.amount_limit, period: b.period })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (form.amount_limit <= 0) return
    if (editing) {
      await updateBudget.mutateAsync({ id: editing.id, data: form })
    } else {
      await createBudget.mutateAsync(form)
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this budget?')) deleteBudget.mutate(id)
  }

  const categoryOptions = [
    { value: '', label: 'Overall (all categories)' },
    ...categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ]

  const periodOptions = BUDGET_PERIODS.map(p => ({ value: p.value, label: p.label }))

  if (isLoading) return <div className={styles.center}><Spinner /></div>

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <p className={styles.count}>{budgets?.length || 0} budgets</p>
        <Button icon={<Plus size={18} />} onClick={openCreate}>Add Budget</Button>
      </div>

      {!budgets?.length ? (
        <EmptyState
          icon={<PiggyBank />}
          title="No budgets set"
          description="Set spending limits to stay on track with your goals."
          action={<Button onClick={openCreate}>Create Budget</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {budgets.map(budget => {
            const spent = spending[budget.id] || 0
            const pct = Math.min((spent / budget.amount_limit) * 100, 100)
            const remaining = Math.max(budget.amount_limit - spent, 0)

            return (
              <Card key={budget.id}>
                <div className={styles.budgetHeader}>
                  <div>
                    <span className={styles.budgetName}>
                      {budget.category
                        ? `${budget.category.icon} ${budget.category.name}`
                        : 'Overall Budget'}
                    </span>
                    <span className={styles.budgetPeriod}>{budget.period}</span>
                  </div>
                  <div className={styles.budgetActions}>
                    <button className={styles.actBtn} onClick={() => openEdit(budget)}>
                      <Pencil size={14} />
                    </button>
                    <button className={styles.actBtn} onClick={() => handleDelete(budget.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.budgetAmounts}>
                  <span className={styles.spent}>{formatAmount(spent)}</span>
                  <span className={styles.limit}>of {formatAmount(budget.amount_limit)}</span>
                </div>

                <Progress value={pct} max={100} />

                <p className={styles.remaining}>
                  {remaining > 0
                    ? `${formatAmount(remaining)} remaining`
                    : 'Budget exceeded!'
                  }
                </p>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Budget' : 'New Budget'}
        size="sm"
      >
        <div className={styles.dialogForm}>
          <Select
            label="Category"
            options={categoryOptions}
            value={form.category_id || ''}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value || null }))}
          />

          <Input
            label="Budget Limit"
            type="number"
            min="1"
            step="0.01"
            placeholder="500.00"
            value={form.amount_limit || ''}
            onChange={e => setForm(f => ({ ...f, amount_limit: Number(e.target.value) }))}
          />

          <Select
            label="Period"
            options={periodOptions}
            value={form.period}
            onChange={e => setForm(f => ({ ...f, period: e.target.value as BudgetFormData['period'] }))}
          />

          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              loading={createBudget.isPending || updateBudget.isPending}
            >
              {editing ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
