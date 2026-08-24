'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Moon, Sun, Trash2, AlertTriangle, Check, RefreshCw } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [userName, setUserName] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.userName) setUserName(data.userName)
      })
      .catch((err) => console.error('Failed to load settings', err))
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) return

    setSaving(true)
    setSavedSuccess(false)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: userName.trim() }),
      })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleClearCompleted = async () => {
    if (!confirm('Are you sure you want to clear all completed tasks and completed to-dos?')) return
    try {
      const res = await fetch('/api/settings?action=clear_completed', { method: 'DELETE' })
      const data = await res.json()
      alert(data.message || 'Completed items cleared.')
    } catch (err) {
      console.error('Failed to clear completed items:', err)
    }
  }

  const handleDeleteAllData = async () => {
    const confirmation = prompt(
      'WARNING: This will permanently delete ALL tasks, to-dos, notes, and improvement items.\n\nType "DELETE" to confirm:'
    )
    if (confirmation !== 'DELETE') return

    try {
      const res = await fetch('/api/settings?action=delete_all', { method: 'DELETE' })
      const data = await res.json()
      alert(data.message || 'All data has been reset.')
      window.location.href = '/'
    } catch (err) {
      console.error('Failed to reset database:', err)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-500" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your profile, theme preference, and data management.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          Personal Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full max-w-md px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            {savedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                Profile updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Appearance & Theme */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-indigo-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          Appearance Theme
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Switch between Light Mode and Dark Mode according to your lighting preference.
        </p>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              theme === 'light'
                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Data Management & Danger Zone */}
      <div className="bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Data Management
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Clean up finished work or wipe your database to start fresh.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleClearCompleted}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-xs transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Completed Tasks & To-Dos</span>
          </button>

          <button
            onClick={handleDeleteAllData}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Data</span>
          </button>
        </div>
      </div>
    </div>
  )
}
