'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  CheckCircle2,
  FileText,
  Target,
  Settings,
  X,
  Sparkles,
} from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'To-Do', href: '/todo', icon: CheckCircle2 },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Improve Yourself', href: '/improve', icon: Target },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center space-x-2.5" onClick={onCloseMobile}>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
              Workspace
            </span>
          </Link>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={clsx(
                  'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                  )}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Daily Productivity Workspace
          </div>
        </div>
      </aside>
    </>
  )
}
