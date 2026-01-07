import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Settings, Users, BarChart3, AlertCircle, LayoutDashboard, Shield, Lock, HelpCircle } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminMenuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: <Users size={18} />, label: 'User Management', path: '#' },
    { icon: <BarChart3 size={18} />, label: 'System Analytics', path: '#' },
    { icon: <AlertCircle size={18} />, label: 'Active Alerts', path: '#' },
    { icon: <Shield size={18} />, label: 'Security', path: '#' },
    { icon: <Lock size={18} />, label: 'Access Control', path: '#' },
    { icon: <Settings size={18} />, label: 'System Settings', path: '#' },
    { icon: <HelpCircle size={18} />, label: 'Support', path: '#' },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Admin') {
      alert('Access Denied: This dashboard is for Admins only.');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={adminMenuItems}>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome, {user?.name}!</h2>
          <p className="text-slate-600">System administration and platform oversight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-blue-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-green-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Total Transactions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="text-yellow-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Active Alerts</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Settings className="text-purple-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">System Status</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">System Logs</h3>
          <p className="text-slate-600 text-sm">No recent system activity</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
