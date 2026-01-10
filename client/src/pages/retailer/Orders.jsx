import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { Package, Plus, Store } from 'lucide-react';
import { retailerMenuItems } from './menu';

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [manufacturerProducts, setManufacturerProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Retailer') { alert('Access Denied'); navigate('/login'); return; }
    setUser(parsedUser);

    // Fetch data
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('[Orders] Token available:', !!token);
        console.log('[Orders] Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        
        if (!token) {
          console.error('[Orders] No token found - cannot fetch data');
          setLoading(false);
          return;
        }
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        console.log('[Orders] Fetching from /api/retailer/orders and /api/retailer/manufacturers');
        
        const [ordersRes, manufacturersRes] = await Promise.all([
          fetch('http://localhost:5000/api/retailer/orders', { headers }),
          fetch('http://localhost:5000/api/retailer/manufacturers', { headers })
        ]);
        
        console.log('[Orders] Orders response status:', ordersRes.status);
        console.log('[Orders] Manufacturers response status:', manufacturersRes.status);
        
        if (!ordersRes.ok) {
          const errData = await ordersRes.text();
          console.error('[Orders] Orders API error - Status:', ordersRes.status, 'Response:', errData);
        }
        
        if (!manufacturersRes.ok) {
          const errData = await manufacturersRes.text();
          console.error('[Orders] Manufacturers API error - Status:', manufacturersRes.status, 'Response:', errData);
          throw new Error(`Failed to fetch manufacturers: ${manufacturersRes.status}`);
        }
        
        const ordersData = await ordersRes.json();
        const manufacturersData = await manufacturersRes.json();
        
        console.log('[Orders] Orders data received:', ordersData);
        console.log('[Orders] Manufacturers data received:', manufacturersData);
        console.log('[Orders] Manufacturers count:', manufacturersData?.length || 0);
        
        if (Array.isArray(manufacturersData) && manufacturersData.length > 0) {
          console.log('[Orders] ✅ Setting manufacturers in state:', manufacturersData.length);
        } else {
          console.warn('[Orders] ⚠️ Empty manufacturers array received');
        }
        
        setOrders(Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : []);
        setManufacturers(Array.isArray(manufacturersData) ? manufacturersData : []);
      } catch (error) {
        console.error('[Orders] Failed to fetch data:', error);
        alert('Error loading manufacturers. Please check console for details.');
        setOrders([]);
        setManufacturers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleManufacturerSelect = async (manufacturerId) => {
    try {
      console.log('[Orders] Manufacturer selected:', manufacturerId);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('[Orders] Token available for product fetch:', !!token);
      
      const response = await fetch(`http://localhost:5000/api/retailer/manufacturers/${manufacturerId}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('[Orders] Products response status:', response.status);
      
      if (!response.ok) {
        const errData = await response.text();
        console.error('[Orders] Products API error:', response.status, errData);
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const products = await response.json();
      console.log('[Orders] Products received:', products);
      console.log('[Orders] Products count:', products?.length || 0);
      
      setManufacturerProducts(Array.isArray(products) ? products : []);
      setSelectedManufacturer(manufacturerId);
    } catch (error) {
      console.error('[Orders] Failed to fetch products:', error);
      setManufacturerProducts([]);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_def_id === product.product_def_id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_def_id === product.product_def_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_def_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.product_def_id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.base_price * item.quantity), 0).toFixed(2);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    setPlacingOrder(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const orderData = {
        manufacturerId: selectedManufacturer,
        items: cart.map(item => ({
          productId: item.product_def_id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('http://localhost:5000/api/retailer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setCart([]);
        setShowOrderForm(false);
        setSelectedManufacturer(null);
        setManufacturerProducts([]);
        // Refresh orders
        const ordersResponse = await fetch('http://localhost:5000/api/retailer/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersResponse.json();
        setOrders(Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : []);
        alert('Order placed successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to place order: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Pending Manufacturer Review': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed for Delivery': return 'bg-green-100 text-green-800';
      case 'Sent to Production': return 'bg-blue-100 text-blue-800';
      case 'In Production': return 'bg-indigo-100 text-indigo-800';
      case 'Ready for Delivery': return 'bg-purple-100 text-purple-800';
      case 'Dispatched': return 'bg-teal-100 text-teal-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout user={user}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Package className="text-emerald-500" /> Orders
          </h2>
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
          >
            <Plus size={16} /> Place Order
          </button>
        </div>

        {showOrderForm && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Place New Order</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Manufacturer</label>
                <select
                  value={selectedManufacturer || ''}
                  onChange={(e) => handleManufacturerSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose a manufacturer...</option>
                  {manufacturers.map((mfr) => (
                    <option key={mfr.manufacturer_id} value={mfr.manufacturer_id}>
                      {mfr.company_name} ({mfr.product_count} products)
                    </option>
                  ))}
                </select>
              </div>

              {selectedManufacturer && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Products</label>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-4">
                    {manufacturerProducts.length === 0 ? (
                      <p className="text-slate-500 text-sm">No products available for this manufacturer.</p>
                    ) : (
                      <div className="space-y-3">
                        {manufacturerProducts.map((product) => (
                          <div key={product.product_def_id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{product.name}</h4>
                              <p className="text-sm text-slate-500">{product.category}</p>
                              <p className="text-lg font-semibold text-emerald-600">${product.base_price}</p>
                            </div>
                            <button
                              onClick={() => addToCart(product)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 text-sm"
                            >
                              Add to Cart
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h4 className="font-semibold text-slate-900 mb-4">Order Summary</h4>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product_def_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-slate-500">${item.base_price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_def_id, item.quantity - 1)}
                          className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_def_id, item.quantity + 1)}
                          className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_def_id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-lg font-semibold">Total: ${getTotalAmount()}</div>
                  <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                  >
                    {placingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4 p-6 border-b">Order History</h3>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Package className="mx-auto mb-4 text-slate-300" size={48} />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">#{order.orderId}</td>
                    <td className="px-6 py-4 text-slate-600">{order.manufacturerName}</td>
                    <td className="px-6 py-4 font-medium">${order.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.itemCount} items</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(order.order_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;