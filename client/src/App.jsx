import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import LandingPage from './pages/LandingPage';
import BusinessLandingPage from './pages/BusinessLandingPage';
import SimpleAuthLayout from './pages/Auth/SimpleAuthLayout';

// Manufacturer Pages
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import ManufacturerProducts from './pages/manufacturer/Products';
import ManufacturerAddProduct from './pages/manufacturer/AddProduct';
import ManufacturerProduction from './pages/manufacturer/Production';
import ManufacturerShipments from './pages/manufacturer/Shipments';
import ManufacturerIoTAlerts from './pages/manufacturer/IoTAlerts';
import ManufacturerLedgerAudit from './pages/manufacturer/LedgerAudit';
import ManufacturerOrders from './pages/manufacturer/Orders';

// Retailer Pages
import RetailerDashboard from './pages/retailer/Dashboard';
import RetailerOrders from './pages/retailer/Orders';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

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
        {/* Auth Routes */}
        <Route element={<SimpleAuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Manufacturer Routes */}
        <Route path="/manufacturer/dashboard" element={<ManufacturerDashboard />} />
        <Route path="/manufacturer/products" element={<ManufacturerProducts />} />
        <Route path="/manufacturer/add-product" element={<ManufacturerAddProduct />} />
        <Route path="/manufacturer/production" element={<ManufacturerProduction />} />
        <Route path="/manufacturer/shipments" element={<ManufacturerShipments />} />
        <Route path="/manufacturer/iot-alerts" element={<ManufacturerIoTAlerts />} />
        <Route path="/manufacturer/ledger-audit" element={<ManufacturerLedgerAudit />} />
        <Route path="/manufacturer/orders" element={<ManufacturerOrders />} />

        {/* Retailer Routes */}
        <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
        <Route path="/retailer/orders" element={<RetailerOrders />} />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Default Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/business" element={<BusinessLandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;