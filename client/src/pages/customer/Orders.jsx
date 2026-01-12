import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  Package, RefreshCw, Loader2, Search, Filter, ChevronDown,
  Truck, Clock, CheckCircle, XCircle, ShoppingCart, Eye,
  MapPin, Calendar
} from 'lucide-react';
import { customerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api';

// Order Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    'Processing': { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    'Out_for_Delivery': { color: 'bg-blue-100 text-blue-700', icon: Truck },
    'Completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'Cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  const { color, icon: Icon } = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Package };
  const displayText = status?.replace(/_/g, ' ') || 'Unknown';
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {displayText}
    </span>
  );
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE}/customer/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toString().includes(searchQuery) ||
      order.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
            <h2 className="text-2xl font-bold text-slate-900 mb-1">My Orders</h2>
            <p className="text-slate-600">Track and manage your orders</p>
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
              <ShoppingCart className="w-4 h-4" />
              Shop Now
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, tracking number, or product..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10 min-w-[200px]">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Status</p>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Orders' },
                      { value: 'Processing', label: 'Processing' },
                      { value: 'Out_for_Delivery', label: 'Out for Delivery' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Cancelled', label: 'Cancelled' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={statusFilter === option.value}
                          onChange={() => setStatusFilter(option.value)}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {orders.length === 0 ? 'No Orders Yet' : 'No Results Found'}
            </h3>
            <p className="text-slate-500 mb-4">
              {orders.length === 0 
                ? 'Start shopping to see your orders here'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {orders.length === 0 && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium"
              >
                <ShoppingCart className="w-4 h-4" />
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.order_id} 
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <Package className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">Order #{order.order_id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.order_date).toLocaleDateString()}
                        </span>
                        {order.tracking_number && (
                          <span className="font-mono text-xs">{order.tracking_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition ${expandedOrder === order.order_id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.order_id && (
                  <div className="border-t">
                    {/* Delivery Info */}
                    {order.tracking_number && (
                      <div className="p-4 bg-blue-50 border-b">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-slate-900">Delivery Status: {order.delivery_status?.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-slate-600">
                              {order.current_location && <span>Location: {order.current_location}</span>}
                            </p>
                            {order.estimated_arrival && (
                              <p className="text-sm text-slate-500">
                                Estimated Delivery: {new Date(order.estimated_arrival).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-700 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-sm text-slate-500">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-slate-900">
                                ${parseFloat(item.unit_price).toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details Footer */}
                    <div className="p-4 bg-slate-50 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm text-slate-600">
                        <p>Payment: {order.payment_method}</p>
                        {order.outlet_name && <p>Pickup: {order.outlet_name}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Track order functionality
                            alert('Order tracking coming soon!');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Track Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerOrders;
