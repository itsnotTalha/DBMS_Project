import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import LandingPage from './pages/LandingPage';
import BusinessLandingPage from './pages/BusinessLandingPage';
import PublicVerify from './pages/PublicVerify';
import AboutUs from './pages/AboutUs';
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
import RetailerCustomerOrders from './pages/retailer/CustomerOrders';
import RetailerInventory from './pages/retailer/Inventory';
import RetailerShipments from './pages/retailer/Shipments';
import RetailerCustomers from './pages/retailer/Customers';
import RetailerAnalytics from './pages/retailer/Analytics';
import RetailerAlerts from './pages/retailer/Alerts';
import RetailerVerifyProduct from './pages/retailer/VerifyProduct';
import RetailerSettings from './pages/retailer/Settings';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerSettings from './pages/customer/Settings';
import CustomerOrders from './pages/customer/Orders';
import CustomerMyProducts from './pages/customer/MyProducts';
import CustomerVerifyProduct from './pages/customer/VerifyProduct';
import CustomerVerificationHistory from './pages/customer/VerificationHistory';
import CustomerReportForm from './pages/customer/ReportForm';
import CheckoutPage from './pages/CheckoutPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/Settings';

// Manufacturer Settings
import ManufacturerSettings from './pages/manufacturer/Settings';

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
  if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'Retailer') return <Navigate to="/retailer/dashboard" replace />;
  if (role === 'Customer') return <Navigate to="/customer/dashboard" replace />;
  if (role === 'Manufacturer') return <Navigate to="/manufacturer/dashboard" replace />;
  
  // 5. Fallback
  return <Navigate to="/login" replace />;
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
        <Route path="/manufacturer/settings" element={<ManufacturerSettings />} />

        {/* Retailer Routes */}
        <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
        <Route path="/retailer/orders" element={<RetailerOrders />} />
        <Route path="/retailer/customer-orders" element={<RetailerCustomerOrders />} />
        <Route path="/retailer/inventory" element={<RetailerInventory />} />
        <Route path="/retailer/shipments" element={<RetailerShipments />} />
        <Route path="/retailer/customers" element={<RetailerCustomers />} />
        <Route path="/retailer/analytics" element={<RetailerAnalytics />} />
        <Route path="/retailer/alerts" element={<RetailerAlerts />} />
        <Route path="/retailer/verify" element={<RetailerVerifyProduct />} />
        <Route path="/retailer/settings" element={<RetailerSettings />} />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/customer/my-products" element={<CustomerMyProducts />} />
        <Route path="/customer/verify" element={<CustomerVerifyProduct />} />
        <Route path="/customer/verifications" element={<CustomerVerificationHistory />} />
        <Route path="/customer/report" element={<CustomerReportForm />} />
        <Route path="/customer/settings" element={<CustomerSettings />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Default Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/business" element={<BusinessLandingPage />} />
        <Route path="/verify/:code" element={<PublicVerify />} />
        <Route path="/verify" element={<PublicVerify />} />
      </Routes>
    </Router>
  );
}

export default App;