import React from 'react';
import Settings from '../shared/Settings';
import { manufacturerMenuItems } from './menu';

const ManufacturerSettings = () => {
  return (
    <Settings 
      menuItems={manufacturerMenuItems}
      roleCheck={(role) => role === 'Manufacturer'}
    />
  );
};

export default ManufacturerSettings;
