import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Store, TrendingUp, Users, Package, AlertTriangle, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { retailerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api/retailer';

const RetailerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_stock_quantity: 0,
    unique_products_count: 0,
    low_stock_items: 0,
    pending_orders_count: 0,
    total_customers: 0,
    monthly_revenue: 0,
    recent_customer_orders: [],
    top_selling_products: []
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'retailer') {
      alert('Access Denied: This dashboard is for Retailers only.');
      navigate('/login');
      return;
    }

    setUser(parsedUser);

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={retailerMenuItems}>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome, {user?.name}!</h2>
          <p className="text-slate-600">Manage your retail operations and inventory</p>
        </div>

        {/* All Stats in Single Flex Row */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Package className="text-blue-600" size={20} />
              </div>
              <span className="text-2xl font-black text-slate-900">{stats.total_stock_quantity}</span>
            </div>
            <p className="text-slate-600 text-xs font-medium">Total Stock</p>
          </div>

          <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Store className="text-green-600" size={20} />
              </div>
              <span className="text-2xl font-black text-slate-900">{stats.unique_products_count}</span>
            </div>
            <p className="text-slate-600 text-xs font-medium">Unique Products</p>
          </div>

          <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <AlertTriangle className="text-yellow-600" size={20} />
              </div>
              <span className="text-2xl font-black text-yellow-600">{stats.low_stock_items}</span>
            </div>
            <p className="text-slate-600 text-xs font-medium">Low Stock</p>
          </div>

          <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ShoppingCart className="text-purple-600" size={20} />
              </div>
              <span className="text-2xl font-black text-slate-900">{stats.pending_orders_count}</span>
            </div>
            <p className="text-slate-600 text-xs font-medium">Pending Orders</p>
          </div>

          <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Users className="text-indigo-600" size={20} />
              </div>
              <span className="text-2xl font-black text-slate-900">{stats.total_customers}</span>
            </div>
            <p className="text-slate-600 text-xs font-medium">Total Customers</p>
          </div>

          <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
              <span className="text-2xl font-black text-emerald-600">
                ${stats.monthly_revenue?.toLocaleString() || '0'}
              </span>
            </div>
            <p className="text-slate-600 text-xs font-medium">Monthly Revenue</p>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customer Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" /> Recent Customer Orders
            </h3>
            {stats.recent_customer_orders?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {stats.recent_customer_orders.map((order, i) => (
                  <div key={i} className="flex-1 min-w-[200px] max-w-[280px] p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{order.first_name} {order.last_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-emerald-600">${parseFloat(order.total_amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">No recent orders</p>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" /> Top Selling Products
            </h3>
            {stats.top_selling_products?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {stats.top_selling_products.map((product, i) => (
                  <div key={i} className="flex-1 min-w-[180px] max-w-[240px] p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="font-semibold text-sm truncate">{product.name}</p>
                    </div>
                    <p className="font-bold text-slate-900">{product.total_sold} sold</p>
                    <p className="text-sm text-emerald-600">${parseFloat(product.revenue).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RetailerDashboard;
