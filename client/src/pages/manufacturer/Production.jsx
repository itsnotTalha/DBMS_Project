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
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showNewProductionForm, setShowNewProductionForm] = useState(false);
  
  const [formData, setFormData] = useState({
    product_def_id: '',
    quantity: '',
    manufacturing_date: new Date().toISOString().split('T')[0],
    expiry_date: ''
  });

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

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [prodRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/manufacturer/production', config),
          axios.get('http://localhost:5000/api/manufacturer/products', config)
        ]);

        setProduction(Array.isArray(prodRes.data) ? prodRes.data : []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      await axios.post('http://localhost:5000/api/manufacturer/production', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const response = await axios.get('http://localhost:5000/api/manufacturer/production', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProduction(Array.isArray(response.data) ? response.data : []);
      setShowNewProductionForm(false);
      
      setFormData({ 
        product_def_id: '', 
        quantity: '', 
        manufacturing_date: new Date().toISOString().split('T')[0],
        expiry_date: '' 
      });
      
      alert('New production batch created successfully!');
    } catch (err) {
      console.error('Error creating batch:', err);
      alert('Failed to create batch: ' + (err.response?.data?.error || err.message));
    }
  };

  // --- UPDATED STATS LOGIC ---
  // Now counts total unique batches regardless of status
  const activeBatches = production.length; 
  const unitsProduced = production.reduce((acc, p) => acc + (parseInt(p.quantity) || 0), 0);

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
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Create New Production Batch</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 mb-1">Select Product</label>
                  <select
                    name="product_def_id"
                    value={formData.product_def_id}
                    onChange={handleInputChange}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    required
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.length > 0 ? (
                      products.map(p => (
                        <option key={p.product_def_id} value={p.product_def_id}>
                          {p.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No products found</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                    min="1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    name="manufacturing_date"
                    value={formData.manufacturing_date}
                    onChange={handleInputChange}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Create Batch
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProductionForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- STATS SECTION UPDATED: 2 Cards Only --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Active Batches</p>
            <p className="text-3xl font-black">{activeBatches}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Units Produced</p>
            <p className="text-3xl font-black">{unitsProduced.toLocaleString()}</p>
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
                    <td className="px-6 py-4 font-bold">{item.batch_number}</td>
                    <td className="px-6 py-4">{item.product_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{item.quantity || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        item.status === 'Active' ? 'bg-blue-100 text-blue-600' :
                        item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(item.manufacturing_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(item.expiry_date).toLocaleDateString()}</td>
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