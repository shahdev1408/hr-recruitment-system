'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Jobs', href: '/jobs', icon: '💼' },
  { label: 'Candidates', href: '/candidates', icon: '👥' },
  { label: 'Interviews', href: '/interviews', icon: '📅' },
  { label: 'Reports', href: '/reports', icon: '📈' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-400">MMIPL HR</h1>
          <p className="text-gray-400 text-xs mt-1">Recruitment System</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white text-xl">✕</button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <span className="text-gray-400 text-xs">{showMenu ? '▲' : '▼'}</span>
            </button>
            {showMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {user.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => { setShowMenu(false); router.push('/dashboard'); onClose?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </button>
                <div className="border-t border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-700 transition-colors text-sm"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}