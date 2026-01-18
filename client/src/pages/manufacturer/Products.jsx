import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Box, Plus, Search, Filter, Save, X } from 'lucide-react';
import { manufacturerMenuItems } from './menu';
import { API_MANUFACTURER } from '../../config/api';

const Products = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    image_url: ''
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

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_MANUFACTURER}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
      await axios.post(`${API_MANUFACTURER}/products`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh products list
      const response = await axios.get(`${API_MANUFACTURER}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
      
      setShowAddForm(false);
      setFormData({ name: '', description: '', category: '', base_price: '', image_url: '' });
      alert('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product: ' + (err.response?.data?.error || err.message));
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
              <Box className="text-emerald-500" /> Products
            </h2>
            <p className="text-sm text-slate-400">Manage your product catalog</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />} 
            {showAddForm ? 'Close' : 'Add Product'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Add New Product Definition</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  placeholder="Base Price ($)"
                  step="0.01"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Image URL (optional)"
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product Description"
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors"
              >
                <Save size={18} /> Save Product
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b flex gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search products..."
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold">
              <Filter size={16} /> Filter
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Product ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
  {products.length ? (
    products.map((product) => (
      // KEY: Use the unique 'product_def_id' from your SQL schema 
      <tr key={product.product_def_id} className="border-t hover:bg-slate-50">
        
        {/* ID COLUMN: Display 'product_def_id'  */}
        <td className="px-6 py-4 font-bold text-xs font-mono">
          #{product.product_def_id}
        </td>

        {/* NAME COLUMN: Database uses 'name' and 'description'  */}
        <td className="px-6 py-4">
          <div className="font-bold">{product.name}</div>
          <div className="text-xs text-slate-500 truncate max-w-xs">
            {product.description || 'No description'}
          </div>
        </td>

        {/* CATEGORY COLUMN: Database uses 'category'  */}
        <td className="px-6 py-4 text-slate-500">
          {product.category || 'N/A'}
        </td>

        {/* PRICE COLUMN: Database uses 'base_price'  */}
        <td className="px-6 py-4 font-mono">
          ${parseFloat(product.base_price || 0).toFixed(2)}
        </td>

        {/* STOCK COLUMN: Database uses 'current_stock'  */}
        <td className="px-6 py-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            (product.current_stock || 0) > 10 ? 'bg-emerald-100 text-emerald-600' : 
            (product.current_stock || 0) > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
          }`}>
            {product.current_stock || 0} units
          </span>
        </td>

        <td className="px-6 py-4">
          <button className="text-emerald-500 hover:text-emerald-600 font-semibold text-xs">
            Edit
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center py-10 text-slate-400">
        No products found
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

export default Products;