import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { ShoppingCart, Package, Home } from 'lucide-react';
import { customerMenuItems } from './menu';

const CustomerDashboard = () => {
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
    if (parsedUser.role?.toLowerCase() !== 'customer') {
      alert('Access Denied: This dashboard is for Customers only.');
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
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={customerMenuItems}>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome, {user?.name}!</h2>
          <p className="text-slate-600">Track your orders and manage your account</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="text-emerald-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Active Orders</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Package className="text-blue-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Completed Orders</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Home className="text-orange-500" size={24} />
              <span className="text-xl font-bold text-slate-900">0</span>
            </div>
            <p className="text-slate-600 text-sm">Addresses on File</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Your Recent Orders</h3>
          <p className="text-slate-600 text-sm">No orders yet</p>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
