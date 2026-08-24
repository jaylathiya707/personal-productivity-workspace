'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Calendar,
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react'

interface Task {
  id: string
  title: string
  status: string
  dueDate?: string | null
}

interface Note {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
}

interface Stats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  })
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const [tasksRes, notesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/notes'),
      ])

      const tasks: Task[] = await tasksRes.json()
      const notes: Note[] = await notesRes.json()

      const now = new Date()
      let total = 0
      let completed = 0
      let pending = 0
      let overdue = 0

      if (Array.isArray(tasks)) {
        total = tasks.length
        tasks.forEach((t) => {
          if (t.status === 'COMPLETED') {
            completed++
          } else {
            pending++
            if (t.dueDate && new Date(t.dueDate) < now) {
              overdue++
            }
          }
        })
      }

      setStats({
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        overdueTasks: overdue,
      })

      if (Array.isArray(notes)) {
        setRecentNotes(notes.slice(0, 4))
      }

      if (Array.isArray(tasks)) {
        const upcoming = tasks
          .filter((t) => t.status !== 'COMPLETED')
          .slice(0, 4)
        setUrgentTasks(upcoming)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const todayString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Today's Date */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-100 text-sm font-medium mb-1">
            <Calendar className="w-4 h-4 text-indigo-200" />
            <span>{todayString}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome to your Workspace
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            Here is your daily productivity overview.
          </p>
        </div>

        {/* Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/tasks"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Link>
          <Link
            href="/todo"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add To-Do</span>
          </Link>
          <Link
            href="/notes"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '-' : stats.totalTasks}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '-' : stats.pendingTasks}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '-' : stats.completedTasks}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? '-' : stats.overdueTasks}
          </div>
        </div>
      </div>

      {/* Overview Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks Overview */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-500" />
                <h2 className="font-bold text-gray-900 dark:text-white">Pending Tasks</h2>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400">Loading tasks...</div>
            ) : urgentTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                🎉 No pending tasks! You are all caught up.
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {t.title}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold capitalize">
                      {t.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            Tip: Drag tasks between columns on the Tasks page to change status.
          </div>
        </div>

        {/* Recently Created Notes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-gray-900 dark:text-white">Recent Notes</h2>
              </div>
              <Link
                href="/notes"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center"
              >
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400">Loading notes...</div>
            ) : recentNotes.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                No notes created yet. Click Add Note to get started!
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {note.isPinned && <span className="text-xs">📌</span>}
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {note.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>Keep your quick ideas and study notes organized.</span>
            <Link href="/improve" className="text-indigo-500 hover:underline flex items-center">
              <Target className="w-3.5 h-3.5 mr-1" /> Improve Yourself
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
