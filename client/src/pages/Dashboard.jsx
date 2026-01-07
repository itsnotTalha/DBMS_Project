import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Box, Truck, Activity, ShieldCheck,
  Search, Bell, Thermometer, LogOut
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({ batches: 0, units: 0, transit: 0, alerts: 0 });
  const [shipments, setShipments] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const storedUser =
    localStorage.getItem('user') || sessionStorage.getItem('user');

  // 1. Auth check
  if (!storedUser) {
    navigate('/login');
    return;
  }

  const parsedUser = JSON.parse(storedUser);


  if (parsedUser.role !== 'Manufacturer') {
    alert('Access Denied: This dashboard is for Manufacturers only.');
    navigate('/login');
    return;
  }

  // 3. Set user once
  setUser(parsedUser);

  // 4. Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [statsRes, shipRes, ledgerRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats'),
        axios.get('http://localhost:5000/api/dashboard/shipments'),
        axios.get('http://localhost:5000/api/dashboard/ledger')
      ]);

      setStats(statsRes.data);
      setShipments(shipRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [navigate]);

  const handleLogout = async () => {
    try {
      // Optional: Call backend to invalidate session/token
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Syncing BESS-PAS Ledger…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">

      {/* SIDEBAR - Now always visible */}
      <aside className="flex w-64 flex-col bg-slate-900 text-white">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <ShieldCheck size={18} />
          </div>
          <span className="font-black tracking-wide text-lg uppercase">BESS-PAS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <SidebarItem icon={<Box size={18} />} label="Products" />
          <SidebarItem icon={<Truck size={18} />} label="Shipments" />
          <SidebarItem icon={<Activity size={18} />} label="IoT Alerts" />
          <SidebarItem icon={<ShieldCheck size={18} />} label="Ledger Audit" />
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

      {/* MAIN */}
      <main className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black">Blockchain-Enabled Secure
Supply-chain and Authenticity System</h1>
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

        {/* CONTENT */}
        <div className="p-8 space-y-8">

          {/* STATS - Fixed to always show in 1 row */}
          <div className="grid grid-cols-4 gap-3 md:gap-6">
            <StatCard title="Active Batches" value={stats.batches} icon={<Box />} />
            <StatCard title="Units Verified" value={stats.units} icon={<ShieldCheck />} />
            <StatCard title="In Transit" value={stats.transit} icon={<Truck />} />
            <StatCard title="High Alerts" value={stats.alerts} icon={<Bell />} alert />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* SHIPMENTS */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border">
              <div className="p-6 border-b flex justify-between">
                <h3 className="font-black">Active Shipments</h3>
              </div>

              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Batch</th>
                    <th className="px-6 py-4">Destination</th>
                    <th className="px-6 py-4 text-center">Temp</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length ? shipments.map((s, i) => (
                    <TableRow key={i} {...s} />
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400">
                        No active shipments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SIDE */}
            <div className="space-y-6">

              {/* TEMP */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
                <h4 className="font-black mb-6 flex justify-center gap-2">
                  <Thermometer className="text-orange-500" size={18} />
                  Cold Chain
                </h4>
                <p className="text-4xl font-black">4.2°C</p>
                <p className="text-xs text-slate-400 mt-2">Safe Range: 2–8°C</p>
              </div>

              {/* LEDGER */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h4 className="font-black mb-4">Audit Ledger</h4>
                <div className="space-y-4">
                  {ledger.length ? ledger.map((l, i) => (
                    <LedgerItem key={i} {...l} />
                  )) : (
                    <p className="text-xs text-slate-400 italic">Awaiting transactions…</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const SidebarItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition
    ${active ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} {label}
  </div>
);

const StatCard = ({ title, value, icon, alert }) => (
  <div className="bg-white border rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start shadow-sm">
    <div className="w-full">
      <p className="text-[10px] md:text-[11px] uppercase font-bold text-slate-400 mb-1">{title}</p>
      <p className="text-xl md:text-3xl font-black">{value}</p>
    </div>
    <div className={`p-2 md:p-3 rounded-xl mt-3 ${alert ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>
      {icon}
    </div>
  </div>
);

const TableRow = ({ id, batch, dest, temp, status }) => (
  <tr className="border-t hover:bg-slate-50">
    <td className="px-6 py-4 font-bold">{id}</td>
    <td className="px-6 py-4 text-slate-500">{batch}</td>
    <td className="px-6 py-4 text-xs text-slate-400">{dest}</td>
    <td className="px-6 py-4 text-center">
      <span className="px-3 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-600">
        {temp}°C
      </span>
    </td>
    <td className="px-6 py-4 text-xs font-bold uppercase">{status}</td>
  </tr>
);

const LedgerItem = ({ title, time, hash }) => (
  <div className="text-xs border-l-2 border-emerald-500 pl-4">
    <p className="font-bold">{title}</p>
    <p className="text-slate-400">{new Date(time).toLocaleTimeString()}</p>
    <p className="font-mono text-[10px] truncate text-slate-300">{hash}</p>
  </div>
);

export default Dashboard;