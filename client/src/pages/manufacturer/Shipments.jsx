import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Truck, MapPin, Package } from 'lucide-react';
import { manufacturerMenuItems } from './menu';
import { API_MANUFACTURER } from '../../config/api';

const API_BASE = API_MANUFACTURER;

const Shipments = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({ in_transit: 0, delivered: 0, total: 0 });
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

    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/shipments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShipments(response.data.shipments || []);
        setStats(response.data.stats || { in_transit: 0, delivered: 0, total: 0 });
      } catch (err) {
        console.error('Error fetching shipments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shipped': return 'bg-blue-100 text-blue-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'approved': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Truck className="text-emerald-500" /> Shipments
            </h2>
            <p className="text-sm text-slate-400">Track all your shipments and deliveries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">In Transit</p>
            <p className="text-3xl font-black text-blue-500">{stats.in_transit}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Delivered</p>
            <p className="text-3xl font-black text-green-500">{stats.delivered}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Total Shipments</p>
            <p className="text-3xl font-black">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="font-black">Shipment History</h3>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Order ID</th>
                <th className="px-6 py-4 text-left">Batch</th>
                <th className="px-6 py-4 text-left">Destination</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length ? (
                shipments.map((shipment, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold">#{shipment.shipment_id}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {shipment.batch_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold">{shipment.destination}</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">{shipment.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ${parseFloat(shipment.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {shipment.order_date ? new Date(shipment.order_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    <Package size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>No shipments yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Shipments;