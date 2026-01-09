import React from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  BarChart3,
  AlertTriangle,
  Settings,
  Zap,
  Shield,
} from 'lucide-react';

export const adminMenuItems = [
  {
    icon: React.createElement(LayoutDashboard, { size: 18 }),
    label: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    icon: React.createElement(Users, { size: 18 }),
    label: 'User Management',
    path: '/admin/users',
  },
  {
    icon: React.createElement(Box, { size: 18 }),
    label: 'Product Management',
    path: '/admin/products',
  },
  {
    icon: React.createElement(BarChart3, { size: 18 }),
    label: 'Analytics',
    path: '/admin/analytics',
  },
  {
    icon: React.createElement(AlertTriangle, { size: 18 }),
    label: 'Alerts & Recalls',
    path: '/admin/alerts',
  },
  {
    icon: React.createElement(Shield, { size: 18 }),
    label: 'Audit Logs',
    path: '/admin/audit-logs',
  },
  {
    icon: React.createElement(Zap, { size: 18 }),
    label: 'System Health',
    path: '/admin/health',
  },
  {
    icon: React.createElement(Settings, { size: 18 }),
    label: 'Settings',
    path: '/admin/settings',
  },
];
