import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  BarChart3,
  AlertTriangle,
  Archive,
  Zap,
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
    icon: React.createElement(Truck, { size: 18 }),
    label: 'Shipments',
    path: '/retailer/shipments',
  },
  {
    icon: React.createElement(Archive, { size: 18 }),
    label: 'Inventory',
    path: '/retailer/inventory',
  },
  {
    icon: React.createElement(BarChart3, { size: 18 }),
    label: 'Analytics',
    path: '/retailer/analytics',
  },
  {
    icon: React.createElement(AlertTriangle, { size: 18 }),
    label: 'Alerts & Recalls',
    path: '/retailer/alerts',
  },
  {
    icon: React.createElement(Zap, { size: 18 }),
    label: 'IoT Alerts',
    path: '/retailer/iot-alerts',
  },
  {
    icon: React.createElement(Settings, { size: 18 }),
    label: 'Settings',
    path: '/retailer/settings',
  },
];
