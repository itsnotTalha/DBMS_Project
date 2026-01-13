import React from 'react';
import Settings from '../shared/Settings';
import { retailerMenuItems } from './menu';

const RetailerSettings = () => {
  return (
    <Settings 
      menuItems={retailerMenuItems}
      roleCheck={(role) => role === 'Retailer'}
    />
  );
};

export default RetailerSettings;
