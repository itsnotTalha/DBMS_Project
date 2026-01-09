import React from 'react';
import {
  LayoutDashboard,
  Box,
  Store,
  Truck,
  AlertTriangle,
  FileText,
  MessageSquare,
} from 'lucide-react';

export const retailerMenuItems = [
  {
    icon: React.createElement(LayoutDashboard, { size: 18 }),
    label: 'Dashboard',
    path: '/retailer/dashboard',
  },
  {
    icon: React.createElement(Box, { size: 18 }),
    label: 'Inventory',
    path: '/retailer/inventory',
  },
  {
    icon: React.createElement(Store, { size: 18 }),
    label: 'Verify Products',
    path: '/retailer/verify-products',
  },
  {
    icon: React.createElement(Truck, { size: 18 }),
    label: 'Incoming Shipments',
    path: '/retailer/shipments',
  },
  {
    icon: React.createElement(AlertTriangle, { size: 18 }),
    label: 'Cold Chain Alerts',
    path: '/retailer/alerts',
  },
  {
    icon: React.createElement(AlertTriangle, { size: 18 }),
    label: 'Recalls & Notices',
    path: '/retailer/recalls',
  },
  {
    icon: React.createElement(FileText, { size: 18 }),
    label: 'Compliance Reports',
    path: '/retailer/reports',
  },
  {
    icon: React.createElement(MessageSquare, { size: 18 }),
    label: 'Support',
    path: '/retailer/support',
  },
];
