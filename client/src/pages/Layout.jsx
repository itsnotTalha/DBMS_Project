import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';

/**
 * Unified Layout Component - Works for all roles
 * 
 * Usage:
 * <Layout user={user} menuItems={manufacturerMenuItems}>
 *   {children}
 * </Layout>
 */
const Layout = ({ children, user, menuItems = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-800">
          <div className={`flex items-center gap-3 transition-all ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-emerald-500 p-2 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
              </svg>
            </div>
            {sidebarOpen && <span className="font-black text-lg tracking-wide">BESS-PAS</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive(item.path)
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))
          ) : (
            <p className="text-slate-500 text-xs px-4 py-2">No menu items</p>
          )}
        </nav>

        {/* User Menu - Bottom */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800 ${!sidebarOpen && 'justify-center'}`}>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-300 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Role'}</p>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-30">
          <div className="flex items-center justify-between h-20 px-8">
            <h1 className="text-sm font-bold text-slate-900">
              {user?.name ? `Welcome, ${user.name}!` : 'Dashboard'}
            </h1>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown size={16} className="text-slate-600" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-slate-50">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;