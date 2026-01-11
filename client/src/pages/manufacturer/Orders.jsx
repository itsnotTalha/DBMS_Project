import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Briefcase, Search, Filter, Check, X } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const getStatusClasses = (status) => {
  if (!status) return 'bg-slate-100 text-slate-600';
  const statusLower = status.toLowerCase();
  if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-600';
  if (statusLower.includes('approved')) return 'bg-blue-100 text-blue-600';
  if (statusLower.includes('shipped')) return 'bg-emerald-100 text-emerald-600';
  if (statusLower.includes('delivered')) return 'bg-green-100 text-green-600';
  if (statusLower.includes('rejected')) return 'bg-red-100 text-red-600';
  return 'bg-slate-100 text-slate-600';
};

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('direct_delivery');
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const verifyAuthAndLoadOrders = async () => {
      try {
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

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/manufacturer/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    verifyAuthAndLoadOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/manufacturer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder || !fulfillmentType) return;
    try {
      setProcessingOrderId(selectedOrder.b2b_order_id);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/manufacturer/orders/${selectedOrder.b2b_order_id}/accept`,
        { fulfillment_type: fulfillmentType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Order accepted successfully!');
      setShowModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert('Error accepting order: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to reject this order?')) {
      try {
        setProcessingOrderId(orderId);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await axios.post(
          `http://localhost:5000/api/manufacturer/orders/${orderId}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Order rejected');
        fetchOrders();
      } catch (err) {
        alert('Error rejecting order: ' + (err.response?.data?.error || err.message));
      } finally {
        setProcessingOrderId(null);
      }
    }
  };

  const filteredOrders = orders.filter(order =>
    order.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.b2b_order_id?.toString().includes(searchTerm)
  );

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
              <Briefcase className="text-emerald-500" size={28} /> B2B Orders
            </h2>
            <p className="text-sm text-slate-400">Manage bulk orders from retailers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b flex gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search by retailer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left">Order ID</th>
                  <th className="px-6 py-4 text-left">Retailer</th>
                  <th className="px-6 py-4 text-left">Items</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length ? (
                  filteredOrders.map((order, i) => (
                    <tr key={i} className="border-t hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold">#{order.b2b_order_id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{order.business_name || 'N/A'}</div>
                        <div className="text-xs text-slate-400">{order.tax_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-500 hover:text-blue-600 font-semibold text-xs underline"
                        >
                          {order.items?.length || 0} items
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClasses(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {order.status?.toLowerCase() === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowModal(true);
                                setFulfillmentType('direct_delivery');
                              }}
                              disabled={processingOrderId === order.b2b_order_id}
                              className="text-green-500 hover:text-green-600 font-semibold text-xs flex items-center gap-1 disabled:opacity-50"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.b2b_order_id)}
                              disabled={processingOrderId === order.b2b_order_id}
                              className="text-red-500 hover:text-red-600 font-semibold text-xs flex items-center gap-1 disabled:opacity-50"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No action</span>
                        )}
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
      </div>

      {/* Modal for order details and acceptance */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-blue-50">
              <h3 className="text-lg font-black">Order #{selectedOrder.b2b_order_id}</h3>
              <p className="text-sm text-slate-500 mt-1">{selectedOrder.business_name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-slate-400 mb-3">ORDER ITEMS:</p>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="mb-3 pb-3 border-b last:border-0">
                    <p className="text-sm font-semibold">Product ID: {item.product_def_id}</p>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Qty: {item.quantity_ordered}</span>
                      <span>${parseFloat(item.unit_price || 0).toFixed(2)} each</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-bold mb-3">How would you like to fulfill this order?</p>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-emerald-50" style={{borderColor: fulfillmentType === 'direct_delivery' ? '#10b981' : '#cbd5e1'}}>
                    <input
                      type="radio"
                      name="fulfillment"
                      value="direct_delivery"
                      checked={fulfillmentType === 'direct_delivery'}
                      onChange={(e) => setFulfillmentType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold text-sm">Direct Delivery</p>
                      <p className="text-xs text-slate-500">Ship from existing stock</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50" style={{borderColor: fulfillmentType === 'production' ? '#3b82f6' : '#cbd5e1'}}>
                    <input
                      type="radio"
                      name="fulfillment"
                      value="production"
                      checked={fulfillmentType === 'production'}
                      onChange={(e) => setFulfillmentType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold text-sm">Production Request</p>
                      <p className="text-xs text-slate-500">Create production orders</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptOrder}
                disabled={processingOrderId === selectedOrder.b2b_order_id}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {processingOrderId === selectedOrder.b2b_order_id ? 'Processing...' : 'Accept Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for showing order items */}
      {!showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-slate-50">
              <h3 className="text-lg font-black">Order #{selectedOrder.b2b_order_id} Items</h3>
              <p className="text-sm text-slate-500 mt-1">{selectedOrder.business_name}</p>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold">Product ID: {item.product_def_id}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm text-slate-600 mt-1">
                      <div>Qty: <span className="font-bold">{item.quantity_ordered}</span></div>
                      <div>Unit Price: <span className="font-bold">${parseFloat(item.unit_price).toFixed(2)}</span></div>
                      <div>Subtotal: <span className="font-bold">${(item.quantity_ordered * item.unit_price).toFixed(2)}</span></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Status: {item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
