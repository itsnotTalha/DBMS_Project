import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, ShieldCheck, Lock, ShoppingCart, X, Plus, Minus, 
  Trash2, ChevronRight, ChevronLeft, Package, Truck, CheckCircle,
  Filter, Loader2, Pill, Smartphone, Apple, Shirt, Heart,
  Sparkles, Car, Home, Dumbbell, BookOpen, Gift, Box, Store
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Custom CSS to hide scrollbar but allow scrolling
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
`;

// Category icons mapping
const CategoryIcon = ({ category, size = 24, className = "" }) => {
  const iconProps = { size, className };
  switch(category) {
    case 'Pharmaceuticals': return <Pill {...iconProps} />;
    case 'Electronics': return <Smartphone {...iconProps} />;
    case 'Food & Beverage':
    case 'Food': return <Apple {...iconProps} />;
    case 'Beverage': return <Package {...iconProps} />;
    case 'Apparel': return <Shirt {...iconProps} />;
    case 'Medical': return <Heart {...iconProps} />;
    case 'Cosmetics': return <Sparkles {...iconProps} />;
    case 'Automotive': return <Car {...iconProps} />;
    case 'Home & Garden': return <Home {...iconProps} />;
    case 'Sports': return <Dumbbell {...iconProps} />;
    case 'Books': return <BookOpen {...iconProps} />;
    case 'Toys': return <Gift {...iconProps} />;
    default: return <Box {...iconProps} />;
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Refs for scrolling
  const productScrollRef = useRef(null);
  const manufacturerScrollRef = useRef(null);

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
    try {
      const saved = localStorage.getItem('shopping_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
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
      setProducts([]); 
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

  // Generic Scroll Function
  const scroll = (ref, direction) => {
    if (ref.current) {
      const { current } = ref;
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Cart functions
  const addToCart = (product) => {
    setCart(prev => {
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
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) {
      setShowLoginPrompt(true);
    } else {
      try {
        const parsedUser = JSON.parse(userStr);
        if (parsedUser.role !== 'Customer') {
          setShowLoginPrompt(true);
        } else {
          navigate('/checkout');
        }
      } catch (e) {
        setShowLoginPrompt(true);
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
      <style>{scrollbarHideStyle}</style>
      
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

      {/* Products Horizontal Scroll Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {selectedCategory === 'All' ? 'Available Products' : selectedCategory}
          </h2>
          <span className="text-slate-500 text-sm">{products.length} products</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center h-48 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">No products found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="relative group">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll(productScrollRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Horizontal Scroll Container */}
            <div 
              ref={productScrollRef}
              className="flex overflow-x-auto gap-5 pb-8 px-1 scrollbar-hide snap-x snap-mandatory"
            >
              {products.map(product => (
                <div 
                  key={product.inventory_id || product.product_def_id}
                  className="min-w-[300px] w-[300px] flex-shrink-0 snap-center"
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={addToCart}
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                </div>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll(productScrollRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Featured Manufacturers - Scrollable */}
      {manufacturers.length > 0 && (
        <div className="bg-white py-12 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Trusted Manufacturers</h2>
              <Link to="/business" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative group">
              {/* Left Scroll Button */}
              <button
                onClick={() => scroll(manufacturerScrollRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Manufacturers Scroll Container */}
              <div 
                ref={manufacturerScrollRef}
                className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
              >
                {manufacturers.map(mfg => (
                  <div 
                    key={mfg.manufacturer_id} 
                    className="min-w-[180px] sm:min-w-[220px] flex-shrink-0 snap-center bg-slate-50 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{mfg.company_name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{mfg.product_count} products</p>
                    <div className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-200">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <p className="text-[10px] text-slate-600 font-medium">Verified</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={() => scroll(manufacturerScrollRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
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
                Blockchain-Enhanced Supply Security
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/business" className="hover:text-white">Partner with Us</Link></li>
                <li><Link to="/register" className="hover:text-white">Become a Retailer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Verify Products</h4>
              <p className="text-slate-400 text-sm mb-4">
                Scan QR codes to verify authenticity.
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

// Product Card Component - Horizontal Layout Optimized
const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const hasImage = product.image_url && product.image_url.trim() !== '';
  const isOutOfStock = !product.in_stock || product.stock <= 0;
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      {/* Image */}
      <div 
        className="aspect-[4/3] relative cursor-pointer overflow-hidden bg-slate-50"
        onClick={onViewDetails}
      >
        {hasImage ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${hasImage ? 'hidden' : 'flex'}`}
        >
          <CategoryIcon category={product.category} size={48} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
        </div>
        
        {/* Verified Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-sm" title="Verified Authentic">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-500 shadow-lg text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover Action Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <button 
                onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-emerald-50"
             >
               Quick View
             </button>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mb-2">
            {product.category}
          </span>
          <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Store className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">{product.retailer_name}</span>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Price</p>
            <p className="text-xl font-extrabold text-slate-900">${parseFloat(product.base_price || 0).toFixed(2)}</p>
          </div>
          
          <button
            onClick={() => !isOutOfStock && onAddToCart(product)}
            disabled={isOutOfStock}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
              ${isOutOfStock 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-110 hover:shadow-emerald-200'
              }`}
            title="Add to Cart"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Sidebar Component
const CartSidebar = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, total, onCheckout }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Your cart is empty</h3>
              <p className="text-slate-500 mt-1 max-w-[200px]">Looks like you haven't added any items yet.</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium hover:bg-slate-50 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.inventory_id} className="flex gap-4">
                  <div className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 ${!item.image_url ? 'bg-slate-50 flex items-center justify-center' : ''}`}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <CategoryIcon category={item.category} size={24} className="text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-slate-900 line-clamp-1 pr-4">{item.name}</h4>
                      <button 
                        onClick={() => onRemove(item.inventory_id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-2 truncate">From {item.retailer}</p>
                    
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">${parseFloat(item.price).toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.inventory_id, -1)}
                          className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.inventory_id, 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-slate-100 text-slate-600 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-5 bg-slate-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              Checkout
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-4xl md:w-full bg-white md:rounded-3xl rounded-xl z-50 overflow-hidden shadow-2xl flex flex-col md:flex-row md:h-[600px] animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-slate-100 z-10 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="md:w-1/2 relative bg-slate-50">
          {hasImage ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-64 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-full flex items-center justify-center">
              <CategoryIcon category={product.category} size={100} className="text-slate-300" />
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 flex gap-2">
             <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
               Verified Authentic
             </span>
          </div>
        </div>
        
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold uppercase tracking-wide">
                {product.category}
              </span>
              {product.in_stock ? (
                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 text-xs font-medium">Out of Stock</span>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{product.name}</h2>
            <p className="text-lg text-slate-500 font-medium">{product.manufacturer_name}</p>
          </div>
          
          <div className="prose prose-sm text-slate-600 mb-8">
            <p>{product.description || 'No description available for this product.'}</p>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Sold By</p>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">{product.retailer_name}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">${parseFloat(product.base_price).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <div className="col-span-2">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    disabled={!product.in_stock}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 disabled:shadow-none"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
               </div>
            </div>
            
            {product.license_number && (
              <p className="text-[10px] text-slate-400 mt-4 text-center font-mono">
                License ID: {product.license_number}
              </p>
            )}
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 p-8 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Account Required</h3>
          <p className="text-slate-500 leading-relaxed">Please sign in or create an account to proceed with your purchase.</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-slate-200"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 py-3.5 rounded-xl font-semibold transition-all hover:bg-emerald-50"
          >
            Create Account
          </button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;