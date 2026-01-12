import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  CheckCircle,
  Settings,
} from 'lucide-react';

export const customerMenuItems = [
  {
    icon: React.createElement(LayoutDashboard, { size: 18 }),
    label: 'Dashboard',
    path: '/customer/dashboard',
  },
  {
    icon: React.createElement(ShoppingCart, { size: 18 }),
    label: 'My Orders',
    path: '/customer/orders',
  },
  {
    icon: React.createElement(CheckCircle, { size: 18 }),
    label: 'Verify Product',
    path: '/customer/verify',
  },
  {
    icon: React.createElement(Settings, { size: 18 }),
    label: 'Settings',
    path: '/customer/settings',
  },
];
