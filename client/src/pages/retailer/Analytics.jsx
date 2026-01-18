import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { BarChart3, TrendingUp, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { retailerMenuItems } from './menu';
import { API_RETAILER } from '../../config/api';

const API_BASE = API_RETAILER;

const Analytics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({
    sales_trend: [],
    top_products: [],
    category_breakdown: [],
    customer_stats: { new_customers: 0, repeat_customers: 0, avg_order_value: 0 },
    inventory_metrics: { total_units: 0, inventory_value: 0, unique_products: 0 },
    b2b_spending: { monthly_spending: 0, total_spending: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Retailer') {
      alert('Access Denied');
      navigate('/login');
      return;
    }

    setUser(parsedUser);

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  const getMaxRevenue = () => {
    return Math.max(...analytics.sales_trend.map(s => parseFloat(s.revenue || 0)), 1);
  };

  const getMaxSales = () => {
    return Math.max(...analytics.top_products.map(p => parseInt(p.sales_count || 0)), 1);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={retailerMenuItems}>
      <div className="p-8 h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <BarChart3 className="text-blue-500" /> Analytics
          </h2>
          <p className="text-sm text-slate-400">Business insights and performance metrics</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <DollarSign size={18} className="text-emerald-500 mb-2" />
            <p className="text-xs text-slate-400 uppercase font-bold">Revenue</p>
            <p className="text-xl font-black text-emerald-600">
              ${analytics.sales_trend.reduce((sum, s) => sum + parseFloat(s.revenue || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <ShoppingCart size={18} className="text-blue-500 mb-2" />
            <p className="text-xs text-slate-400 uppercase font-bold">Orders</p>
            <p className="text-xl font-black">
              {analytics.sales_trend.reduce((sum, s) => sum + parseInt(s.order_count || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <Users size={18} className="text-purple-500 mb-2" />
            <p className="text-xs text-slate-400 uppercase font-bold">New Customers</p>
            <p className="text-xl font-black text-purple-600">{analytics.customer_stats.new_customers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <Users size={18} className="text-indigo-500 mb-2" />
            <p className="text-xs text-slate-400 uppercase font-bold">Repeat Customers</p>
            <p className="text-xl font-black text-indigo-600">{analytics.customer_stats.repeat_customers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <Package size={18} className="text-orange-500 mb-2" />
            <p className="text-xs text-slate-400 uppercase font-bold">Inventory Value</p>
            <p className="text-xl font-black text-orange-600">
              ${analytics.inventory_metrics.inventory_value.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <TrendingUp size={18} className="text-pink-500 mb-2" />
            <p className="text-xs text-slate-400 uppercase font-bold">Avg Order</p>
            <p className="text-xl font-black text-pink-600">
              ${analytics.customer_stats.avg_order_value.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" /> Sales Trend (6 Months)
            </h3>
            {analytics.sales_trend.length > 0 ? (
              <div className="space-y-3">
                {analytics.sales_trend.map((month, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs font-mono w-20 text-slate-500">{month.month}</span>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg transition-all"
                        style={{ width: `${(parseFloat(month.revenue || 0) / getMaxRevenue()) * 100}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold">
                        ${parseFloat(month.revenue || 0).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 w-16 text-right">{month.order_count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No sales data available</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" /> Top Selling Products
            </h3>
            {analytics.top_products.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_products.slice(0, 8).map((product, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm truncate">{product.product_name}</span>
                        <span className="text-xs text-slate-400">{product.sales_count} sold</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(parseInt(product.sales_count || 0) / getMaxSales()) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 w-20 text-right">
                      ${parseFloat(product.revenue || 0).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No product data available</p>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-500" /> Sales by Category
            </h3>
            {analytics.category_breakdown.length > 0 ? (
              <div className="space-y-4">
                {analytics.category_breakdown.map((cat, i) => {
                  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'];
                  const totalRevenue = analytics.category_breakdown.reduce((sum, c) => sum + parseFloat(c.revenue || 0), 0);
                  const percentage = totalRevenue > 0 ? (parseFloat(cat.revenue || 0) / totalRevenue) * 100 : 0;
                  
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm">{cat.category || 'Uncategorized'}</span>
                        <span className="text-sm text-slate-500">
                          ${parseFloat(cat.revenue || 0).toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No category data available</p>
            )}
          </div>

          {/* Business Metrics */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-orange-500" /> Business Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Inventory Units</p>
                <p className="text-2xl font-black">{analytics.inventory_metrics.total_units}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Unique Products</p>
                <p className="text-2xl font-black">{analytics.inventory_metrics.unique_products}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Monthly B2B Spend</p>
                <p className="text-2xl font-black text-red-600">
                  ${analytics.b2b_spending.monthly_spending.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total B2B Spend</p>
                <p className="text-2xl font-black text-red-600">
                  ${analytics.b2b_spending.total_spending.toFixed(2)}
                </p>
              </div>

              {/* Profit Indicator */}
              <div className="col-span-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Est. Gross Profit (6 mo)</p>
                <p className="text-3xl font-black text-emerald-600">
                  ${(
                    analytics.sales_trend.reduce((sum, s) => sum + parseFloat(s.revenue || 0), 0) -
                    analytics.b2b_spending.total_spending
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Revenue - B2B Costs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
