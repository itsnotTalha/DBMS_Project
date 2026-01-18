import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  Package, RefreshCw, Loader2, Search, ChevronDown,
  CheckCircle, Truck, XCircle, User, Check, X, Clock, 
  AlertTriangle, ShoppingBag, DollarSign
} from 'lucide-react';
import { retailerMenuItems } from './menu';
import { API_BASE } from '../../config/api';

// Order Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    'Processing': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending Approval' },
    'Out_for_Delivery': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck, label: 'Shipped' },
    'Completed': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Delivered' },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' }
  };

  const { color, icon: Icon, label } = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Package, label: status };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// Stock Status Badge
const StockBadge = ({ inStock, available, needed }) => {
  if (inStock) {
    return (
      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        In Stock ({available})
      </span>
    );
  }
  return (
    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" />
      Low Stock ({available}/{needed})
    </span>
  );
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, shipped: 0, completed: 0, cancelled: 0 });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchOrders = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE}/retailer/customer-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
      setStats(response.data.stats || { pending: 0, shipped: 0, completed: 0, cancelled: 0 });
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [navigate, fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleApproveOrder = async (orderId) => {
    setProcessingAction(orderId);
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_BASE}/retailer/customer-orders/${orderId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.low_stock_alert && response.data.low_stock_alert.length > 0) {
        const alertItems = response.data.low_stock_alert.map(i => `${i.name} (${i.quantity_on_hand} left)`).join(', ');
        alert(`Order approved! ⚠️ Low stock alert: ${alertItems}`);
      } else {
        alert('Order approved and shipped successfully!');
      }
      
      await fetchOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      alert(error.response?.data?.error || 'Failed to approve order');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectModal) return;
    
    setProcessingAction(rejectModal);
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE}/retailer/customer-orders/${rejectModal}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectModal(null);
      setRejectReason('');
      await fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert(error.response?.data?.error || 'Failed to reject order');
    } finally {
      setProcessingAction(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toString().includes(searchQuery) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Customer Orders</h2>
            <p className="text-slate-600">Review, approve, and fulfill customer orders</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div 
            className={`rounded-xl p-4 cursor-pointer transition border-2 ${statusFilter === 'Processing' ? 'bg-yellow-100 border-yellow-400' : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'}`}
            onClick={() => setStatusFilter(statusFilter === 'Processing' ? 'all' : 'Processing')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <p className="text-sm text-yellow-600">Pending Approval</p>
          </div>
          <div 
            className={`rounded-xl p-4 cursor-pointer transition border-2 ${statusFilter === 'Out_for_Delivery' ? 'bg-blue-100 border-blue-400' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}
            onClick={() => setStatusFilter(statusFilter === 'Out_for_Delivery' ? 'all' : 'Out_for_Delivery')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700">{stats.shipped}</p>
            </div>
            <p className="text-sm text-blue-600">In Transit</p>
          </div>
          <div 
            className={`rounded-xl p-4 cursor-pointer transition border-2 ${statusFilter === 'Completed' ? 'bg-green-100 border-green-400' : 'bg-green-50 border-green-200 hover:border-green-300'}`}
            onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'all' : 'Completed')}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <p className="text-sm text-green-600">Delivered</p>
          </div>
          <div 
            className={`rounded-xl p-4 cursor-pointer transition border-2 ${statusFilter === 'Cancelled' ? 'bg-red-100 border-red-400' : 'bg-red-50 border-red-200 hover:border-red-300'}`}
            onClick={() => setStatusFilter(statusFilter === 'Cancelled' ? 'all' : 'Cancelled')}
          >
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
            </div>
            <p className="text-sm text-red-600">Rejected</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex gap-4">
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
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
                Clear Filter <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Orders Found</h3>
            <p className="text-slate-500">{orders.length === 0 ? 'No customer orders yet.' : 'Try adjusting your search or filter'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.order_id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${order.status === 'Processing' && !order.can_fulfill ? 'border-orange-300' : 'border-slate-200'}`}>
                {order.status === 'Processing' && !order.can_fulfill && (
                  <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700"><strong>Insufficient stock:</strong> {order.insufficient_items?.join(', ')}</span>
                  </div>
                )}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-50" onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${order.status === 'Processing' ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                      <User className={`w-6 h-6 ${order.status === 'Processing' ? 'text-yellow-600' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">Order #{order.order_id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-slate-600">{order.first_name} {order.last_name} • {order.customer_email}</p>
                      <p className="text-xs text-slate-400">{new Date(order.order_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                    </div>
                    {order.status === 'Processing' && (
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleApproveOrder(order.order_id); }} disabled={processingAction === order.order_id || !order.can_fulfill} title={!order.can_fulfill ? 'Insufficient stock' : 'Approve and ship'} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${order.can_fulfill ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                          {processingAction === order.order_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRejectModal(order.order_id); }} disabled={processingAction === order.order_id} className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition ${expandedOrder === order.order_id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {expandedOrder === order.order_id && (
                  <div className="border-t p-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-sm text-slate-500">{item.category}</p>
                            {order.status === 'Processing' && <StockBadge inStock={item.in_stock === 1} available={item.available_qty} needed={item.quantity} />}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">${parseFloat(item.unit_price).toFixed(2)} × {item.quantity}</p>
                            <p className="text-sm font-bold text-slate-700">${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-slate-100 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {order.payment_method && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{order.payment_method}</span>}
                        {order.phone_number && <span>📞 {order.phone_number}</span>}
                      </div>
                      <p className="text-lg font-bold text-slate-900">Total: ${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                    {order.tracking_number && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-blue-700"><span className="font-medium">Tracking:</span> {order.tracking_number}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> Reject Order #{rejectModal}</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Rejection Reason (optional)</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="E.g., Out of stock, Delivery area not supported..." className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={3} />
              <div className="mt-4 flex gap-3">
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Cancel</button>
                <button onClick={handleRejectOrder} disabled={processingAction === rejectModal} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {processingAction === rejectModal ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomerOrders;
