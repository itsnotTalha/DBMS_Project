import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { Users, BarChart3, AlertTriangle, Shield, Zap, Settings } from 'lucide-react';
import { adminMenuItems } from './menu';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'admin') {
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
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={adminMenuItems}>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
          <p className="text-slate-600">System overview and management</p>
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
            <p className="text-slate-600 text-sm">Active Products</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">System Alerts</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Shield className="text-purple-500" size={24} />
              <span className="text-xl font-bold text-slate-900">100%</span>
            </div>
            <p className="text-slate-600 text-sm">System Health</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
            <p className="text-slate-600 text-sm">No recent activity</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">System Status</h3>
            <p className="text-slate-600 text-sm">All systems operational</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
