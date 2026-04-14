import { useState } from 'react'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import type { Category, CategoryFormData } from '@/types'
import styles from './Categories.module.scss'

const EMOJI_PICKS = ['🍔','🚗','🛍️','🎬','📄','💊','📚','✈️','🛒','📱','🏠','💰','🎮','🏋️','🐕','📌']
const COLOR_PICKS = ['#f97316','#3b82f6','#ec4899','#8b5cf6','#6366f1','#ef4444','#14b8a6','#06b6d4','#22c55e','#a855f7','#f59e0b','#64748b']

export default function Categories() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormData>({ name: '', icon: '📌', color: '#64748b' })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', icon: '📌', color: '#64748b' })
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, icon: cat.icon, color: cat.color })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, data: form })
    } else {
      await createCategory.mutateAsync(form)
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this category? Expenses using it will become uncategorized.')) {
      deleteCategory.mutate(id)
    }
  }

  if (isLoading) return <div className={styles.center}><Spinner /></div>

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <p className={styles.count}>{categories?.length || 0} categories</p>
        <Button icon={<Plus size={18} />} onClick={openCreate}>Add Category</Button>
      </div>

      {!categories?.length ? (
        <EmptyState
          icon={<Tags />}
          title="No categories"
          description="Create categories to organize your expenses."
          action={<Button onClick={openCreate}>Create Category</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {categories.map(cat => (
            <Card key={cat.id} hoverable>
              <div className={styles.catRow}>
                <div className={styles.catIcon} style={{ background: cat.color + '20', color: cat.color }}>
                  {cat.icon}
                </div>
                <div className={styles.catInfo}>
                  <span className={styles.catName}>{cat.name}</span>
                  {cat.is_default && <span className={styles.catDefault}>Default</span>}
                </div>
                <div className={styles.catActions}>
                  <button className={styles.catBtn} onClick={() => openEdit(cat)}>
                    <Pencil size={15} />
                  </button>
                  {!cat.is_default && (
                    <button className={styles.catBtn} onClick={() => handleDelete(cat.id)}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Category' : 'New Category'}
        size="sm"
      >
        <div className={styles.dialogForm}>
          <Input
            label="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Coffee"
          />

          <div className={styles.pickerSection}>
            <span className={styles.pickerLabel}>Icon</span>
            <div className={styles.pickerGrid}>
              {EMOJI_PICKS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`${styles.pickerItem} ${form.icon === emoji ? styles.pickerActive : ''}`}
                  onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.pickerSection}>
            <span className={styles.pickerLabel}>Color</span>
            <div className={styles.pickerGrid}>
              {COLOR_PICKS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorDot} ${form.color === color ? styles.colorActive : ''}`}
                  style={{ background: color }}
                  onClick={() => setForm(f => ({ ...f, color }))}
                />
              ))}
            </div>
          </div>

          <div className={styles.dialogActions}>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              loading={createCategory.isPending || updateCategory.isPending}
            >
              {editing ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
