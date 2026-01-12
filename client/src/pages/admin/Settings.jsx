import React from 'react';
import Settings from '../shared/Settings';
import { adminMenuItems } from './menu';

const AdminSettings = () => {
  return (
    <Settings 
      menuItems={adminMenuItems}
      roleCheck={(role) => role?.toLowerCase() === 'admin'}
    />
  );
};

export default AdminSettings;
