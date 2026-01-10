import React from 'react';
import {
  CheckCircle,
  Package,
  ShoppingCart,
  AlertTriangle,
  Flag,
  User,
  HelpCircle,
} from 'lucide-react';

export const customerMenuItems = [
  {
    icon: React.createElement(CheckCircle, { size: 18 }),
    label: 'Verify Product',
    path: '/customer/verify',
  },
  {
    icon: React.createElement(Package, { size: 18 }),
    label: 'My Verifications',
    path: '/customer/verifications',
  },
  {
    icon: React.createElement(ShoppingCart, { size: 18 }),
    label: 'Product History',
    path: '/customer/history',
  },
  {
    icon: React.createElement(AlertTriangle, { size: 18 }),
    label: 'Safety Alerts',
    path: '/customer/alerts',
  },
  {
    icon: React.createElement(Flag, { size: 18 }),
    label: 'Report Fake',
    path: '/customer/report',
  },
  {
    icon: React.createElement(User, { size: 18 }),
    label: 'Profile',
    path: '/customer/profile',
  },
  {
    icon: React.createElement(HelpCircle, { size: 18 }),
    label: 'Help & FAQs',
    path: '/customer/help',
  },
];
