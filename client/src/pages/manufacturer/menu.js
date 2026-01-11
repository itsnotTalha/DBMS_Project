import React from 'react';
import {
  LayoutDashboard,
  Box,
  Truck,
  Activity,
  ShieldCheck,
  Package,
  ClipboardList,
} from 'lucide-react';

export const manufacturerMenuItems = [
  {
    icon: React.createElement(LayoutDashboard, { size: 18 }),
    label: 'Dashboard',
    path: '/manufacturer/dashboard',
  },
  {
    icon: React.createElement(Box, { size: 18 }),
    label: 'Products',
    path: '/manufacturer/products',
  },
  {
    icon: React.createElement(ClipboardList, { size: 18 }),
    label: 'Orders',
    path: '/manufacturer/orders',
  },
  {
    icon: React.createElement(Package, { size: 18 }),
    label: 'Production',
    path: '/manufacturer/production',
  },
  {
    icon: React.createElement(Truck, { size: 18 }),
    label: 'Shipments',
    path: '/manufacturer/shipments',
  },
  {
    icon: React.createElement(Activity, { size: 18 }),
    label: 'IoT Alerts',
    path: '/manufacturer/iot-alerts',
  },
  {
    icon: React.createElement(ShieldCheck, { size: 18 }),
    label: 'Ledger Audit',
    path: '/manufacturer/ledger-audit',
  },
];
