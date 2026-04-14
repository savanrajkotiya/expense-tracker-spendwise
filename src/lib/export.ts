import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Expense } from '@/types'

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function exportToCSV(expenses: Expense[], filename = 'expenses', currency = 'INR') {
  const rows = expenses.map(exp => ({
    Date: exp.date,
    Category: exp.category?.name || 'Uncategorized',
    Note: exp.note || '',
    Amount: fmt(exp.amount, currency),
    Recurring: exp.is_recurring ? exp.recurring_frequency || 'Yes' : 'No',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPDF(expenses: Expense[], filename = 'expenses', currency = 'INR') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Expense Report', 14, 22)

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Total: ${fmt(total, currency)}  |  ${expenses.length} expenses  |  Currency: ${currency}`, 14, 30)

  const rows = expenses.map(exp => [
    exp.date,
    exp.category?.name || 'Uncategorized',
    exp.note || '-',
    fmt(exp.amount, currency),
  ])

  autoTable(doc, {
    startY: 38,
    head: [['Date', 'Category', 'Note', 'Amount']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  doc.save(`${filename}.pdf`)
}
