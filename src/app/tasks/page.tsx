'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  CheckSquare,
  X,
  Filter,
} from 'lucide-react'
import { clsx } from 'clsx'

interface Task {
  id: string
  title: string
  description?: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  category: string
  dueDate?: string | null
  createdAt: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('ALL')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'COMPLETED',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    category: 'General',
    dueDate: '',
  })

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (Array.isArray(data)) {
        setTasks(data)
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const openCreateModal = (status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' = 'TODO') => {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      status,
      priority: 'MEDIUM',
      category: 'General',
      dueDate: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '',
    })
    setIsModalOpen(true)
  }

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      if (editingTask) {
        // Update task
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const updated = await res.json()
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      } else {
        // Create task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const created = await res.json()
        setTasks((prev) => [created, ...prev])
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save task:', err)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const handleChangeStatus = async (
    id: string,
    newStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      console.error('Failed to change status:', err)
    }
  }

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (
    e: React.DragEvent,
    targetStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      await handleChangeStatus(taskId, targetStatus)
    }
  }

  const categories = Array.from(new Set(tasks.map((t) => t.category)))

  const filteredTasks = filterCategory === 'ALL'
    ? tasks
    : tasks.filter((t) => t.category === filterCategory)

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED')

  const columns = [
    { key: 'TODO', title: 'To Do', icon: Clock, count: todoTasks.length, items: todoTasks, bg: 'border-amber-200 dark:border-amber-900/40' },
    { key: 'IN_PROGRESS', title: 'In Progress', icon: AlertCircle, count: inProgressTasks.length, items: inProgressTasks, bg: 'border-indigo-200 dark:border-indigo-900/40' },
    { key: 'COMPLETED', title: 'Completed', icon: CheckCircle, count: completedTasks.length, items: completedTasks, bg: 'border-emerald-200 dark:border-emerald-900/40' },
  ] as const

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Task Cards
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your work into status columns. Drag and drop cards to update progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-medium">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent focus:outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => openCreateModal('TODO')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const Icon = col.icon

            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
                className={clsx(
                  'bg-gray-100/70 dark:bg-gray-900/60 rounded-2xl p-4 border min-h-[500px] flex flex-col',
                  col.bg
                )}
              >
                {/* Column Title Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                      {col.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                      {col.count}
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateModal(col.key)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1">
                  {col.items.length === 0 ? (
                    <div className="text-center py-10 text-xs text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                      Drop tasks here or click +
                    </div>
                  ) : (
                    col.items.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-indigo-400 dark:hover:border-indigo-600"
                      >
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {task.title}
                          </h3>

                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Category & Priority Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                          {/* Priority */}
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-md font-semibold',
                              task.priority === 'HIGH' && 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400',
                              task.priority === 'MEDIUM' && 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400',
                              task.priority === 'LOW' && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            )}
                          >
                            {task.priority}
                          </span>

                          {/* Category */}
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium flex items-center">
                            <Tag className="w-3 h-3 mr-1 text-gray-400" />
                            {task.category}
                          </span>

                          {/* Due Date */}
                          {task.dueDate && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium flex items-center ml-auto">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Quick Status Shift buttons */}
                        <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px]">
                          {task.status !== 'TODO' && (
                            <button
                              onClick={() => handleChangeStatus(task.id, 'TODO')}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-medium"
                            >
                              ← To Do
                            </button>
                          )}
                          {task.status !== 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleChangeStatus(task.id, 'IN_PROGRESS')}
                              className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded font-medium"
                            >
                              In Progress
                            </button>
                          )}
                          {task.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleChangeStatus(task.id, 'COMPLETED')}
                              className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded font-medium"
                            >
                              ✓ Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Complete Machine Learning Assignment"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task details and instructions..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="General, Work, Study..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
