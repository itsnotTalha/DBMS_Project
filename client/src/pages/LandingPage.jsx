import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, Package, Star, Lock } from 'lucide-react';

const LandingPage = () => {
  // Dummy data for display to attract customers
  const featuredProducts = [
    { id: 1, name: 'Premium Coffee Beans', brand: 'BeanCo', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300&h=300' },
    { id: 2, name: 'Organic Honey', brand: 'NatureSweet', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300&h=300' },
    { id: 3, name: 'Smart Watch Series 5', brand: 'TechLife', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300&h=300' },
    { id: 4, name: 'Leather Wallet', brand: 'Craftsman', image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?auto=format&fit=crop&q=80&w=300&h=300' },
  ];

  const partners = [
    { name: 'Global Logistics', type: 'Manufacturer' },
    { name: 'Fresh Foods Inc.', type: 'Retailer' },
    { name: 'Tech Solutions', type: 'Manufacturer' },
    { name: 'City Market', type: 'Retailer' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Lock className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 text-[#059669]">
                BESS-PAS
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/business" className="text-sm font-semibold text-slate-500 hover:text-slate-900 hidden md:block">
                For Business
              </Link>
              <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Verify Authenticity. <br className="hidden sm:block" />
            <span className="text-emerald-600">Shop with Confidence.</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            The world's most trusted platform for verifying product history. Scan, track, and ensure you get exactly what you paid for.
          </p>
          
          {/* Search Bar Simulation */}
          <div className="max-w-xl mx-auto relative mb-12">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
              placeholder="Enter product ID or scan QR code..."
            />
            <button className="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Verify
            </button>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-slate-500 mt-1">Verified authentic items from our partners</p>
            </div>
            <Link to="/register" className="text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                <div className="aspect-square rounded-lg bg-slate-100 mb-3 overflow-hidden relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{product.name}</h3>
                <p className="text-xs text-slate-500">{product.brand}</p>
                <div className="mt-3 flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3 h-3 fill-current" /> 4.9
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Trusted by Industry Leaders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
            {partners.map((partner, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <span className="font-bold text-slate-900">{partner.name}</span>
                <span className="text-xs uppercase tracking-wider text-slate-400">{partner.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business CTA */}
      <div className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Are you a Manufacturer or Retailer?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Join our secure supply chain network to track products, prevent counterfeiting, and build customer trust.
          </p>
          <Link
            to="/business"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-xl text-lg font-bold hover:bg-slate-100 transition-all"
          >
            Join as Partner <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;