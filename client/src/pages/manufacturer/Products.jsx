import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Box, Plus, Search, Filter, AlertCircle, Edit2 } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const ManufacturerProducts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    verifyAuthAndLoadProducts();
  }, [navigate]);

  const verifyAuthAndLoadProducts = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!storedUser || storedUser.role?.toLowerCase() !== 'manufacturer') {
        navigate('/login');
        return;
      }

      setUser(storedUser);
      
      // Fetch real products from API
      const response = await axios.get('http://localhost:5000/api/manufacturer/products', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(response.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStock = async (productId) => {
    const newStock = prompt('Enter new stock quantity:');
    if (newStock !== null && !isNaN(newStock)) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/manufacturer/products/${productId}/stock`, 
          { newStock: parseInt(newStock) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refresh products
        verifyAuthAndLoadProducts();
      } catch (err) {
        alert('Error updating stock: ' + err.message);
      }
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
            <p className="text-sm text-slate-400">Manage your product catalog and inventory</p>
          </div>
          <button 
            onClick={() => navigate('/manufacturer/add-product')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b flex gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-6 py-4 text-left">Current Stock</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr key={product.product_def_id} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{product.product_def_id}</td>
                    <td className="px-6 py-4 font-semibold">{product.name}</td>
                    <td className="px-6 py-4 text-slate-600">{product.category || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{product.current_stock}</span>
                        {product.current_stock < 20 && (
                          <AlertCircle size={16} className="text-orange-500" title="Low stock" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">${parseFloat(product.base_price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        product.is_active 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleUpdateStock(product.product_def_id)}
                        className="text-emerald-500 hover:text-emerald-600 font-semibold text-xs flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Update Stock
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    {searchTerm ? 'No products match your search' : 'No products found'}
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

export default ManufacturerProducts;
