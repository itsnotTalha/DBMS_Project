import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  BarChart3,
  AlertTriangle,
  Archive,
  Users,
  QrCode,
  Settings,
} from 'lucide-react';

export const retailerMenuItems = [
  {
    icon: React.createElement(LayoutDashboard, { size: 18 }),
    label: 'Dashboard',
    path: '/retailer/dashboard',
  },
  {
    icon: React.createElement(ShoppingCart, { size: 18 }),
    label: 'Orders',
    path: '/retailer/orders',
  },
  {
    icon: React.createElement(Archive, { size: 18 }),
    label: 'Inventory',
    path: '/retailer/inventory',
  },
  {
    icon: React.createElement(Truck, { size: 18 }),
    label: 'Shipments',
    path: '/retailer/shipments',
  },
  {
    icon: React.createElement(Users, { size: 18 }),
    label: 'Customers',
    path: '/retailer/customers',
  },
  {
    icon: React.createElement(BarChart3, { size: 18 }),
    label: 'Analytics',
    path: '/retailer/analytics',
  },
  {
    icon: React.createElement(AlertTriangle, { size: 18 }),
    label: 'Alerts',
    path: '/retailer/alerts',
  },
  {
    icon: React.createElement(QrCode, { size: 18 }),
    label: 'Verify Product',
    path: '/retailer/verify',
  },
  {
    icon: React.createElement(Settings, { size: 18 }),
    label: 'Settings',
    path: '/retailer/settings',
  },
];