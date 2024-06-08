/* eslint-disable no-unused-vars */
import React from 'react';
import CustomLayout from '../../DashboardComponent';
import ManagerSalesReport from './ManagerSalesReport';
import ProductManagement from './ManagerProductManagment';
import ManagerPumpManagement from './ManagerPumpManagment';
import AttendantManagment from './AttendantManagment';
import ManagerPitManagement from './ManagerPitManagment';
import { useAuth } from '../../../AuthContext';

const ManagerDashboard = () => {
    const { userId, stationId, role, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <div>Loading...</div>;
    }

    const components = {
        Analytics: <div>Analytics</div>,
        Attendants: <AttendantManagment />,
        Products: <ProductManagement />,
        Pumps: <ManagerPumpManagement />,
        Pits: <ManagerPitManagement />,
        'Sales Report': <ManagerSalesReport />,
    };

    return (
        <CustomLayout role={role}>
            {components}
        </CustomLayout>
    );
};

export default ManagerDashboard;
