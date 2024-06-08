/* eslint-disable no-unused-vars */
import React from 'react'
import CustomLayout from '../../DashboardComponent'
import { useAuth } from '../../../AuthContext';
import AttendantShiftManagement from './AttendantShift';
import AttendantSalesReport from './AttendantSalesReport';


const AttendantDashboard = () => {
  const { userId, stationId, role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
      return <div>Loading...</div>;
  }

  const components = {
      Analytics: <div>Analytics</div>,
      Shifts: <AttendantShiftManagement />,
      'Sales Report': <AttendantSalesReport />,
  };

  return (
      <CustomLayout role={role}>
          {components}
      </CustomLayout>
  );
};
  export default AttendantDashboard;