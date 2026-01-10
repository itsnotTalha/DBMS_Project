import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Box, Truck, Activity, ShieldCheck,
  Search, Bell, Thermometer, LogOut
} from 'lucide-react';
import Layout from '../Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({ batches: 0, units: 0, transit: 0, alerts: 0 });
  const [shipments, setShipments] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  const manufacturerMenuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Box size={18} />, label: 'Products', path: '/products' },
    { icon: <Truck size={18} />, label: 'Shipments', path: '/shipments' },
    { icon: <Activity size={18} />, label: 'IoT Alerts', path: '/iot-alerts' },
    { icon: <ShieldCheck size={18} />, label: 'Ledger Audit', path: '/ledger-audit' },
  ];

  useEffect(() => {
    const storedUser =
      localStorage.getItem('user') || sessionStorage.getItem('user');

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

    setUser(parsedUser);

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
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          <StatCard title="Active Batches" value={stats.batches} icon={<Box />} />
          <StatCard title="Units Verified" value={stats.units} icon={<ShieldCheck />} />
          <StatCard title="In Transit" value={stats.transit} icon={<Truck />} />
          <StatCard title="High Alerts" value={stats.alerts} icon={<Bell />} alert />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
              <h4 className="font-black mb-6 flex justify-center gap-2">
                <Thermometer className="text-orange-500" size={18} />
                Cold Chain
              </h4>
              <p className="text-4xl font-black">4.2°C</p>
              <p className="text-xs text-slate-400 mt-2">Safe Range: 2–8°C</p>
            </div>

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
    </Layout>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition
    ${active ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
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