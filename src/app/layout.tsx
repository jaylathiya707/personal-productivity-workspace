'use client'

import { useState } from 'react'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Personal Productivity Workspace</title>
        <meta name="description" content="Clean, modern, simple personal productivity workspace" />
      </head>
      <body className="bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <ThemeProvider>
          <div className="min-h-screen flex">
            {/* Sidebar navigation */}
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
              <Header
                onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                onOpenSearch={() => setSearchOpen(true)}
              />

              <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>

          {/* Global search overlay modal */}
          <GlobalSearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
