'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  X,
  ListTodo,
} from 'lucide-react'
import { clsx } from 'clsx'

interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string | null
  createdAt: string
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL')

  // Quick inline add
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [newDueDate, setNewDueDate] = useState('')

  // Edit Modal State
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [editDueDate, setEditDueDate] = useState('')

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/todos')
      const data = await res.json()
      if (Array.isArray(data)) {
        setTodos(data)
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          dueDate: newDueDate || null,
        }),
      })
      const created = await res.json()
      setTodos((prev) => [created, ...prev])
      setNewTitle('')
      setNewDueDate('')
    } catch (err) {
      console.error('Failed to add todo:', err)
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      })
      const updated = await res.json()
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      console.error('Failed to toggle todo:', err)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Failed to delete todo:', err)
    }
  }

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setEditTitle(todo.title)
    setEditPriority(todo.priority)
    setEditDueDate(
      todo.dueDate ? new Date(todo.dueDate).toISOString().substring(0, 10) : ''
    )
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTodo || !editTitle.trim()) return

    try {
      const res = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          priority: editPriority,
          dueDate: editDueDate || null,
        }),
      })
      const updated = await res.json()
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setEditingTodo(null)
    } catch (err) {
      console.error('Failed to update todo:', err)
    }
  }

  const filteredTodos = todos.filter((t) => {
    if (filterTab === 'PENDING') return !t.completed
    if (filterTab === 'COMPLETED') return t.completed
    return true
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-emerald-500" />
          To-Do List
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Quick checklist for daily tasks and practical assignments.
        </p>
      </div>

      {/* Add To-Do Card */}
      <form
        onSubmit={handleAddTodo}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new to-do (e.g. Study Machine Learning)..."
          className="w-full md:flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
          />

          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex items-center space-x-1">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={clsx(
                'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize',
                filterTab === tab
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {tab.toLowerCase()} (
              {tab === 'ALL'
                ? todos.length
                : tab === 'PENDING'
                ? todos.filter((t) => !t.completed).length
                : todos.filter((t) => t.completed).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading to-dos...</div>
      ) : filteredTodos.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          No to-do items found in this view.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={clsx(
                'group flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700',
                todo.completed && 'opacity-65 bg-gray-50/50 dark:bg-gray-900/30'
              )}
            >
              {/* Checkbox & Title */}
              <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-4">
                <button
                  onClick={() => handleToggleComplete(todo)}
                  className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <span
                  className={clsx(
                    'text-sm font-medium transition-all truncate',
                    todo.completed
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-800 dark:text-gray-100'
                  )}
                >
                  {todo.title}
                </span>
              </div>

              {/* Priority, Due Date & Actions */}
              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={clsx(
                    'text-[10px] font-bold px-2 py-0.5 rounded-md',
                    todo.priority === 'HIGH' && 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400',
                    todo.priority === 'MEDIUM' && 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400',
                    todo.priority === 'LOW' && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {todo.priority}
                </span>

                {todo.dueDate && (
                  <span className="hidden sm:flex items-center text-[11px] text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
                    <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={() => openEditModal(todo)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Edit To-Do"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete To-Do"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit To-Do</h2>
              <button
                onClick={() => setEditingTodo(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
