'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, CheckSquare, FileText, CheckCircle2, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  tasks: Array<{ id: string; title: string; status: string; priority: string }>
  todos: Array<{ id: string; title: string; completed: boolean; priority: string }>
  notes: Array<{ id: string; title: string; content: string; isPinned: boolean }>
  improveItems: Array<{ id: string; title: string; status: string }>
}

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults(null)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open handled by parent or custom event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error('Failed to search', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  const hasResults =
    results &&
    (results.tasks.length > 0 ||
      results.todos.length > 0 ||
      results.notes.length > 0 ||
      results.improveItems.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, to-dos, notes, improvement items..."
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md font-medium"
          >
            ESC
          </button>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="text-center py-8 text-sm text-gray-400">Searching workspace...</div>
          )}

          {!loading && query.trim() && !hasResults && (
            <div className="text-center py-8 text-sm text-gray-400">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="text-center py-8 text-xs text-gray-400">
              Type keywords above to search across your workspace
            </div>
          )}

          {!loading && results && (
            <>
              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                    Tasks ({results.tasks.length})
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <Link
                        key={t.id}
                        href="/tasks"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl transition-colors group"
                      >
                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {t.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 capitalize">
                          {t.status.replace('_', ' ').toLowerCase()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* To-Dos */}
              {results.todos.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    To-Dos ({results.todos.length})
                  </div>
                  <div className="space-y-1">
                    {results.todos.map((todo) => (
                      <Link
                        key={todo.id}
                        href="/todo"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl transition-colors group"
                      >
                        <span
                          className={`text-sm font-medium ${
                            todo.completed
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                          }`}
                        >
                          {todo.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          {todo.completed ? 'Completed' : 'Pending'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Notes ({results.notes.length})
                  </div>
                  <div className="space-y-1">
                    {results.notes.map((n) => (
                      <Link
                        key={n.id}
                        href="/notes"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center space-x-2">
                          {n.isPinned && <span className="text-xs">📌</span>}
                          <span className="text-sm text-gray-800 dark:text-gray-200 font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400">
                            {n.title}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Improve Yourself */}
              {results.improveItems.length > 0 && (
                <div>
                  <div className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Improve Yourself ({results.improveItems.length})
                  </div>
                  <div className="space-y-1">
                    {results.improveItems.map((item) => (
                      <Link
                        key={item.id}
                        href="/improve"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl transition-colors group"
                      >
                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 capitalize">
                          {item.status.replace('_', ' ').toLowerCase()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
