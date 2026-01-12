import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, ShieldCheck, Lock, ShoppingCart, X, Plus, Minus, 
  Trash2, ChevronRight, Package, Truck, CheckCircle,
  Filter, Loader2, Pill, Smartphone, Apple, Shirt, Heart,
  Sparkles, Car, Home, Dumbbell, BookOpen, Gift, Box
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Category icons mapping - using Lucide React icons
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
    case 'Beverage':
      return <Package {...iconProps} />;
    case 'Apparel':
      return <Shirt {...iconProps} />;
    case 'Medical':
      return <Heart {...iconProps} />;
    case 'Cosmetics':
      return <Sparkles {...iconProps} />;
    case 'Automotive':
      return <Car {...iconProps} />;
    case 'Home & Garden':
      return <Home {...iconProps} />;
    case 'Sports':
      return <Dumbbell {...iconProps} />;
    case 'Books':
      return <BookOpen {...iconProps} />;
    case 'Toys':
      return <Gift {...iconProps} />;
    default:
      return <Box {...iconProps} />;
  }
};

const getCategoryGradient = (category) => {
  const gradients = {
    'Pharmaceuticals': 'from-blue-500 to-cyan-500',
    'Electronics': 'from-purple-500 to-pink-500',
    'Food & Beverage': 'from-green-500 to-emerald-500',
    'Food': 'from-orange-500 to-yellow-500',
    'Apparel': 'from-rose-500 to-pink-500',
    'Medical': 'from-red-500 to-rose-500',
    'Cosmetics': 'from-fuchsia-500 to-purple-500',
    'Default': 'from-slate-500 to-slate-600'
  };
  return gradients[category] || gradients['Default'];
};

const LandingPage = () => {
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  
  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shopping_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchManufacturers();
  }, [selectedCategory, searchQuery]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(`${API_BASE}/public/products?${params}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/public/categories`);
      setCategories(['All', ...(response.data.categories || [])]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/public/manufacturers`);
      setManufacturers(response.data.manufacturers || []);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    }
  };

  // Cart functions
  const addToCart = (product) => {
    setCart(prev => {
      // Use inventory_id as unique identifier (same product from different retailers)
      const existing = prev.find(item => item.inventory_id === product.inventory_id);
      if (existing) {
        return prev.map(item =>
          item.inventory_id === product.inventory_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        inventory_id: product.inventory_id,
        product_def_id: product.product_def_id,
        outlet_id: product.outlet_id,
        name: product.name,
        price: product.base_price,
        quantity: 1,
        image_url: product.image_url,
        category: product.category,
        manufacturer: product.manufacturer_name,
        retailer: product.retailer_name,
        stock: product.stock
      }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (inventoryId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.inventory_id === inventoryId) {
        const newQty = item.quantity + delta;
        // Don't exceed available stock
        if (newQty > item.stock) return item;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (inventoryId) => {
    setCart(prev => prev.filter(item => item.inventory_id !== inventoryId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== 'Customer') {
        setShowLoginPrompt(true);
      } else {
        navigate('/checkout');
      }
    }
  };

  const handleVerify = () => {
    if (verifyCode.trim()) {
      navigate(`/verify/${verifyCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Lock className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-emerald-600">BESS-PAS</span>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/business" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden md:block">
                For Business
              </Link>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
                Log in
              </Link>
              <Link to="/register" className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition hidden sm:block">
                Sign Up
              </Link>
              
              {/* Cart Button */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-slate-100 rounded-full transition"
              >
                <ShoppingCart className="w-6 h-6 text-slate-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-12 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Supply Chain Verified Products
          </h1>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Shop with confidence. Every product is tracked and verified through our blockchain-powered supply chain.
          </p>
          
          {/* Verification Search */}
          <div className="max-w-xl mx-auto relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="Enter batch or serial code (e.g., BATCH-20260112-1234)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <button 
                onClick={handleVerify}
                className="bg-slate-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Verify
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center gap-8 mt-8 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Blockchain Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category !== 'All' && <span className="mr-1 inline-flex"><CategoryIcon category={category} size={14} /></span>}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          <span className="text-slate-500 text-sm">{products.length} products</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center h-[50vh] flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">No products found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {products.map(product => (
              <ProductCard 
                key={product.product_def_id} 
                product={product} 
                onAddToCart={addToCart}
                onViewDetails={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Featured Manufacturers */}
      {manufacturers.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Trusted Manufacturers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {manufacturers.map(mfg => (
                <div key={mfg.manufacturer_id} className="bg-slate-50 rounded-xl p-4 text-center hover:shadow-md transition">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{mfg.company_name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{mfg.product_count} products</p>
                  <p className="text-xs text-emerald-600 mt-1">✓ Verified</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500 p-1.5 rounded-lg">
                  <Lock className="text-white w-4 h-4" />
                </div>
                <span className="font-bold">BESS-PAS</span>
              </div>
              <p className="text-slate-400 text-sm">
                Blockchain-Enhanced Supply Security - Product Authentication System
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><a href="#" className="hover:text-white">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/business" className="hover:text-white">Partner with Us</Link></li>
                <li><Link to="/register" className="hover:text-white">Become a Retailer</Link></li>
                <li><Link to="/register" className="hover:text-white">Manufacturer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Verify Products</h4>
              <p className="text-slate-400 text-sm mb-4">
                Scan QR codes or enter serial numbers to verify product authenticity.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2026 BESS-PAS. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={cartTotal}
        onCheckout={handleCheckout}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal 
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => {
            setShowLoginPrompt(false);
            navigate('/login', { state: { returnTo: '/checkout' } });
          }}
          onRegister={() => {
            setShowLoginPrompt(false);
            navigate('/register', { state: { returnTo: '/checkout', defaultRole: 'Customer' } });
          }}
        />
      )}
    </div>
  );
};

// Product Card Component - Shows product with retailer info
const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const hasImage = product.image_url && product.image_url.trim() !== '';
  const isOutOfStock = !product.in_stock || product.stock <= 0;
  
  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden hover:shadow-md transition group">
      {/* Image or Icon - compact height */}
      <div 
        className="aspect-[5/3] relative cursor-pointer"
        onClick={onViewDetails}
      >
        {hasImage ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-slate-100 flex items-center justify-center ${hasImage ? 'hidden' : 'flex'}`}
        >
          <CategoryIcon category={product.category} size={28} className="text-slate-400" />
        </div>
        
        {/* Verified Badge */}
        <div className="absolute top-1 right-1 bg-white/90 backdrop-blur rounded-full p-0.5 shadow-sm">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
        </div>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      {/* Info - shows product name + retailer */}
      <div className="p-2">
        <h3 className="font-medium text-slate-900 text-[11px] leading-tight line-clamp-1">{product.name}</h3>
        <p className="text-[9px] text-slate-500 truncate">by {product.retailer_name}</p>
        <p className="text-[9px] text-emerald-600 font-medium truncate">{product.manufacturer_name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs font-bold text-slate-900">${parseFloat(product.base_price).toFixed(2)}</p>
          {!isOutOfStock && (
            <p className="text-[9px] text-slate-400">{product.stock} left</p>
          )}
        </div>
        
        <button
          onClick={() => !isOutOfStock && onAddToCart(product)}
          disabled={isOutOfStock}
          className={`w-full mt-1.5 py-1 rounded text-[10px] font-medium transition flex items-center justify-center gap-1
            ${isOutOfStock 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
        >
          <ShoppingCart className="w-2.5 h-2.5" />
          {isOutOfStock ? 'Unavailable' : 'Add'}
        </button>
      </div>
    </div>
  );
};

// Cart Sidebar Component
const CartSidebar = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, total, onCheckout }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Shopping Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.inventory_id} className="flex gap-4 bg-slate-50 rounded-xl p-3">
                  {/* Image */}
                  <div className={`w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden ${!item.image_url ? 'bg-slate-100 flex items-center justify-center' : ''}`}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryIcon category={item.category} size={24} className="text-slate-400" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-slate-500">from {item.retailer}</p>
                    <p className="text-xs text-emerald-600">{item.manufacturer}</p>
                    <p className="font-bold text-slate-900 mt-1">${parseFloat(item.price).toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.inventory_id, -1)}
                        className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.inventory_id, 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-slate-100 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => onRemove(item.inventory_id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Product Modal Component
const ProductModal = ({ product, onClose, onAddToCart }) => {
  const hasImage = product.image_url && product.image_url.trim() !== '';
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-white rounded-2xl z-50 overflow-hidden shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2">
            {hasImage ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-64 md:h-full object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-slate-100 flex items-center justify-center">
                <CategoryIcon category={product.category} size={80} className="text-slate-400" />
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-600 font-medium text-sm">Verified Product</span>
            </div>
            
            <p className="text-sm text-slate-500 mb-1">{product.manufacturer_name}</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{product.name}</h2>
            <p className="text-slate-600 text-sm mb-4">{product.description || 'No description available'}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-sm flex items-center gap-1">
                <CategoryIcon category={product.category} size={14} /> {product.category}
              </span>
              {product.in_stock ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">In Stock</span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Out of Stock</span>
              )}
            </div>
            
            <p className="text-3xl font-bold text-slate-900 mb-6">${parseFloat(product.base_price).toFixed(2)}</p>
            
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={!product.in_stock}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            
            <p className="text-xs text-slate-400 mt-4 text-center">
              License: {product.license_number}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// Login Prompt Modal
const LoginPromptModal = ({ onClose, onLogin, onRegister }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 p-6 max-w-md w-full mx-4 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Complete Your Purchase</h3>
          <p className="text-slate-500 mt-2">Sign in or create an account to checkout</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl font-semibold"
          >
            Create Account
          </button>
        </div>
        
        <p className="text-xs text-slate-400 text-center mt-4">
          Your cart will be saved after you sign in
        </p>
      </div>
    </>
  );
};

export default LandingPage;