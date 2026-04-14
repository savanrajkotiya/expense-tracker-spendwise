import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCategories } from '@/hooks/useCategories'
import { useCreateExpense, useUpdateExpense, useExpense } from '@/hooks/useExpenses'
import { RECURRING_FREQUENCIES } from '@/lib/constants'
import type { ExpenseFormData } from '@/types'
import styles from './AddExpense.module.scss'

interface SplitEntry {
  participant_name: string
  amount: number
}

export default function AddExpense() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: categories = [] } = useCategories()
  const { data: existingExpense } = useExpense(id)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [showSplit, setShowSplit] = useState(false)
  const [splits, setSplits] = useState<SplitEntry[]>([])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      amount: 0,
      category_id: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_frequency: undefined,
    },
  })

  useEffect(() => {
    if (existingExpense) {
      reset({
        amount: existingExpense.amount,
        category_id: existingExpense.category_id,
        note: existingExpense.note || '',
        date: existingExpense.date,
        is_recurring: existingExpense.is_recurring,
        recurring_frequency: existingExpense.recurring_frequency || undefined,
      })
    }
  }, [existingExpense, reset])

  const isRecurring = watch('is_recurring')
  const currentAmount = watch('amount')

  const addSplitRow = () => {
    setSplits(s => [...s, { participant_name: '', amount: 0 }])
  }

  const removeSplitRow = (idx: number) => {
    setSplits(s => s.filter((_, i) => i !== idx))
  }

  const updateSplit = (idx: number, field: keyof SplitEntry, value: string | number) => {
    setSplits(s => s.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)))
  }

  const splitEvenly = () => {
    if (!splits.length || !currentAmount) return
    const each = Math.round((currentAmount / (splits.length + 1)) * 100) / 100
    setSplits(s => s.map(entry => ({ ...entry, amount: each })))
  }

  const onSubmit = async (data: ExpenseFormData) => {
    const payload: ExpenseFormData = {
      ...data,
      splits: showSplit ? splits.filter(s => s.participant_name && s.amount > 0) : undefined,
    }

    if (isEdit) {
      await updateExpense.mutateAsync({ id, data: payload })
    } else {
      await createExpense.mutateAsync(payload)
    }
    navigate('/expenses')
  }

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }))

  const frequencyOptions = RECURRING_FREQUENCIES.map(f => ({
    value: f.value,
    label: f.label,
  }))

  return (
    <div className={styles.page}>
      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', {
              required: 'Amount is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Must be greater than 0' },
            })}
          />

          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select a category"
            error={errors.category_id?.message}
            {...register('category_id', { required: 'Category is required' })}
          />

          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register('date', { required: 'Date is required' })}
          />

          <Input
            label="Note (optional)"
            type="text"
            placeholder="What was this for?"
            {...register('note')}
          />

          <div className={styles.checkRow}>
            <label className={styles.checkLabel}>
              <input type="checkbox" {...register('is_recurring')} />
              <span>Recurring expense</span>
            </label>
          </div>

          {isRecurring && (
            <Select
              label="Frequency"
              options={frequencyOptions}
              placeholder="How often?"
              {...register('recurring_frequency')}
            />
          )}

          {!isEdit && (
            <div className={styles.splitSection}>
              <div className={styles.checkRow}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={showSplit}
                    onChange={e => {
                      setShowSplit(e.target.checked)
                      if (e.target.checked && splits.length === 0) addSplitRow()
                    }}
                  />
                  <span>Split this expense</span>
                </label>
              </div>

              {showSplit && (
                <div className={styles.splitList}>
                  {splits.map((entry, idx) => (
                    <div key={idx} className={styles.splitRow}>
                      <input
                        className={styles.splitInput}
                        placeholder="Name"
                        value={entry.participant_name}
                        onChange={e => updateSplit(idx, 'participant_name', e.target.value)}
                      />
                      <input
                        className={styles.splitInput}
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={entry.amount || ''}
                        onChange={e => updateSplit(idx, 'amount', Number(e.target.value))}
                      />
                      <button type="button" className={styles.splitRemove} onClick={() => removeSplitRow(idx)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className={styles.splitActions}>
                    <Button type="button" variant="ghost" size="sm" icon={<Plus size={14} />} onClick={addSplitRow}>
                      Add Person
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={splitEvenly}>
                      Split Evenly
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createExpense.isPending || updateExpense.isPending}
            >
              {isEdit ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
