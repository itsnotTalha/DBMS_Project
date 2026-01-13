import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, ShieldX, Package, Factory, Store, Clock, Hash, 
  AlertTriangle, MapPin, ArrowLeft, CheckCircle, Calendar,
  Loader2, QrCode, Search
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const PublicVerify = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [serialCode, setSerialCode] = useState(code || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [autoVerified, setAutoVerified] = useState(false);

  useEffect(() => {
    // Auto-verify if code is in URL
    if (code && !autoVerified) {
      setSerialCode(code);
      handleVerify(code);
      setAutoVerified(true);
    }
  }, [code, autoVerified]);

  const handleVerify = async (codeOverride) => {
    const codeToVerify = codeOverride || serialCode;
    if (!codeToVerify.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.get(`${API_BASE}/verify/${encodeURIComponent(codeToVerify.trim())}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Manufacturing': return 'bg-blue-100 text-blue-600';
      case 'In_Transit': return 'bg-yellow-100 text-yellow-600';
      case 'In_Inventory': return 'bg-green-100 text-green-600';
      case 'Sold': return 'bg-purple-100 text-purple-600';
      case 'Recalled': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Package className="w-8 h-8 text-emerald-500" />
              <span className="text-slate-900">SupplyChain</span>
            </Link>
            <Link 
              to="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Verify Product Authenticity</h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Enter a batch number or serial code to verify product authenticity and view supply chain history
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={serialCode}
                onChange={(e) => setSerialCode(e.target.value)}
                placeholder="Enter batch or serial code (e.g., BATCH-20260112-1234 or BATCH-20260112-1234-0001)"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-xl text-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <ShieldX size={32} className="text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800">Verification Failed</h3>
              <p className="text-red-600 mt-1">{error}</p>
              {result?.hint && (
                <p className="text-sm text-slate-500 mt-2">Hint: {result.hint}</p>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Verification Status */}
            <div className={`rounded-2xl p-6 flex items-center gap-4 ${
              result.verified 
                ? result.is_batch
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
            }`}>
              {result.verified ? (
                result.is_batch ? (
                  <Package size={48} className="text-blue-500" />
                ) : (
                  <ShieldCheck size={48} className="text-green-500" />
                )
              ) : (
                <ShieldX size={48} className="text-red-500" />
              )}
              <div className="flex-1">
                <h3 className={`text-2xl font-black ${
                  result.verified 
                    ? result.is_batch ? 'text-blue-700' : 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {result.verified 
                    ? result.is_batch ? 'Batch Verified' : 'Authentic Product' 
                    : 'Verification Failed'}
                </h3>
                <p className={result.verified ? (result.is_batch ? 'text-blue-600' : 'text-green-600') : 'text-red-600'}>
                  {result.verified 
                    ? result.message || 'This product is verified as genuine' 
                    : result.warning || 'This product could not be verified'}
                </p>
              </div>
            </div>

            {/* Batch Info Summary */}
            {result.is_batch && result.product && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-black text-blue-700">{result.product.total_items}</p>
                    <p className="text-xs text-blue-600">Total Items</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-2xl font-black text-green-700">{result.product.in_inventory_count || 0}</p>
                    <p className="text-xs text-green-600">In Inventory</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className={`text-sm font-black ${result.product.batch_status === 'Active' ? 'text-green-600' : 'text-slate-600'}`}>
                      {result.product.batch_status}
                    </p>
                    <p className="text-xs text-slate-500">Batch Status</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-mono font-bold text-slate-700 truncate">{result.product.sample_serial || 'N/A'}</p>
                    <p className="text-xs text-slate-500">Sample Serial</p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            {result.warning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800">{result.warning}</p>
              </div>
            )}

            {/* Recall Alert */}
            {result.recall && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">⚠️ PRODUCT RECALL ACTIVE</p>
                  <p className="text-red-600">{result.recall.reason}</p>
                </div>
              </div>
            )}

            {/* Product Details */}
            {result.product && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {result.product.image_url ? (
                        <img src={result.product.image_url} alt={result.product.product_name || result.product.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Package size={48} className="text-emerald-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black">{result.product.product_name || result.product.name}</h3>
                      <p className="text-slate-500 mt-1">{result.product.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                          {result.product.category}
                        </span>
                        {result.product.status && (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(result.product.status)}`}>
                            {result.product.status?.replace('_', ' ')}
                          </span>
                        )}
                        {result.product.is_expired && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {result.product.serial_code && (
                          <div>
                            <p className="text-xs text-slate-400">Serial Code</p>
                            <p className="font-mono font-bold">{result.product.serial_code}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-slate-400">Batch Number</p>
                          <p className="font-mono font-bold">{result.product.batch_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Manufacturing Date</p>
                          <p className="font-semibold">{new Date(result.product.manufacturing_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Expiry Date</p>
                          <p className={`font-semibold ${result.product.is_expired ? 'text-red-600' : ''}`}>
                            {new Date(result.product.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manufacturer & Retailer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.manufacturer && (
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Factory size={20} className="text-emerald-600" />
                    </div>
                    <h4 className="font-bold">Manufacturer</h4>
                  </div>
                  <p className="text-lg font-bold">{result.manufacturer.name}</p>
                  <p className="text-sm text-slate-500">License: {result.manufacturer.license_number}</p>
                </div>
              )}

              {result.current_retailer && (
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Store size={20} className="text-purple-600" />
                    </div>
                    <h4 className="font-bold">Current Retailer</h4>
                  </div>
                  <p className="text-lg font-bold">{result.current_retailer.name}</p>
                  <p className="text-sm text-slate-500">{result.current_retailer.location}</p>
                  {result.current_retailer.quantity && (
                    <p className="text-sm text-emerald-600 mt-1">{result.current_retailer.quantity} units in stock</p>
                  )}
                </div>
              )}
            </div>

            {/* Supply Chain Timeline */}
            {result.blockchain_history && result.blockchain_history.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                  <h4 className="font-bold flex items-center gap-2">
                    <Clock size={18} className="text-slate-500" />
                    Supply Chain Timeline
                  </h4>
                </div>
                <div className="p-6">
                  <div className="relative">
                    {result.blockchain_history.map((event, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle size={18} className="text-emerald-600" />
                          </div>
                          {index < result.blockchain_history.length - 1 && (
                            <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-bold text-slate-900">{event.action}</p>
                          <p className="text-sm text-slate-500">{event.actor_name}</p>
                          {event.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={12} />
                              {event.location}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Timestamp */}
            <div className="text-center text-sm text-slate-400">
              Verified at: {new Date(result.verification_timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Help Text */}
        {!result && !loading && (
          <div className="text-center text-slate-500 mt-8">
            <p className="mb-4">Need help?</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                <Hash className="w-4 h-4 text-emerald-500" />
                <span>Batch: BATCH-YYYYMMDD-XXXX</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                <QrCode className="w-4 h-4 text-emerald-500" />
                <span>Serial: BATCH-YYYYMMDD-XXXX-0001</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 SupplyChain. All products are blockchain-verified for authenticity.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicVerify;
