import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Trash2, 
  Save, 
  AlertTriangle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/settings';

const Settings = ({ menuItems, roleCheck }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({});
  const [nameField, setNameField] = useState('');
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [notification, setNotification] = useState(null);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
  const authConfig = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profile`, authConfig());
      setProfileData(response.data);
      
      // Set the name field based on role
      if (response.data.first_name) {
        setNameField(`${response.data.first_name} ${response.data.last_name || ''}`.trim());
      } else if (response.data.company_name) {
        setNameField(response.data.company_name);
      } else if (response.data.business_name) {
        setNameField(response.data.business_name);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (roleCheck && !roleCheck(parsedUser.role)) {
      alert('Access Denied');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, roleCheck]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveName = async () => {
    if (!nameField.trim()) {
      showNotification('error', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE}/name`, { name: nameField }, authConfig());
      
      // Update local storage with new name
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      storedUser.name = response.data.name;
      
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(storedUser));
      } else {
        sessionStorage.setItem('user', JSON.stringify(storedUser));
      }
      
      setUser(storedUser);
      showNotification('success', 'Name updated successfully');
    } catch (error) {
      showNotification('error', error.response?.data?.error || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showNotification('error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }

    // if (passwordData.newPassword.length < 6) {
    //   showNotification('error', 'Password must be at least 6 characters');
    //   return;
    // }

    setSaving(true);
    try {
      await axios.put(`${API_BASE}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, authConfig());
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('success', 'Password changed successfully');
    } catch (error) {
      showNotification('error', error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (confirmText !== 'RESET') {
      showNotification('error', 'Please type RESET to confirm');
      return;
    }

    setResetting(true);
    try {
      await axios.delete(`${API_BASE}/reset`, authConfig());
      setShowResetModal(false);
      setConfirmText('');
      showNotification('success', 'All data has been reset successfully');
    } catch (error) {
      showNotification('error', error.response?.data?.error || 'Failed to reset data');
    } finally {
      setResetting(false);
    }
  };

  const getNameLabel = () => {
    if (user?.role === 'Customer') return 'Full Name';
    if (user?.role === 'Manufacturer') return 'Company Name';
    if (user?.role === 'Retailer') return 'Business Name';
    return 'Display Name';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={menuItems}>
      <div className="p-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <SettingsIcon className="text-blue-500" /> Settings
          </h2>
          <p className="text-sm text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <User size={18} className="text-blue-500" /> Profile Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{getNameLabel()}</label>
                <input
                  type="text"
                  value={nameField}
                  onChange={(e) => setNameField(e.target.value)}
                  placeholder={`Enter your ${getNameLabel().toLowerCase()}`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email || ''}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Name
              </button>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Lock size={18} className="text-purple-500" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Change Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 lg:col-span-2">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} /> Danger Zone
            </h3>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Reset Dashboard Data</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    This will permanently delete all your data including orders, products, and transactions. 
                    Your account will remain active but the dashboard will be reset to its initial state.
                  </p>
                </div>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ml-4"
                >
                  <Trash2 size={16} />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Confirm Data Reset</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-slate-600 mb-4">
                You are about to permanently delete all your data. This includes:
              </p>
              
              <ul className="text-sm text-slate-600 mb-4 space-y-1">
                {user?.role === 'Manufacturer' && (
                  <>
                    <li>• All products and production batches</li>
                    <li>• All orders and shipments</li>
                    <li>• All IoT sensor data</li>
                    <li>• All ledger entries</li>
                  </>
                )}
                {user?.role === 'Retailer' && (
                  <>
                    <li>• All orders and order items</li>
                    <li>• All shipments</li>
                    <li>• All outlet information</li>
                  </>
                )}
                {user?.role === 'Customer' && (
                  <>
                    <li>• All product verifications</li>
                    <li>• All saved addresses</li>
                  </>
                )}
              </ul>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type <span className="font-bold text-red-500">RESET</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type RESET"
                  className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setConfirmText('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetData}
                  disabled={confirmText !== 'RESET' || resetting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {resetting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
