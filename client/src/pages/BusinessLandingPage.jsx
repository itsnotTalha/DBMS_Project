import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

const BusinessLandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
               <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                BESS-PAS <span className="text-slate-600 font-normal text-sm">for Business</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-16 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            Secure Your Supply Chain with <span className="text-blue-600">Blockchain & IoT</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Join the network of trusted manufacturers and retailers. Ensure authenticity, track shipments in real-time, and build consumer trust.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Perks Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Manufacturer Perks */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Factory className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">For Manufacturers</h2>
            <ul className="space-y-4">
              {[
                'Immutable production logs via Blockchain',
                'Real-time IoT monitoring for cold chain',
                'Direct B2B ordering channel',
                'Anti-counterfeit verification'
              ].map((perk, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Retailer Perks */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">For Retailers</h2>
            <ul className="space-y-4">
              {[
                'Verify incoming stock authenticity instantly',
                'Automated inventory tracking',
                'Seamless re-ordering from manufacturers',
                'Consumer trust badges'
              ].map((perk, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLandingPage;