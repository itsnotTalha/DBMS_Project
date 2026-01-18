import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../Layout';
import axios from 'axios';
import { 
  ShoppingCart, Package, CheckCircle,
  Clock, Truck, RefreshCw, ShieldCheck, Eye,
  ChevronRight, Flag
} from 'lucide-react';
import { customerMenuItems } from './menu';
import { API_BASE } from '../../config/api';

// Stat Card Component - Compact
const StatCard = ({ icon: Icon, iconColor, label, value, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`}
  >
    <div className={`p-2 rounded-lg ${iconColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

// Order Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    'Processing': 'bg-yellow-100 text-yellow-700',
    'Out_for_Delivery': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Dispatched': 'bg-purple-100 text-purple-700',
    'In_Transit': 'bg-blue-100 text-blue-700',
    'Delivered': 'bg-green-100 text-green-700'
  };

  const displayText = status?.replace(/_/g, ' ') || 'Unknown';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {displayText}
    </span>
  );
};

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

// Skeleton Loader
const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 bg-slate-200 rounded-lg" />
    </div>
    <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
    <div className="h-4 bg-slate-200 rounded w-24" />
  </div>
);

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [verifications, setVerifications] = useState([]);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.toLowerCase() !== 'customer') {
      alert('Access Denied: This dashboard is for Customers only.');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ordersRes, verificationsRes] = await Promise.all([
        axios.get(`${API_BASE}/customer/dashboard/stats`, { headers }),
        axios.get(`${API_BASE}/customer/orders/current`, { headers }),
        axios.get(`${API_BASE}/customer/verifications`, { headers })
      ]);

      setStats(statsRes.data.stats);
      setCurrentOrders(ordersRes.data.orders || []);
      setVerifications(verificationsRes.data.verifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <Layout user={user} menuItems={customerMenuItems}>
        <div className="p-6">
          <div className="mb-6">
            <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} menuItems={customerMenuItems}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h2>
            <p className="text-slate-600">Track your orders and verify products</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Clock}
            iconColor="bg-yellow-100 text-yellow-600"
            label="Active Orders"
            value={stats?.active_orders || 0}
            onClick={() => navigate('/customer/orders')}
          />
          <StatCard
            icon={Package}
            iconColor="bg-green-100 text-green-600"
            label="Completed"
            value={stats?.completed_orders || 0}
          />
          <StatCard
            icon={ShieldCheck}
            iconColor="bg-blue-100 text-blue-600"
            label="Verified"
            value={stats?.verified_products || 0}
            onClick={() => navigate('/customer/verifications')}
          />
          <StatCard
            icon={ShoppingCart}
            iconColor="bg-purple-100 text-purple-600"
            label="Total Orders"
            value={stats?.total_orders || 0}
            onClick={() => navigate('/customer/orders')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                Current Orders
              </h3>
              <Link to="/customer/orders" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4">
              {currentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-3">No active orders</p>
                  <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Start Shopping →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentOrders.slice(0, 3).map(order => (
                    <div key={order.order_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900">#{order.order_id}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-slate-500">
                          {order.items?.map(i => i.name).join(', ').slice(0, 40)}...
                        </p>
                        {order.estimated_arrival && (
                          <p className="text-xs text-slate-400 mt-1">
                            Est. Delivery: {new Date(order.estimated_arrival).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                        {order.tracking_number && (
                          <p className="text-[10px] text-slate-400 font-mono">{order.tracking_number}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Verifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Recent Verifications
              </h3>
              <Link to="/customer/verifications" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4">
              {verifications.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-3">No verifications yet</p>
                  <Link to="/customer/verify" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Verify a Product →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {verifications.slice(0, 4).map(v => (
                    <div key={v.scan_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">{v.product_name || v.serial_code}</span>
                          <VerificationBadge result={v.scan_result} />
                        </div>
                        <p className="text-xs text-slate-500">{v.manufacturer_name || 'Unknown Manufacturer'}</p>
                        <p className="text-xs text-slate-400">{new Date(v.scan_time).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/customer/verify?code=${v.serial_code}`}
                          className="p-2 hover:bg-slate-200 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Link>
                        {v.scan_result === 'Valid' && (
                          <Link 
                            to={`/customer/report?serial=${v.serial_code}&name=${encodeURIComponent(v.product_name || '')}`}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="Report Issue"
                          >
                            <Flag className="w-4 h-4 text-red-500" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </Layout>
  );
};

export default CustomerDashboard;
