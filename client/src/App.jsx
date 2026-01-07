import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // This is your Manufacturer Dashboard
// Import other dashboards as you create them:
// import CustomerDashboard from './pages/CustomerDashboard';
// import RetailerDashboard from './pages/RetailerDashboard';

// --- PROTECTED ROUTE COMPONENT ---
// This prevents users from typing /dashboard in the URL if they aren't a Manufacturer
const ProtectedRoute = ({ children, allowedRole }) => {
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  if (allowedRole && user.role !== allowedRole) {
    // If a Customer tries to access Manufacturer dashboard, send them to their own
    const redirectPath = user.role === 'Customer' ? '/customer-dashboard' : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. LANDING PAGE: Always starts at Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 2. PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 3. ROLE-BASED DASHBOARDS */}
        
        {/* Manufacturer Only */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRole="Manufacturer">
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Customer Only (Placeholder for now) */}
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute allowedRole="Customer">
              <div className="p-10 text-center"><h1>Customer Portal Coming Soon</h1></div>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;