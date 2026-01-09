import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Activity, AlertTriangle, Thermometer, Clock } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const ManufacturerIoTAlerts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
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
        const response = await axios.get('http://localhost:5000/api/iot/alerts');
        setAlerts(response.data);
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
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-600 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
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
            <p className="text-sm text-slate-400">Monitor real-time sensor alerts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">Critical</p>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <p className="text-3xl font-black text-red-500">3</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">High</p>
              <AlertTriangle size={16} className="text-orange-500" />
            </div>
            <p className="text-3xl font-black text-orange-500">8</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">Medium</p>
              <Activity size={16} className="text-yellow-500" />
            </div>
            <p className="text-3xl font-black text-yellow-500">15</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase font-bold text-slate-400">Low</p>
              <Activity size={16} className="text-blue-500" />
            </div>
            <p className="text-3xl font-black text-blue-500">24</p>
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
                      <Thermometer size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{alert.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(alert.time).toLocaleString()}
                        </span>
                        <span>Shipment ID: {alert.shipmentId}</span>
                        <span>Sensor: {alert.sensorId}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 border rounded-lg text-sm font-semibold">
                    Resolve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border">
              <Activity size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400">No alerts at this time</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManufacturerIoTAlerts;
