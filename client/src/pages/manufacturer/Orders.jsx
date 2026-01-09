import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Briefcase, Plus, Search, Filter } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const getStatusClasses = (status) => {
  if (!status) return 'bg-slate-100 text-slate-600';
  const statusLower = status.toLowerCase();
  if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-600';
  if (statusLower.includes('confirmed')) return 'bg-green-100 text-green-600';
  if (statusLower.includes('shipped')) return 'bg-blue-100 text-blue-600';
  if (statusLower.includes('delivered')) return 'bg-emerald-100 text-emerald-600';
  if (statusLower.includes('cancelled')) return 'bg-red-100 text-red-600';
  return 'bg-slate-100 text-slate-600';
};

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
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

    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/manufacturer/orders');
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
              <Briefcase className="text-emerald-500" /> B2B Orders
            </h2>
            <p className="text-sm text-slate-400">Manage bulk orders from retailers</p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow">
            <Plus size={18} /> New Order
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b flex gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search orders..."
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold">
              <Filter size={16} /> Filter
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Order ID</th>
                <th className="px-6 py-4 text-left">Retailer</th>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length ? (
                orders.map((order, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold">{order.id || `ORD-${i + 1}`}</td>
                    <td className="px-6 py-4 text-slate-500">{order.retailer || 'N/A'}</td>
                    <td className="px-6 py-4">{order.product || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{order.quantity || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClasses(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{order.date || new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-500 hover:text-emerald-600 font-semibold text-xs">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No orders found
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

export default Orders;
