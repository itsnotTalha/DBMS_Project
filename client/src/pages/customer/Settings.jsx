import React from 'react';
import Settings from '../shared/Settings';
import { customerMenuItems } from './menu';

const CustomerSettings = () => {
  return (
    <Settings 
      menuItems={customerMenuItems}
      roleCheck={(role) => role?.toLowerCase() === 'customer'}
    />
  );
};

export default CustomerSettings;
