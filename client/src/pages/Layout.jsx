import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, LayoutDashboard, Package, Truck, Bell, BarChart, FileText, Users, ShoppingBag, Factory, ClipboardList, Thermometer, ShieldCheck, User, LifeBuoy, Lock, AlertTriangle, History, MapPin, Receipt, FlaskConical, Settings, HelpCircle } from 'lucide-react';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Renamed for clarity
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Define menu items based on roles
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
    { label: 'Orders', path: '/retailer/orders', icon: <Receipt size={20} /> },
    { label: 'Inventory', path: '/retailer/inventory', icon: <Package size={20} /> },
    { label: 'Shipments', path: '/retailer/shipments', icon: <Truck size={20} /> },
    { label: 'Customers', path: '/retailer/customers', icon: <Users size={20} /> },
    { label: 'Verify Products', path: '/retailer/verify', icon: <ShieldCheck size={20} /> },
    { label: 'Cold Chain Alerts', path: '/retailer/alerts', icon: <AlertTriangle size={20} /> },
    { label: 'Recalls', path: '/retailer/recalls', icon: <Bell size={20} /> },
    { label: 'Compliance', path: '/retailer/compliance', icon: <FileText size={20} /> },
    { label: 'Analytics', path: '/retailer/analytics', icon: <BarChart size={20} /> },
    { label: 'Support', path: '/retailer/support', icon: <HelpCircle size={20} /> },
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

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { label: 'System Analytics', path: '/admin/analytics', icon: <BarChart size={20} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  let currentMenuItems = [];
  if (user?.role === 'Manufacturer') {
    currentMenuItems = manufacturerMenuItems;
  } else if (user?.role === 'Retailer') {
    currentMenuItems = retailerMenuItems;
  } else if (user?.role === 'Customer') {
    currentMenuItems = customerMenuItems;
  } else if (user?.role === 'Admin') {
    currentMenuItems = adminMenuItems;
  } else {
    currentMenuItems = commonMenuItems; // Default for unauthenticated or unknown roles
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // Clear stored user and token
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    // Redirect to login
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
          <div className={`flex items-center gap-3 transition-all ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-emerald-500 p-2 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
              </svg>
            </div>
            {isSidebarOpen && <span className="font-black text-lg tracking-wide">BESS-PAS</span>}
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {currentMenuItems.length > 0 ? (
            currentMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive(item.path)
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))
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
            <h1 className="text-sm font-bold text-slate-900">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/').pop().replace(/-/g, ' ').toUpperCase()}
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
                      // Navigate to role-specific settings
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

      {/* Mobile Overlay - only show when sidebar is open on mobile */}
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