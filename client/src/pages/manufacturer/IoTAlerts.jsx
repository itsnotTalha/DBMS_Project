import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Activity, AlertTriangle, Thermometer, Clock, CheckCircle } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api/manufacturer';

const IoTAlerts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);

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

    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(response.data.alerts || []);
        setStats(response.data.stats || { critical: 0, high: 0, medium: 0, low: 0 });
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high': return 'bg-red-100 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high': return <AlertTriangle size={24} className="text-red-500" />;
      case 'medium': return <Thermometer size={24} className="text-orange-500" />;
      default: return <Activity size={24} className="text-blue-500" />;
    }
  };

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Activity className="text-emerald-500" /> IoT Alerts
            </h2>
            <p className="text-sm text-slate-400">Monitor real-time sensor alerts and reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">Critical</p>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <p className="text-3xl font-black text-red-500">{stats.critical}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">High</p>
              <AlertTriangle size={16} className="text-orange-500" />
            </div>
            <p className="text-3xl font-black text-orange-500">{stats.high}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">Medium</p>
              <Activity size={16} className="text-yellow-500" />
            </div>
            <p className="text-3xl font-black text-yellow-500">{stats.medium}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">Low</p>
              <Activity size={16} className="text-blue-500" />
            </div>
            <p className="text-3xl font-black text-blue-500">{stats.low}</p>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.length ? (
            alerts.map((alert, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl p-6 border-2 shadow-sm ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">
                        {alert.alert_type || 'Alert'} - {alert.related_entity}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(alert.created_at).toLocaleString()}
                        </span>
                        {alert.batch_number && <span>Batch: {alert.batch_number}</span>}
                        <span className={`px-2 py-0.5 rounded ${
                          alert.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {alert.status !== 'Resolved' && (
                    <button className="px-4 py-2 bg-white hover:bg-slate-50 border rounded-lg text-sm font-semibold flex items-center gap-2">
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border">
              <Activity size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400">No alerts at this time</p>
              <p className="text-xs text-slate-300 mt-2">All systems operating normally</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IoTAlerts;
