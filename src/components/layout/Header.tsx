'use client'

import { useState, useEffect } from 'react'
import { Menu, Search, Sun, Moon, Calendar } from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  onOpenMobileSidebar: () => void
  onOpenSearch: () => void
}

export function Header({ onOpenMobileSidebar, onOpenSearch }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('Student')

  useEffect(() => {
    setMounted(true)
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.userName) setUserName(data.userName)
      })
      .catch(() => {})
  }, [])

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between transition-theme">
      {/* Left side: mobile toggle & date */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Center/Right: search launcher, theme switcher & profile */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-sm font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-block text-[10px] bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        )}

        {/* User greeting */}
        <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline-block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {userName}
          </span>
        </div>
      </div>
    </header>
  )
}
