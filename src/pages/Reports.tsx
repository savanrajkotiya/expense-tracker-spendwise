import { useState } from 'react'
import { FileSpreadsheet, FileText, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useExpenses } from '@/hooks/useExpenses'
import { exportToCSV, exportToPDF } from '@/lib/export'
import { useCurrency } from '@/contexts/CurrencyContext'
import styles from './Reports.module.scss'

export default function Reports() {
  const { currency, formatAmount } = useCurrency()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: expenses = [], isLoading } = useExpenses({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const avgPerDay = expenses.length > 0
    ? total / new Set(expenses.map(e => e.date)).size
    : 0

  const handleCSV = () => {
    const label = startDate && endDate ? `expenses_${startDate}_${endDate}` : 'expenses'
    exportToCSV(expenses, label, currency)
  }

  const handlePDF = () => {
    const label = startDate && endDate ? `expenses_${startDate}_${endDate}` : 'expenses'
    exportToPDF(expenses, label, currency)
  }

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.dateRow}>
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>From</label>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>To</label>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={styles.statsRow}>
        <Card>
          <p className={styles.statLabel}>Total Expenses</p>
          <p className={styles.statValue}>{formatAmount(total)}</p>
        </Card>
        <Card>
          <p className={styles.statLabel}>Transactions</p>
          <p className={styles.statValue}>{expenses.length}</p>
        </Card>
        <Card>
          <p className={styles.statLabel}>Avg / Day</p>
          <p className={styles.statValue}>{formatAmount(avgPerDay)}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className={styles.center}><Spinner /></div>
          ) : (
            <div className={styles.exportRow}>
              <Button
                variant="secondary"
                icon={<FileSpreadsheet size={18} />}
                onClick={handleCSV}
                disabled={expenses.length === 0}
              >
                Export as Excel / CSV
              </Button>
              <Button
                variant="secondary"
                icon={<FileText size={18} />}
                onClick={handlePDF}
                disabled={expenses.length === 0}
              >
                Export as PDF
              </Button>
            </div>
          )}
          {expenses.length === 0 && !isLoading && (
            <p className={styles.emptyMsg}>
              <Download size={16} /> No expenses in this range to export.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
