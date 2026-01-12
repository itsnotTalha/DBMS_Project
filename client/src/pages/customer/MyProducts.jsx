import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  Package, RefreshCw, Loader2, Search, ShoppingBag,
  Calendar, CheckCircle, Tag, Store, QrCode
} from 'lucide-react';
import { customerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api';

const MyProducts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'customer') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    fetchMyProducts();
  }, [navigate]);

  const fetchMyProducts = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE}/customer/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyProducts();
    setRefreshing(false);
  };

  // Filter products by search
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.retailer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group products by order
  const productsByOrder = filteredProducts.reduce((acc, product) => {
    const orderId = product.order_id;
    if (!acc[orderId]) {
      acc[orderId] = {
        order_id: orderId,
        order_date: product.order_date,
        outlet_name: product.outlet_name,
        retailer_name: product.retailer_name,
        items: []
      };
    }
    acc[orderId].items.push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={customerMenuItems}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">My Products</h2>
            <p className="text-slate-600">Products you've purchased and received</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop More
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-700">{products.length}</p>
            <p className="text-sm text-emerald-600">Total Products</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">
              {Object.keys(productsByOrder).length}
            </p>
            <p className="text-sm text-blue-600">Completed Orders</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-purple-700">
              {[...new Set(products.map(p => p.category))].length}
            </p>
            <p className="text-sm text-purple-600">Categories</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, category, or retailer..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Products Yet</h3>
            <p className="text-slate-500 mb-4">
              {products.length === 0 
                ? 'Your purchased products will appear here after you confirm receipt'
                : 'No products match your search'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(productsByOrder).map((order) => (
              <div 
                key={order.order_id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Order #{order.order_id}</p>
                        <p className="text-sm text-slate-500">
                          <Store className="w-3 h-3 inline mr-1" />
                          {order.retailer_name || order.outlet_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.items.map((product, index) => (
                    <div 
                      key={`${product.order_id}-${product.product_def_id}-${index}`}
                      className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">{product.name}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {product.category}
                          </p>
                          <p className="text-sm text-emerald-600 font-medium mt-1">
                            Qty: {product.quantity}
                          </p>
                        </div>
                      </div>
                      
                      {/* Verify Button */}
                      <Link
                        to="/customer/verify"
                        className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                      >
                        <QrCode className="w-4 h-4" />
                        Verify Authenticity
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProducts;
