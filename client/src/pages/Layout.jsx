import React, { useState, useEffect } from 'react';
// CHANGED: Added Link to react-router-dom imports
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
// CHANGED: Removed Link from lucide-react imports to avoid conflict
import { 
  LogOut, Menu, X, ChevronDown, LayoutDashboard, Package, Truck, 
  BarChart, FileText, Users, ShoppingBag, Factory, ClipboardList, 
  Thermometer, ShieldCheck, User, LifeBuoy, Lock, AlertTriangle, 
  History, Receipt, FlaskConical, Settings, Database 
} from 'lucide-react';
import { API_MANUFACTURER, API_RETAILER } from '../config/api';

const Layout = ({ children, user, menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({});

  // --- Fetch notification counts ---
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || !user?.role) return;

      try {
        let endpoint = '';
        if (user.role === 'Manufacturer') {
          endpoint = `${API_MANUFACTURER}/notifications/counts`;
        } else if (user.role === 'Retailer') {
          endpoint = `${API_RETAILER}/notifications/counts`;
        } else {
          return; // No notifications for other roles yet
        }

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotificationCounts(response.data);
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchNotificationCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  // --- Get badge count for a menu path ---
  const getBadgeCount = (path) => {
    if (!notificationCounts) return 0;
    
    // Manufacturer badge mappings
    if (path.includes('/manufacturer/orders')) return notificationCounts.orders || 0;
    if (path.includes('/manufacturer/shipments')) return notificationCounts.shipments || 0;
    if (path.includes('/manufacturer/iot-alerts')) return notificationCounts.alerts || 0;
    
    // Retailer badge mappings
    if (path.includes('/retailer/customer-orders')) return notificationCounts.customerOrders || 0;
    if (path.includes('/retailer/shipments')) return notificationCounts.shipments || 0;
    if (path.includes('/retailer/alerts')) return notificationCounts.alerts || 0;
    if (path.includes('/retailer/orders') && !path.includes('customer')) return notificationCounts.orders || 0;
    
    return 0;
  };

  // --- 1. Strict Active State Logic ---
  const isActive = (menuPath) => {
    const currentPath = location.pathname;
    const currentParams = new URLSearchParams(location.search);
    const currentTab = currentParams.get('tab');

    const [menuBasePath, menuQuery] = menuPath.split('?');
    const menuParams = new URLSearchParams(menuQuery);
    const menuTab = menuParams.get('tab');

    if (currentPath !== menuBasePath) return false;

    if (menuTab) {
      return currentTab === menuTab;
    }
    if (!menuTab) {
      return !currentTab || currentTab === 'dashboard';
    }
    return false;
  };

  // --- Default Menus ---
  const commonMenuItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  ];

  const manufacturerMenuItems = [
    { label: 'Dashboard', path: '/manufacturer/dashboard', icon: <Factory size={20} /> },
    { label: 'Products', path: '/manufacturer/products', icon: <Package size={20} /> },
    { label: 'Orders', path: '/manufacturer/orders', icon: <ClipboardList size={20} /> },
    { label: 'Production', path: '/manufacturer/production', icon: <FlaskConical size={20} /> },
    { label: 'Shipments', path: '/manufacturer/shipments', icon: <Truck size={20} /> },
    { label: 'IoT Alerts', path: '/manufacturer/iot-alerts', icon: <Thermometer size={20} /> },
    { label: 'Ledger Audit', path: '/manufacturer/ledger-audit', icon: <FileText size={20} /> },
  ];

  const retailerMenuItems = [
    { label: 'Dashboard', path: '/retailer/dashboard', icon: <ShoppingBag size={20} /> },
    { label: 'Customer Orders', path: '/retailer/customer-orders', icon: <Receipt size={20} /> },
    { label: 'My Orders', path: '/retailer/orders', icon: <Package size={20} /> },
    { label: 'Inventory', path: '/retailer/inventory', icon: <Package size={20} /> },
    { label: 'Shipments', path: '/retailer/shipments', icon: <Truck size={20} /> },
    { label: 'Customers', path: '/retailer/customers', icon: <Users size={20} /> },
    { label: 'Verify Products', path: '/retailer/verify', icon: <ShieldCheck size={20} /> },
    { label: 'Alerts', path: '/retailer/alerts', icon: <AlertTriangle size={20} /> },
    { label: 'Analytics', path: '/retailer/analytics', icon: <BarChart size={20} /> },
    { label: 'Settings', path: '/retailer/settings', icon: <Settings size={20} /> },
  ];

  const customerMenuItems = [
    { label: 'Dashboard', path: '/customer/dashboard', icon: <User size={20} /> },
    { label: 'Verify Product', path: '/customer/verify', icon: <ShieldCheck size={20} /> },
    { label: 'My Verifications', path: '/customer/verifications', icon: <History size={20} /> },
    { label: 'Product History', path: '/customer/history', icon: <FileText size={20} /> },
    { label: 'Safety Alerts', path: '/customer/alerts', icon: <AlertTriangle size={20} /> },
    { label: 'Report Fake', path: '/customer/report', icon: <X size={20} /> },
    { label: 'Profile', path: '/customer/profile', icon: <User size={20} /> },
    { label: 'Change Password', path: '/customer/change-password', icon: <Lock size={20} /> },
    { label: 'Help & Support', path: '/customer/help', icon: <LifeBuoy size={20} /> },
  ];

  // --- Determine Current Menu Items ---
  let currentMenuItems = [];
  if (menuItems && menuItems.length > 0) {
    currentMenuItems = menuItems;
  } else if (user?.role === 'Manufacturer') {
    currentMenuItems = manufacturerMenuItems;
  } else if (user?.role === 'Retailer') {
    currentMenuItems = retailerMenuItems;
  } else if (user?.role === 'Customer') {
    currentMenuItems = customerMenuItems;
  } else {
    currentMenuItems = commonMenuItems;
  }

  // --- Dynamic Page Title Logic ---
  const activeItem = currentMenuItems.find(item => isActive(item.path));
  const pageTitle = activeItem ? activeItem.label : location.pathname.split('/').pop().replace(/-/g, ' ').toUpperCase();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className={`flex items-center justify-between h-20 px-4 border-b border-slate-800 ${!isSidebarOpen && 'justify-center'}`}>
          <Link 
            to="/" 
            className={`flex items-center gap-3 transition-all hover:opacity-80 ${!isSidebarOpen && 'justify-center w-full'}`}
          >
            <div className="bg-emerald-500 p-2 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
              </svg>
            </div>
            {isSidebarOpen && <span className="font-black text-lg tracking-wide text-white">BESS-PAS</span>}
          </Link>

          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {currentMenuItems.length > 0 ? (
            currentMenuItems.map((item) => {
              const badgeCount = getBadgeCount(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition relative ${
                    isActive(item.path)
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <span className="flex-shrink-0 relative">
                    {item.icon}
                    {badgeCount > 0 && !isSidebarOpen && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </span>
                  {isSidebarOpen && (
                    <>
                      <span className="truncate flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-slate-500 text-xs px-4 py-2">No menu items</p>
          )}
        </nav>

        {/* User Menu - Bottom */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800 ${!isSidebarOpen && 'justify-center'}`}>
            {!isSidebarOpen && (
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-300 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Role'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-30">
          <div className="flex items-center justify-between h-20 px-8">
            <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-900 lg:hidden">
              <Menu size={24} />
            </button>
            
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {pageTitle}
            </h1>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown size={16} className="text-slate-600" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      const role = user?.role?.toLowerCase();
                      if (role) {
                        navigate(`/${role}/settings`);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-slate-50">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;