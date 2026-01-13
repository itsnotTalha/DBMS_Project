import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { AlertTriangle, Thermometer, Package, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { retailerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api/retailer';

const Alerts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState({
    recalls: [],
    iot_alerts: [],
    low_stock_alerts: [],
    stats: { active_recalls: 0, iot_issues: 0, low_stock_count: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(response.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [navigate]);

  const totalAlerts = alerts.stats.active_recalls + alerts.stats.iot_issues + alerts.stats.low_stock_count;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={retailerMenuItems}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <AlertTriangle className="text-yellow-500" /> Alerts & Recalls
            </h2>
            <p className="text-sm text-slate-400">Monitor product recalls, IoT issues, and stock alerts</p>
          </div>
          {totalAlerts > 0 && (
            <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold text-sm">
              {totalAlerts} Active Alerts
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Alerts</p>
            <p className="text-2xl font-black">{totalAlerts}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm border-l-4 border-l-red-500">
            <p className="text-xs text-slate-400 uppercase font-bold">Active Recalls</p>
            <p className="text-2xl font-black text-red-600">{alerts.stats.active_recalls}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm border-l-4 border-l-orange-500">
            <p className="text-xs text-slate-400 uppercase font-bold">IoT Issues</p>
            <p className="text-2xl font-black text-orange-600">{alerts.stats.iot_issues}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm border-l-4 border-l-yellow-500">
            <p className="text-xs text-slate-400 uppercase font-bold">Low Stock</p>
            <p className="text-2xl font-black text-yellow-600">{alerts.stats.low_stock_count}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All Alerts' },
            { key: 'recalls', label: 'Recalls' },
            { key: 'iot', label: 'IoT Alerts' },
            { key: 'stock', label: 'Low Stock' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white border hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Recalls Section */}
          {(activeTab === 'all' || activeTab === 'recalls') && alerts.recalls.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-600" />
                <h3 className="font-bold text-red-800">Product Recalls</h3>
              </div>
              <div className="divide-y">
                {alerts.recalls.map((recall, i) => (
                  <div key={i} className="p-4 hover:bg-red-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{recall.product_name}</h4>
                        <p className="text-sm text-slate-500 mt-1">{recall.reason}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>Batch: {recall.batch_number}</span>
                          <span>Manufacturer: {recall.manufacturer}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                          {recall.status}
                        </span>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 justify-end">
                          <Clock size={12} />
                          {new Date(recall.recall_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IoT Alerts Section */}
          {(activeTab === 'all' || activeTab === 'iot') && alerts.iot_alerts.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                <Thermometer size={20} className="text-orange-600" />
                <h3 className="font-bold text-orange-800">IoT Environmental Alerts</h3>
              </div>
              <div className="divide-y">
                {alerts.iot_alerts.map((alert, i) => (
                  <div key={i} className="p-4 hover:bg-orange-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{alert.product_name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            alert.temperature > 25 || alert.temperature < 2 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            🌡️ {alert.temperature}°C
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            alert.humidity > 80 || alert.humidity < 20 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            💧 {alert.humidity}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Batch: {alert.batch_number} • Location: {alert.location || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                          <Clock size={12} />
                          {new Date(alert.recorded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Section */}
          {(activeTab === 'all' || activeTab === 'stock') && alerts.low_stock_alerts.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2">
                <Package size={20} className="text-yellow-600" />
                <h3 className="font-bold text-yellow-800">Low Stock Alerts</h3>
              </div>
              <div className="divide-y">
                {alerts.low_stock_alerts.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-yellow-50/50 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                      <p className="text-xs text-slate-400">{item.category || 'Uncategorized'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black text-yellow-600">{item.quantity_on_hand}</p>
                        <p className="text-xs text-slate-400">units left</p>
                      </div>
                      <button
                        onClick={() => navigate('/retailer/orders')}
                        className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Alerts */}
          {totalAlerts === 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-green-400" />
              <p className="text-slate-600 font-semibold">All Clear!</p>
              <p className="text-sm text-slate-400 mt-2">No active alerts at this time</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
