
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Shipments from './pages/Shipments';
import IoTAlerts from './pages/IoTAlerts';
import LedgerAudit from './pages/LedgerAudit';
import CustomerDashboard from './pages/customerDashboard';
import RetailerDashboard from './pages/retailerDashboard';
import AdminDashboard from './pages/adminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/iot-alerts" element={<IoTAlerts />} />
        <Route path="/ledger-audit" element={<LedgerAudit />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;