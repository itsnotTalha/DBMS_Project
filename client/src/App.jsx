import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

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
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;