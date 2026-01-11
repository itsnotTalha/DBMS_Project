import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Box, Truck, Activity, ShieldCheck,
  Bell, Thermometer, Package, ClipboardList
} from 'lucide-react';
import Layout from '../Layout';

const API_BASE = 'http://localhost:5000/api/manufacturer';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_products: 0,
    active_batches: 0,
    pending_orders: 0,
    total_stock: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const manufacturerMenuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/manufacturer/dashboard' },
    { icon: <Box size={18} />, label: 'Products', path: '/manufacturer/products' },
    { icon: <ClipboardList size={18} />, label: 'Orders', path: '/manufacturer/orders' },
    { icon: <Package size={18} />, label: 'Production', path: '/manufacturer/production' },
    { icon: <Truck size={18} />, label: 'Shipments', path: '/manufacturer/shipments' },
    { icon: <Activity size={18} />, label: 'IoT Alerts', path: '/manufacturer/iot-alerts' },
    { icon: <ShieldCheck size={18} />, label: 'Ledger Audit', path: '/manufacturer/ledger-audit' },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Manufacturer') {
      alert('Access Denied');
      navigate('/login');
      return;
    }
    setUser(parsedUser);

    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const [statsRes, ledgerRes] = await Promise.all([
          axios.get(`${API_BASE}/dashboard`, authConfig),
          axios.get(`${API_BASE}/ledger`, authConfig)
        ]);

        setStats(statsRes.data);
        setRecentTransactions(ledgerRes.data.transactions?.slice(0, 5) || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
          <p className="text-sm font-semibold text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          <StatCard title="Total Products" value={stats.total_products} icon={<Box />} />
          <StatCard title="Active Batches" value={stats.active_batches} icon={<Package />} />
          <StatCard title="Pending Orders" value={stats.pending_orders} icon={<ClipboardList />} alert={stats.pending_orders > 0} />
          <StatCard title="Total Stock" value={stats.total_stock} icon={<ShieldCheck />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border">
            <div className="p-6 border-b flex justify-between">
              <h3 className="font-black">Recent Transactions</h3>
            </div>

            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Batch</th>
                  <th className="px-6 py-4 text-left">Action</th>
                  <th className="px-6 py-4 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length ? recentTransactions.map((tx, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold">{tx.product_name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{tx.batch_number}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-600">
                        {tx.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-400">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h4 className="font-black mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/manufacturer/products')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-emerald-50 rounded-lg text-sm font-semibold flex items-center gap-3"
                >
                  <Box size={16} className="text-emerald-500" /> Add New Product
                </button>
                <button 
                  onClick={() => navigate('/manufacturer/production')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-emerald-50 rounded-lg text-sm font-semibold flex items-center gap-3"
                >
                  <Package size={16} className="text-emerald-500" /> Create Batch
                </button>
                <button 
                  onClick={() => navigate('/manufacturer/orders')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-emerald-50 rounded-lg text-sm font-semibold flex items-center gap-3"
                >
                  <ClipboardList size={16} className="text-emerald-500" /> View Orders
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h4 className="font-black mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={18} />
                Audit Ledger
              </h4>
              <div className="space-y-4">
                {recentTransactions.slice(0, 3).map((tx, i) => (
                  <LedgerItem key={i} tx={tx} />
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No transactions yet...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// --- Sub-components ---
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

const LedgerItem = ({ tx }) => (
  <div className="text-xs border-l-2 border-emerald-500 pl-4">
    <p className="font-bold">{tx.action} - {tx.product_name}</p>
    <p className="text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</p>
    <p className="font-mono text-[10px] truncate text-slate-300">{tx.current_hash}</p>
  </div>
);

export default Dashboard;