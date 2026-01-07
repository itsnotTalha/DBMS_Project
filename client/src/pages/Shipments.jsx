import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import { Truck, Plus, MapPin, Thermometer } from 'lucide-react';

const Shipments = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
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
        const response = await axios.get('http://localhost:5000/api/dashboard/shipments');
        setShipments(response.data);
      } catch (err) {
        console.error('Error fetching shipments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Truck className="text-emerald-500" /> Shipments
            </h2>
            <p className="text-sm text-slate-400">Track all your shipments in real-time</p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow">
            <Plus size={18} /> New Shipment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">In Transit</p>
            <p className="text-3xl font-black">24</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Delivered Today</p>
            <p className="text-3xl font-black">12</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Avg Delivery Time</p>
            <p className="text-3xl font-black">3.2d</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="font-black">Active Shipments</h3>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Shipment ID</th>
                <th className="px-6 py-4 text-left">Batch</th>
                <th className="px-6 py-4 text-left">Origin</th>
                <th className="px-6 py-4 text-left">Destination</th>
                <th className="px-6 py-4 text-center">Temperature</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">ETA</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length ? (
                shipments.map((shipment, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold">{shipment.id}</td>
                    <td className="px-6 py-4 text-slate-500">{shipment.batch}</td>
                    <td className="px-6 py-4 text-xs">{shipment.origin || 'Dhaka, BD'}</td>
                    <td className="px-6 py-4 text-xs">{shipment.dest}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-600">
                        {shipment.temp}°C
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600 uppercase">
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{shipment.eta || '2 days'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No active shipments
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