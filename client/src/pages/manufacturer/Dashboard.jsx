import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { manufacturerMenuItems } from './menu';
import {
  TrendingUp, Package, Truck, AlertCircle,
  BarChart3, DollarSign, CheckCircle
} from 'lucide-react';

const ManufacturerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    pendingShipments: 0,
    iotAlerts: 0,
    monthlyRevenue: 0,
    totalShipped: 0,
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    verifyAuthAndLoadData();
  }, []);

  const verifyAuthAndLoadData = async () => {
  try {
    const storedUser =
      JSON.parse(localStorage.getItem('user')) ||
      JSON.parse(sessionStorage.getItem('user'));

    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (!storedUser || storedUser.role?.toLowerCase() !== 'manufacturer') {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    await loadDashboardData(token);
  } catch (err) {
    console.error('Auth verification failed:', err);
    navigate('/login');
  } finally {
    setLoading(false);
  }
};


  const loadDashboardData = async (token) => {
    try {
      // Fetch real data from backend API
      const response = await axios.get('http://localhost:5000/api/manufacturer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { metrics, recentShipments: shipments, topProducts: products } = response.data;

      setStats({
        totalProducts: metrics.total_products || 0,
        activeOrders: metrics.pending_orders || 0,
        pendingShipments: metrics.active_shipments || 0,
        iotAlerts: metrics.iot_alerts || 0,
        monthlyRevenue: metrics.monthly_revenue || 0,
        totalShipped: metrics.total_shipped || 0,
      });

      // Format shipments from API response
      setRecentShipments(
        shipments.map(shipment => ({
          id: shipment.shipment_id,
          product: shipment.product_name,
          quantity: shipment.quantity,
          destination: shipment.destination_retailer,
          status: shipment.status?.toLowerCase() === 'dispatched' ? 'in-transit' : shipment.status?.toLowerCase(),
          temperature: shipment.temperature_range || 'N/A',
          lastUpdate: new Date(shipment.updated_at).toLocaleDateString()
        })) || []
      );

      // Format products from API response
      setTopProducts(
        products.map(product => ({
          id: product.product_id,
          name: product.product_name,
          quantity: product.current_stock,
          revenue: product.total_sales_value || 0
        })) || []
      );
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      // Keep UI responsive with empty data instead of showing error
      setStats({
        totalProducts: 0,
        activeOrders: 0,
        pendingShipments: 0,
        iotAlerts: 0,
        monthlyRevenue: 0,
        totalShipped: 0,
      });
      setRecentShipments([]);
      setTopProducts([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Manufacturer Dashboard</h1>
          <p className="text-slate-600">Manage production, inventory, and shipments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Total Products</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalProducts}</p>
                <p className="text-xs text-emerald-600 mt-2 font-semibold">Active inventory</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Package size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Active Orders</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats.activeOrders}</p>
                <p className="text-xs text-blue-600 mt-2 font-semibold">Pending fulfillment</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Shipments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Pending Shipments</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats.pendingShipments}</p>
                <p className="text-xs text-orange-600 mt-2 font-semibold">In transit</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Truck size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          {/* IoT Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">IoT Alerts</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats.iotAlerts}</p>
                <p className="text-xs text-red-600 mt-2 font-semibold">Requires attention</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Monthly Revenue</p>
                <p className="text-3xl font-black text-slate-900 mt-2">${(stats.monthlyRevenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-green-600 mt-2 font-semibold">+12% from last month</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Shipped */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Total Shipped</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalShipped}</p>
                <p className="text-xs text-purple-600 mt-2 font-semibold">This month</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shipments */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900">Recent Shipments</h2>
              <button
                onClick={() => navigate('/manufacturer/shipments')}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{shipment.id}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        shipment.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {shipment.status === 'confirmed' ? 'Confirmed' : 'In Transit'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{shipment.product}</p>
                    <p className="text-xs text-slate-500 mt-1">Qty: {shipment.quantity} | Temp: {shipment.temperature}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">{shipment.destination}</p>
                    <p className="mt-1">{shipment.lastUpdate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900">Top Products</h2>
              <BarChart3 size={20} className="text-slate-400" />
            </div>

            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{idx + 1}. {product.name}</p>
                      <p className="text-xs text-slate-500">₹{product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(product.quantity / 5000) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{product.quantity} units</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/manufacturer/products')}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition text-center"
          >
            <Package size={24} className="mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-bold text-slate-900">Products</p>
          </button>

          <button
            onClick={() => navigate('/manufacturer/production')}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition text-center"
          >
            <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-bold text-slate-900">Production</p>
          </button>

          <button
            onClick={() => navigate('/manufacturer/shipments')}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition text-center"
          >
            <Truck size={24} className="mx-auto text-orange-600 mb-2" />
            <p className="text-sm font-bold text-slate-900">Shipments</p>
          </button>

          <button
            onClick={() => navigate('/manufacturer/iot-alerts')}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition text-center"
          >
            <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
            <p className="text-sm font-bold text-slate-900">IoT Alerts</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ManufacturerDashboard;