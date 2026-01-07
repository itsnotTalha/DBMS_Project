import React from 'react'; // Don't forget to import React
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // This serves as the Manufacturer/Generic Dashboard
import Products from './pages/Products';
import Shipments from './pages/Shipments';
import IoTAlerts from './pages/IoTAlerts';
import LedgerAudit from './pages/LedgerAudit';
import CustomerDashboard from './pages/customerDashboard';
import RetailerDashboard from './pages/retailerDashboard';
import AdminDashboard from './pages/adminDashboard';

// --- NEW COMPONENT: DECIDES WHERE TO GO ---
const RootRedirect = () => {
  // 1. Retrieve User Data (Check BOTH Local and Session storage for "Remember Me" logic)
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  // 2. If NO user data found, go to Login
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Parse the user object to get the Role
  const user = JSON.parse(storedUser);
  const role = user.role; 

  // 4. Redirect based on Role (Matches your MySQL ENUMs exactly)
  if (role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
  if (role === 'Retailer') return <Navigate to="/retailer-dashboard" replace />;
  if (role === 'Customer') return <Navigate to="/customer-dashboard" replace />;
  
  // 5. Fallback for 'Manufacturer' or others
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. LANDING PAGE: Uses the new RootRedirect logic */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* 2. PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 3. PROTECTED ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/iot-alerts" element={<IoTAlerts />} />
        <Route path="/ledger-audit" element={<LedgerAudit />} />
        
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;