import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { QrCode, Search, ShieldCheck, ShieldX, Package, Factory, Store, Clock, Hash, AlertTriangle, MapPin } from 'lucide-react';
import { retailerMenuItems } from './menu';
import { API_BASE } from '../../config/api';

const VerifyProduct = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [serialCode, setSerialCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Retailer') {
      alert('Access Denied');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!serialCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.get(`${API_BASE}/verify/${serialCode.trim()}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify product');
    } finally {
      setLoading(false);
    }
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
    <Layout user={user} menuItems={retailerMenuItems}>
      <div className="p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-black">Verify Product Authenticity</h2>
            <p className="text-slate-400 mt-2">Enter a product serial code to verify its authenticity and view complete history</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleVerify} className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={serialCode}
                  onChange={(e) => setSerialCode(e.target.value)}
                  placeholder="Enter batch or serial code (e.g., BATCH-20260112-1234 or BATCH-20260112-1234-0001)"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-xl text-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg transition-colors"
              >
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
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {result.product.image_url ? (
                          <img src={result.product.image_url} alt={result.product.product_name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Package size={48} className="text-blue-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black">{result.product.product_name}</h3>
                        <p className="text-slate-500 mt-1">{result.product.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                            {result.product.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(result.product.status)}`}>
                            {result.product.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-slate-400">Serial Code</p>
                            <p className="font-mono font-bold">{result.product.serial_code}</p>
                          </div>
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
                            <p className="font-semibold">{new Date(result.product.expiry_date).toLocaleDateString()}</p>
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
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Factory size={20} className="text-blue-600" />
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
                    {result.current_retailer.address && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {result.current_retailer.address}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Blockchain History */}
              {result.blockchain_history && result.blockchain_history.length > 0 && (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b flex items-center gap-2">
                    <Hash size={18} className="text-emerald-500" />
                    <h4 className="font-bold">Blockchain Transaction History</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    {result.blockchain_history.map((tx, i) => (
                      <div key={i} className="border-l-4 border-emerald-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded">
                              {tx.action}
                            </span>
                            <p className="text-sm text-slate-600 mt-1">{tx.actor_name || 'System'}</p>
                            {tx.location && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin size={10} /> {tx.location}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 bg-slate-50 rounded p-2">
                          <p className="text-[10px] text-slate-400">Hash</p>
                          <p className="font-mono text-[10px] text-slate-600 break-all">{tx.current_hash}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scan History */}
              {result.scan_history && result.scan_history.length > 0 && (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b flex items-center gap-2">
                    <QrCode size={18} className="text-blue-500" />
                    <h4 className="font-bold">Recent Scan History</h4>
                  </div>
                  <div className="divide-y">
                    {result.scan_history.slice(0, 10).map((scan, i) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            scan.scan_result === 'Valid' ? 'bg-green-500' :
                            scan.scan_result === 'Duplicate' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <span className={`text-sm font-semibold ${
                            scan.scan_result === 'Valid' ? 'text-green-600' :
                            scan.scan_result === 'Duplicate' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {scan.scan_result}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(scan.scan_time).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Timestamp */}
              <div className="text-center text-xs text-slate-400">
                Verified at: {result.verification_timestamp}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerifyProduct;
