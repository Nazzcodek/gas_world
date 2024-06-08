// import React, { useState } from 'react'
import CustomLayout from '../../DashboardComponent'
import StationManagement from './Stations'
import ManagerManagement from './Managers';
import ProductManagement from './Products'
import PumpManagement from './Pumps';
import PitManagement from './Pits';
import SalesReport from './SalesReport';

const OwnerDashboard = () => {
  const components = {
    Analytics: <div>Analytics</div>,
    Stations: <StationManagement />,
    Managers: <ManagerManagement />,
    Products: <ProductManagement />,
    Pumps: <PumpManagement />,
    Pits: <PitManagement />,
    'Sales Report': <SalesReport />,

  };
  
    return (
      <CustomLayout role="owner">
        {components}
      </CustomLayout>
    );
  };
  
  export default OwnerDashboard;