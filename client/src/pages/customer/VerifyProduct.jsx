import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  ShieldCheck, Search, QrCode, Loader2, CheckCircle, XCircle,
  AlertTriangle, Package, Calendar, Factory, MapPin, Clock,
  ArrowRight, Flag, ChevronRight, AlertCircle
} from 'lucide-react';
import { customerMenuItems } from './menu';
import { API_BASE } from '../../config/api';

const VerifyProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verification states
  const [serialCode, setSerialCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'customer') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    setLoading(false);

    // Check for code in URL params
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setSerialCode(codeFromUrl);
      // Auto-verify if code is provided
      handleVerify(codeFromUrl);
    }
  }, [navigate, searchParams]);

  const handleVerify = async (codeOverride) => {
    const code = codeOverride || serialCode;
    if (!code.trim()) {
      setError('Please enter a serial code');
      return;
    }

    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE}/customer/verify/${encodeURIComponent(code.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify product');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (!result.verified) {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }
    
    if (result.status === 'expired') {
      return <AlertTriangle className="w-16 h-16 text-orange-500" />;
    }

    if (result.is_batch) {
      return <Package className="w-16 h-16 text-blue-500" />;
    }
    
    return <CheckCircle className="w-16 h-16 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (!result) return null;
    
    if (!result.verified) {
      return {
        title: 'Product Not Verified',
        subtitle: result.hint || 'This product could not be found in our database',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }
    
    if (result.status === 'expired') {
      return {
        title: 'Product Expired',
        subtitle: 'This product has passed its expiry date',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    }

    if (result.is_batch) {
      return {
        title: 'Batch Verified',
        subtitle: result.message || 'This batch is verified and genuine',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    }
    
    return {
      title: 'Product Authentic',
      subtitle: 'This product is verified and genuine',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <Layout user={user} menuItems={customerMenuItems}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Product</h2>
          <p className="text-slate-600">Enter a product serial code to verify its authenticity</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={serialCode}
                onChange={(e) => setSerialCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter batch or serial code (e.g., BATCH-20260112-1234 or BATCH-20260112-1234-0001)"
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={verifying}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-semibold transition"
            >
              {verifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              Verify
            </button>
            <button
              onClick={() => alert('QR Scanner coming soon!')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
            >
              <QrCode className="w-5 h-5" />
              Scan QR
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Verification Result */}
        {result && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`${statusInfo.bgColor} rounded-xl p-6 border`}>
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.title}</h3>
                  <p className="text-slate-600">{statusInfo.subtitle}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified at: {new Date(result.verified_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Batch-specific info */}
              {result.is_batch && result.product && (
                <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Total Items in Batch</p>
                    <p className="font-bold text-lg text-blue-700">{result.product.total_items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Batch Status</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${result.product.batch_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {result.product.batch_status}
                    </span>
                  </div>
                  {result.product.sample_serial && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs text-slate-500">Sample Serial Code</p>
                      <p className="font-mono text-sm text-slate-700">{result.product.sample_serial}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Details */}
            {result.verified && result.product && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                  <h3 className="font-bold text-slate-900">Product Details</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {result.product.image_url ? (
                            <img 
                              src={result.product.image_url} 
                              alt={result.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{result.product.name}</h4>
                          <p className="text-sm text-slate-500">{result.product.category}</p>
                          <p className="text-emerald-600 font-semibold mt-1">
                            ${parseFloat(result.product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-4">{result.product.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Factory className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Manufacturer:</span>
                        <span className="font-medium text-slate-900">{result.product.manufacturer}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Batch:</span>
                        <span className="font-mono text-slate-900">{result.product.batch_number}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Manufactured:</span>
                        <span className="text-slate-900">
                          {new Date(result.product.manufacturing_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Expires:</span>
                        <span className={`font-medium ${result.product.is_expired ? 'text-red-600' : 'text-slate-900'}`}>
                          {new Date(result.product.expiry_date).toLocaleDateString()}
                          {result.product.is_expired && ' (Expired)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">License:</span>
                        <span className="font-mono text-slate-900">{result.product.license_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Supply Chain Timeline */}
            {result.verified && result.timeline && result.timeline.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                  <h3 className="font-bold text-slate-900">Supply Chain Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    {result.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === result.timeline.length - 1 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {event.action === 'Manufactured' && <Factory className="w-5 h-5" />}
                            {event.action === 'Shipped' && <ArrowRight className="w-5 h-5" />}
                            {event.action === 'Received' && <Package className="w-5 h-5" />}
                            {event.action === 'Stored' && <MapPin className="w-5 h-5" />}
                            {event.action === 'Sold' && <CheckCircle className="w-5 h-5" />}
                            {!['Manufactured', 'Shipped', 'Received', 'Stored', 'Sold'].includes(event.action) && (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          {index < result.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-semibold text-slate-900">{event.action}</h4>
                          <p className="text-sm text-slate-500">{event.actor_name || 'System'}</p>
                          {event.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {event.location}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {result.verified && (
                <Link
                  to={`/customer/report?serial=${result.product?.serial_code}&name=${encodeURIComponent(result.product?.name || '')}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition"
                >
                  <Flag className="w-5 h-5" />
                  Report an Issue
                </Link>
              )}
              <button
                onClick={() => {
                  setResult(null);
                  setSerialCode('');
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Verify Another Product
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !verifying && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Ready to Verify</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Enter a product serial code above to verify its authenticity. You can find the serial code on the product packaging or scan the QR code.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyProduct;
