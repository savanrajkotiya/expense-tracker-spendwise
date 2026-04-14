import { Split as SplitIcon, CheckCircle, Circle, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSplits, useToggleSettled, useDeleteSplit } from '@/hooks/useSplits'
import { useCurrency } from '@/contexts/CurrencyContext'
import styles from './Splits.module.scss'

export default function Splits() {
  const { formatAmount } = useCurrency()
  const { data: splits, isLoading } = useSplits()
  const toggleSettled = useToggleSettled()
  const deleteSplit = useDeleteSplit()

  const unsettled = splits?.filter(s => !s.is_settled) || []
  const settled = splits?.filter(s => s.is_settled) || []

  const totalOwed = unsettled.reduce((sum, s) => sum + Number(s.amount), 0)

  if (isLoading) return <div className={styles.center}><Spinner /></div>

  if (!splits?.length) {
    return (
      <EmptyState
        icon={<SplitIcon />}
        title="No split expenses"
        description="When you add an expense with splits, they'll appear here."
      />
    )
  }

  return (
    <div className={styles.page}>
      {totalOwed > 0 && (
        <Card>
          <div className={styles.summary}>
            <span className={styles.summaryLabel}>Total unsettled</span>
            <span className={styles.summaryValue}>{formatAmount(totalOwed)}</span>
          </div>
        </Card>
      )}

      {unsettled.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Unsettled ({unsettled.length})</h2>
          <div className={styles.list}>
            {unsettled.map(split => (
              <SplitRow
                key={split.id}
                split={split}
                onToggle={() => toggleSettled.mutate({ id: split.id, is_settled: true })}
                onDelete={() => deleteSplit.mutate(split.id)}
              />
            ))}
          </div>
        </section>
      )}

      {settled.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Settled ({settled.length})</h2>
          <div className={styles.list}>
            {settled.map(split => (
              <SplitRow
                key={split.id}
                split={split}
                onToggle={() => toggleSettled.mutate({ id: split.id, is_settled: false })}
                onDelete={() => deleteSplit.mutate(split.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface SplitRowProps {
  split: { id: string; participant_name: string; amount: number; is_settled: boolean; expense?: unknown }
  onToggle: () => void
  onDelete: () => void
}

function SplitRow({ split, onToggle, onDelete }: SplitRowProps) {
  const { formatAmount } = useCurrency()

  return (
    <Card padding="none" hoverable>
      <div className={styles.row}>
        <button className={styles.checkBtn} onClick={onToggle}>
          {split.is_settled
            ? <CheckCircle size={22} className={styles.settled} />
            : <Circle size={22} />
          }
        </button>
        <div className={styles.info}>
          <span className={`${styles.name} ${split.is_settled ? styles.strikethrough : ''}`}>
            {split.participant_name}
          </span>
          <Badge variant={split.is_settled ? 'success' : 'warning'}>
            {split.is_settled ? 'Settled' : 'Pending'}
          </Badge>
        </div>
        <span className={styles.amount}>{formatAmount(split.amount)}</span>
        <button className={styles.deleteBtn} onClick={onDelete}>
          <Trash2 size={15} />
        </button>
      </div>
    </Card>
  )
}
