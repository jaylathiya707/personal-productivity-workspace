'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target, Plus, CheckCircle2, Clock, Circle, Trash2, Edit2, X, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

interface ImproveItem {
  id: string
  title: string
  description?: string | null
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: string
}

export default function ImprovePage() {
  const [items, setItems] = useState<ImproveItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ImproveItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'NOT_STARTED' as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
  })

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/improve')
      const data = await res.json()
      if (Array.isArray(data)) {
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to fetch improve items:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const openCreateModal = (presetTitle?: string) => {
    setEditingItem(null)
    setFormData({
      title: presetTitle || '',
      description: '',
      status: 'NOT_STARTED',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: ImproveItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      status: item.status,
    })
    setIsModalOpen(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      if (editingItem) {
        const res = await fetch(`/api/improve/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const updated = await res.json()
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      } else {
        const res = await fetch('/api/improve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const created = await res.json()
        setItems((prev) => [created, ...prev])
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save item:', err)
    }
  }

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    try {
      const res = await fetch(`/api/improve/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const updated = await res.json()
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this improvement item?')) return
    try {
      await fetch(`/api/improve/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  const defaultSuggestions = [
    'Learn Python',
    'Improve communication',
    'Practice coding',
    'Read books',
    'Learn AI',
    'Improve time management',
  ]

  const notStartedList = items.filter((i) => i.status === 'NOT_STARTED')
  const inProgressList = items.filter((i) => i.status === 'IN_PROGRESS')
  const completedList = items.filter((i) => i.status === 'COMPLETED')

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Improve Yourself
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track key personal development topics, skills, and learning targets.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill / Goal</span>
        </button>
      </div>

      {/* Quick Suggestions presets */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Popular Self-Improvement Topics:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {defaultSuggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => openCreateModal(sug)}
              className="text-xs font-medium px-3 py-1 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900 transition-colors"
            >
              + {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid by Status */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading improvement items...</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          No improvement items yet! Select one of the popular topics above or click Add Skill / Goal.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Not Started */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Circle className="w-4 h-4 text-slate-400" />
                <span>Not Started</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {notStartedList.length}
              </span>
            </div>

            <div className="space-y-3">
              {notStartedList.map((item) => (
                <ImproveCard
                  key={item.id}
                  item={item}
                  onEdit={openEditModal}
                  onStatusChange={handleUpdateStatus}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>In Progress</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {inProgressList.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressList.map((item) => (
                <ImproveCard
                  key={item.id}
                  item={item}
                  onEdit={openEditModal}
                  onStatusChange={handleUpdateStatus}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Completed</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                {completedList.length}
              </span>
            </div>

            <div className="space-y-3">
              {completedList.map((item) => (
                <ImproveCard
                  key={item.id}
                  item={item}
                  onEdit={openEditModal}
                  onStatusChange={handleUpdateStatus}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Add Improvement Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Learn Python / Improve Communication"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Why this matters or what steps you will take..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ImproveCard({
  item,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  item: ImproveItem
  onEdit: (item: ImproveItem) => void
  onStatusChange: (id: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.title}</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 rounded text-gray-400 hover:text-rose-600"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-700/40 text-[11px]">
        {item.status !== 'COMPLETED' ? (
          <button
            onClick={() => onStatusChange(item.id, 'COMPLETED')}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
          </button>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ Done
          </span>
        )}

        {item.status === 'NOT_STARTED' && (
          <button
            onClick={() => onStatusChange(item.id, 'IN_PROGRESS')}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Start →
          </button>
        )}
      </div>
    </div>
  )
}
