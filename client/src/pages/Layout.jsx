import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Box, Truck, Activity, ShieldCheck,
  Search, LogOut
} from 'lucide-react';

const Layout = ({ children, user, menuItems: customMenuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Use custom menu items if provided, otherwise use default
  const menuItems = customMenuItems || [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Box size={18} />, label: 'Products', path: '/products' },
    { icon: <Truck size={18} />, label: 'Shipments', path: '/shipments' },
    { icon: <Activity size={18} />, label: 'IoT Alerts', path: '/iot-alerts' },
    { icon: <ShieldCheck size={18} />, label: 'Ledger Audit', path: '/ledger-audit' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="flex w-64 flex-col bg-slate-900 text-white">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <ShieldCheck size={18} />
          </div>
          <span className="font-black tracking-wide text-lg uppercase">BESS-PAS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition
                ${location.pathname === item.path
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 bg-slate-800/50 p-3 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs">
              {user?.name?.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] uppercase text-emerald-400 font-bold">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black">Blockchain-Enabled Secure Supply-chain and Authenticity System</h1>
            <p className="text-xs text-slate-400">Real-time traceability & cold-chain integrity</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search ledger…"
              />
            </div>

            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow">
              Verify Product
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;