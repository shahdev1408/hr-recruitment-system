'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Overlay — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed, full height, slides in on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-30 h-full
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content — pushed right on desktop by sidebar width */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-blue-600 text-lg">MMIPL HR</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}