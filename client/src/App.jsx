
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// Manufacturer Routes
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import ManufacturerProducts from './pages/manufacturer/Products';
import AddProduct from './pages/manufacturer/AddProduct';
import ManufacturerProduction from './pages/manufacturer/Production';
import ManufacturerShipments from './pages/manufacturer/Shipments';
import ManufacturerIoTAlerts from './pages/manufacturer/IoTAlerts';
import ManufacturerLedgerAudit from './pages/manufacturer/LedgerAudit';
import Orders from './pages/manufacturer/Orders';

// Retailer Routes
import RetailerDashboard from './pages/retailer/Dashboard';

// Customer Routes
import CustomerDashboard from './pages/customer/Dashboard';

// Admin Routes
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Manufacturer Routes */}
        <Route path="/manufacturer/dashboard" element={<ManufacturerDashboard />} />
        <Route path="/manufacturer/products" element={<ManufacturerProducts />} />
        <Route path="/manufacturer/add-product" element={<AddProduct />} />
        <Route path="/manufacturer/production" element={<ManufacturerProduction />} />
        <Route path="/manufacturer/shipments" element={<ManufacturerShipments />} />
        <Route path="/manufacturer/iot-alerts" element={<ManufacturerIoTAlerts />} />
        <Route path="/manufacturer/ledger-audit" element={<ManufacturerLedgerAudit />} />
        <Route path="/manufacturer/orders" element={<Orders />} />

        {/* Retailer Routes */}
        <Route path="/retailer/dashboard" element={<RetailerDashboard />} />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Legacy Routes (redirect to new locations) */}
        <Route path="/dashboard" element={<ManufacturerDashboard />} />
        <Route path="/products" element={<ManufacturerProducts />} />
        <Route path="/shipments" element={<ManufacturerShipments />} />
        <Route path="/iot-alerts" element={<ManufacturerIoTAlerts />} />
        <Route path="/ledger-audit" element={<ManufacturerLedgerAudit />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Default Route */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;