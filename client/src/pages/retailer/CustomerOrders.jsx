import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  Package, RefreshCw, Loader2, Search, Filter, ChevronDown,
  CheckCircle, Truck, XCircle, Send, User
} from 'lucide-react';
import { retailerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api';

// Order Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    'Processing': { color: 'bg-yellow-100 text-yellow-700', icon: Package, label: 'Processing' },
    'Out_for_Delivery': { color: 'bg-blue-100 text-blue-700', icon: Truck, label: 'Shipped' },
    'Completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
    'Cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' }
  };

  const { color, icon: Icon, label } = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Package, label: status };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
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
  const [processingAction, setProcessingAction] = useState(null);
  
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
    if (parsedUser.role !== 'Retailer') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE}/retailer/customer-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId) => {
    setProcessingAction(orderId);
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE}/retailer/customer-orders/${orderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders();
    } catch (error) {
      console.error('Error shipping order:', error);
      alert(error.response?.data?.error || 'Failed to ship order');
    } finally {
      setProcessingAction(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toString().includes(searchQuery) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count by status
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const shippedCount = orders.filter(o => o.status === 'Out_for_Delivery').length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={retailerMenuItems}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Customer Orders</h2>
            <p className="text-slate-600">Manage and fulfill customer orders</p>
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-700">{processingCount}</p>
            <p className="text-sm text-yellow-600">Ready to Ship</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">{shippedCount}</p>
            <p className="text-sm text-blue-600">In Transit</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-700">
              {orders.filter(o => o.status === 'Completed').length}
            </p>
            <p className="text-sm text-green-600">Completed</p>
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
                placeholder="Search by order ID, customer name or email..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      { value: 'Out_for_Delivery', label: 'Shipped' },
                      { value: 'Completed', label: 'Completed' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={statusFilter === option.value}
                          onChange={() => setStatusFilter(option.value)}
                          className="text-blue-500 focus:ring-blue-500"
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Orders Found</h3>
            <p className="text-slate-500">
              {orders.length === 0 
                ? 'No customer orders yet'
                : 'Try adjusting your search or filter'}
            </p>
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
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">Order #{order.order_id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {order.first_name} {order.last_name} • {order.customer_email}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.order_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                    </div>
                    
                    {/* Action Buttons */}
                    {order.status === 'Processing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptOrder(order.order_id);
                        }}
                        disabled={processingAction === order.order_id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {processingAction === order.order_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Ship Order
                      </button>
                    )}
                    
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition ${expandedOrder === order.order_id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.order_id && (
                  <div className="border-t p-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-full object-cover"
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
                              ${parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {order.tracking_number && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Tracking:</span> {order.tracking_number}
                        </p>
                      </div>
                    )}
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
