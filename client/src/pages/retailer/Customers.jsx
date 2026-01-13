import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Users, Search, Mail, Phone, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { retailerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api/retailer';

const Customers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(response.data.customers || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate]);

  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number?.includes(searchTerm)
  );

  const getTotalStats = () => {
    return {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0),
      totalOrders: customers.reduce((sum, c) => sum + parseInt(c.total_orders || 0), 0),
      avgOrderValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0) / 
          customers.reduce((sum, c) => sum + parseInt(c.total_orders || 0), 1)
        : 0
    };
  };

  const stats = getTotalStats();

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
              <Users className="text-blue-500" /> Customers
            </h2>
            <p className="text-sm text-slate-400">View all customers who purchased from you</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              className="pl-9 pr-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Customers</p>
            <p className="text-2xl font-black">{stats.totalCustomers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-600">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Orders</p>
            <p className="text-2xl font-black">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Avg Order Value</p>
            <p className="text-2xl font-black text-blue-600">${stats.avgOrderValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-xs uppercase text-slate-500">Customer</th>
                    <th className="text-left py-4 px-6 font-bold text-xs uppercase text-slate-500">Contact</th>
                    <th className="text-center py-4 px-6 font-bold text-xs uppercase text-slate-500">Orders</th>
                    <th className="text-right py-4 px-6 font-bold text-xs uppercase text-slate-500">Total Spent</th>
                    <th className="text-right py-4 px-6 font-bold text-xs uppercase text-slate-500">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCustomers.map((customer, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{customer.first_name} {customer.last_name}</p>
                            <p className="text-xs text-slate-400">ID: {customer.customer_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />
                            {customer.email}
                          </p>
                          {customer.phone_number && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {customer.phone_number}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                          <ShoppingBag size={14} />
                          {customer.total_orders}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-emerald-600 text-lg">
                          ${parseFloat(customer.total_spent || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm text-slate-500 flex items-center justify-end gap-1">
                          <Calendar size={14} />
                          {customer.last_purchase 
                            ? new Date(customer.last_purchase).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400">No customers found</p>
              <p className="text-sm text-slate-300 mt-2">Customers will appear here after they make purchases</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
