import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Plus, ArrowLeft } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const AddProduct = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    base_price: '',
    current_stock: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'manufacturer') {
      alert('Access Denied');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
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
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/manufacturer/products', 
        {
          name: formData.name,
          category: formData.category,
          base_price: parseFloat(formData.base_price),
          current_stock: parseInt(formData.current_stock),
          description: formData.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added successfully!');
      navigate('/manufacturer/products');
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/manufacturer/products')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Plus className="text-emerald-500" /> Add New Product
            </h2>
            <p className="text-sm text-slate-400">Create a new product entry</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., Pharmaceutical, Food, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Base Price ($)
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter price"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter initial quantity"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/manufacturer/products')}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddProduct;
