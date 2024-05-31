// import React, { useState } from 'react'
import CustomLayout from '../../DashboardComponent'
import StationManagement from './Station'
import ManagerManagement from './Manager';
import ProductManagement from './Products'
import PumpManagement from './Pump';

const OwnerDashboard = () => {
  const components = {
    Analytics: <div>Analytics</div>,
    Station: <StationManagement />,
    Manager: <ManagerManagement />,
    Products: <ProductManagement />,
    Pumps: <PumpManagement />,

  };
  
    return (
      <CustomLayout role="owner">
        {components}
      </CustomLayout>
    );
  };
  
  export default OwnerDashboard;