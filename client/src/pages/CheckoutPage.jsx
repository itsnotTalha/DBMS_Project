import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, MapPin, CreditCard, Truck, ChevronLeft, 
  CheckCircle, Loader2, AlertCircle, Lock, Package,
  Pill, Smartphone, Apple, Shirt, Heart, Box, Wallet, Banknote, Building
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Category icon component using Lucide icons
const CategoryIcon = ({ category, size = 24, className = "" }) => {
  const iconProps = { size, className };
  
  switch(category) {
    case 'Pharmaceuticals':
      return <Pill {...iconProps} />;
    case 'Electronics':
      return <Smartphone {...iconProps} />;
    case 'Food & Beverage':
    case 'Food':
      return <Apple {...iconProps} />;
    case 'Apparel':
      return <Shirt {...iconProps} />;
    case 'Medical':
      return <Heart {...iconProps} />;
    default:
      return <Box {...iconProps} />;
  }
};

const getCategoryGradient = (category) => {
  const gradients = {
    'Pharmaceuticals': 'from-blue-500 to-cyan-500',
    'Electronics': 'from-purple-500 to-pink-500',
    'Food': 'from-orange-500 to-yellow-500',
    'Default': 'from-slate-500 to-slate-600'
  };
  return gradients[category] || gradients['Default'];
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    // Check auth
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Customer') {
      navigate('/');
      return;
    }
    
    setUser(parsedUser);
    
    // Load cart
    const savedCart = localStorage.getItem('shopping_cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      navigate('/');
      return;
    }
    setCart(JSON.parse(savedCart));
    setLoading(false);
  }, [navigate]);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Group cart items by outlet for separate orders
  const cartByOutlet = cart.reduce((acc, item) => {
    const outletId = item.outlet_id;
    if (!acc[outletId]) {
      acc[outletId] = {
        outlet_id: outletId,
        retailer: item.retailer,
        items: []
      };
    }
    acc[outletId].items.push(item);
    return acc;
  }, {});

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orders = [];
      
      // Create separate order for each outlet
      for (const outletGroup of Object.values(cartByOutlet)) {
        const orderData = {
          outlet_id: outletGroup.outlet_id,
          items: outletGroup.items.map(item => ({
            product_def_id: item.product_def_id,
            quantity: item.quantity,
            unit_price: item.price
          })),
          shipping_address: shippingAddress,
          payment_method: paymentMethod
        };

        const response = await axios.post(
          `${API_BASE}/customer/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        
        orders.push(response.data.order);
      }

      // Clear cart
      localStorage.removeItem('shopping_cart');
      
      // Show success
      setOrderSuccess(orders);

    } catch (error) {
      console.error('Order error:', error);
      setError(error.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Order Success View
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-slate-500 mb-6">
            {orderSuccess.length > 1 
              ? `${orderSuccess.length} orders created from different retailers`
              : 'Awaiting retailer confirmation'}
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
            {orderSuccess.map((order, idx) => (
              <div key={order.order_id} className={idx > 0 ? 'border-t pt-3' : ''}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-bold">#{order.order_id}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Status</span>
                  <span className="text-yellow-600 font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-emerald-600">${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <Link
              to="/customer/orders"
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="block w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Lock className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-emerald-600">BESS-PAS</span>
          </div>
          <h1 className="ml-auto text-lg font-bold">Checkout</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left - Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Orders by Retailer */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                Items by Retailer
              </h2>
              
              <div className="space-y-4">
                {Object.values(cartByOutlet).map((group, idx) => (
                  <div key={group.outlet_id} className={`${idx > 0 ? 'border-t pt-4' : ''}`}>
                    <p className="font-medium text-slate-900 mb-2">From: {group.retailer}</p>
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <div key={item.inventory_id} className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <CategoryIcon category={item.category} size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-slate-500 mt-4">
                Note: {Object.keys(cartByOutlet).length > 1 
                  ? 'Items from different retailers will create separate orders' 
                  : 'All items will be shipped from the same retailer'}
              </p>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-500" />
                Shipping Address
              </h2>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address..."
                rows={3}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card', label: 'Credit Card', Icon: CreditCard },
                  { id: 'cash', label: 'Cash on Delivery', Icon: Banknote },
                  { id: 'online', label: 'Online Banking', Icon: Building }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border rounded-xl text-center transition ${
                      paymentMethod === method.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <method.Icon className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
                Order Summary
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product_def_id} className="flex gap-3">
                    <div className={`w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden ${
                      !item.image_url ? 'bg-slate-100 flex items-center justify-center' : ''
                    }`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryIcon category={item.category} size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-emerald-600">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0 || !shippingAddress.trim()}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>
              
              <p className="text-xs text-slate-400 text-center mt-4">
                By placing this order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
