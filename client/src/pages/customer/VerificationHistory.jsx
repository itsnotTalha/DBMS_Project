import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  ShieldCheck, Eye, Flag, RefreshCw, Loader2, Search, 
  Calendar, Filter, ChevronDown
} from 'lucide-react';
import { customerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api';

// Verification Status Badge
const VerificationBadge = ({ result }) => {
  const styles = {
    'Valid': 'bg-green-100 text-green-700',
    'Fake': 'bg-red-100 text-red-700',
    'Duplicate': 'bg-orange-100 text-orange-700'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[result] || 'bg-gray-100 text-gray-700'}`}>
      {result === 'Valid' ? 'Authentic' : result}
    </span>
  );
};

const VerificationHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifications, setVerifications] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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
    fetchVerifications();
  }, [navigate]);

  const fetchVerifications = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE}/customer/verifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifications(response.data.verifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVerifications();
    setRefreshing(false);
  };

  // Filter verifications
  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = 
      (v.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       v.serial_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       v.manufacturer_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      v.scan_result === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={customerMenuItems}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Verification History</h2>
            <p className="text-slate-600">View all products you've verified</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/customer/verify"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify New
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, serial code, or manufacturer..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10 min-w-[200px]">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Status</p>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'Valid', label: 'Authentic' },
                      { value: 'Fake', label: 'Fake' },
                      { value: 'Duplicate', label: 'Duplicate' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={statusFilter === option.value}
                          onChange={() => setStatusFilter(option.value)}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing {filteredVerifications.length} of {verifications.length} verifications
          </p>
        </div>

        {/* Verification List */}
        {filteredVerifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {verifications.length === 0 ? 'No Verifications Yet' : 'No Results Found'}
            </h3>
            <p className="text-slate-500 mb-4">
              {verifications.length === 0 
                ? 'Start verifying products to see your history here'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {verifications.length === 0 && (
              <Link
                to="/customer/verify"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify a Product
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
              <div className="col-span-2">Product</div>
              <div>Serial Code</div>
              <div>Status</div>
              <div>Verified On</div>
              <div className="text-right">Actions</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              {filteredVerifications.map((verification) => (
                <div key={verification.scan_id} className="p-4 hover:bg-slate-50 transition">
                  <div className="md:grid md:grid-cols-6 md:gap-4 md:items-center">
                    {/* Product Info */}
                    <div className="col-span-2 mb-2 md:mb-0">
                      <h4 className="font-medium text-slate-900">
                        {verification.product_name || 'Unknown Product'}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {verification.manufacturer_name || 'Unknown Manufacturer'}
                      </p>
                      {verification.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                          {verification.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Serial Code */}
                    <div className="mb-2 md:mb-0">
                      <span className="text-sm font-mono text-slate-700">
                        {verification.serial_code}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="mb-2 md:mb-0">
                      <VerificationBadge result={verification.scan_result} />
                    </div>
                    
                    {/* Date */}
                    <div className="mb-2 md:mb-0 flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4 md:hidden" />
                      {new Date(verification.scan_time).toLocaleDateString()}
                      <span className="text-xs text-slate-400">
                        {new Date(verification.scan_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/customer/verify?code=${verification.serial_code}`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Link>
                      {verification.scan_result === 'Valid' && (
                        <Link
                          to={`/customer/report?serial=${verification.serial_code}&name=${encodeURIComponent(verification.product_name || '')}`}
                          className="p-2 hover:bg-red-50 rounded-lg transition"
                          title="Report Issue"
                        >
                          <Flag className="w-4 h-4 text-red-500" />
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info (Mobile) */}
                  <div className="mt-2 md:hidden flex flex-wrap gap-2 text-xs text-slate-500">
                    {verification.batch_number && (
                      <span>Batch: {verification.batch_number}</span>
                    )}
                    {verification.expiry_date && (
                      <span>Expires: {new Date(verification.expiry_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerificationHistory;
