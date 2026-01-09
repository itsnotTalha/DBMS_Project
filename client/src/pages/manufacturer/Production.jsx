import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Briefcase, Plus } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const Production = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProductionForm, setShowNewProductionForm] = useState(false);

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

    const fetchProduction = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/manufacturer/production');
        setProduction(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching production data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduction();
  }, [navigate]);

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
              <Briefcase className="text-emerald-500" /> Production
            </h2>
            <p className="text-sm text-slate-400">Monitor manufacturing and production batches</p>
          </div>
          <button 
            onClick={() => setShowNewProductionForm(!showNewProductionForm)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow"
          >
            <Plus size={18} /> New Batch
          </button>
        </div>

        {showNewProductionForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">Create New Production Batch</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Batch ID"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Product Name"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="date"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg"
                >
                  Create Batch
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProductionForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Active Batches</p>
            <p className="text-3xl font-black">12</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Units Produced</p>
            <p className="text-3xl font-black">4,850</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Completed</p>
            <p className="text-3xl font-black">8</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">In Progress</p>
            <p className="text-3xl font-black text-yellow-600">4</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="font-black">Production History</h3>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Batch ID</th>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Start Date</th>
                <th className="px-6 py-4 text-left">End Date</th>
              </tr>
            </thead>
            <tbody>
              {production.length ? (
                production.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold">{item.batchId || `BAT-${i + 1}`}</td>
                    <td className="px-6 py-4">{item.product || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{item.quantity || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.startDate || new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.endDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    No production batches found
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

export default Production;
