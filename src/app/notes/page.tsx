'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Plus,
  Pin,
  PinOff,
  Search,
  Trash2,
  Edit3,
  X,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Code,
} from 'lucide-react'
import { clsx } from 'clsx'

interface Note {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  })

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notes')
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotes(data)
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const openCreateModal = () => {
    setEditingNote(null)
    setFormData({ title: '', content: '', isPinned: false })
    setIsModalOpen(true)
  }

  const openEditModal = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
    })
    setIsModalOpen(true)
  }

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      if (editingNote) {
        const res = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const updated = await res.json()
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const created = await res.json()
        setNotes((prev) => [created, ...prev])
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      })
      const updated = await res.json()
      setNotes((prev) =>
        prev
          .map((n) => (n.id === updated.id ? updated : n))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      )
    } catch (err) {
      console.error('Failed to pin note:', err)
    }
  }

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  // Formatting helper buttons
  const insertFormatting = (prefix: string, suffix: string = '') => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + `${prefix} ${suffix}`,
    }))
  }

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase()
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  })

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned)
  const regularNotes = filteredNotes.filter((n) => !n.isPinned)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            Personal Notes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Capture study notes, code snippets, and quick reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          {searchQuery ? `No notes matching "${searchQuery}"` : 'No notes created yet. Click New Note above!'}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" /> Pinned Notes ({pinnedNotes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEditModal}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Other Notes ({regularNotes.length})
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={openEditModal}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note Title..."
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                  className={clsx(
                    'p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold',
                    formData.isPinned
                      ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                  )}
                >
                  <Pin className="w-4 h-4" />
                  <span>{formData.isPinned ? 'Pinned' : 'Pin'}</span>
                </button>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-gray-600 dark:text-gray-300">
                <button
                  type="button"
                  onClick={() => insertFormatting('**Bold Text**')}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-xs font-semibold"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*Italic Text*')}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-xs font-semibold"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('# Heading 1\n')}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-xs font-semibold"
                  title="Heading"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('- Bullet point\n')}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-xs font-semibold"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('1. Numbered item\n')}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-xs font-semibold"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('```\ncode block\n```\n')}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-xs font-semibold"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note here... supports Markdown formatting."
                className="w-full flex-1 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingNote ? 'Save Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  note: Note
  onEdit: (note: Note) => void
  onTogglePin: (note: Note, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={() => onEdit(note)}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {note.title}
          </h3>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={(e) => onTogglePin(note, e)}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                note.isPinned
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              {note.isPinned ? <Pin className="w-4 h-4 fill-amber-500" /> : <Pin className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => onDelete(note.id, e)}
              className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-opacity"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap line-clamp-4 mb-4">
          {note.content || '(Empty note)'}
        </p>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
        <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
        <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
