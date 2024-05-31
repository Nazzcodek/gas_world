import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';
import OwnerDashboard from './components/users/owner/OwnerDashboard'
import ManagerDashboard from './components/users/manager/ManagerDashboard'
import AttendantDashboard from './components/users/attendant/AttendantDashboard'
import LandingPage from './components/home/LandingPage'

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route exact path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                    <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                    <Route path="/attendant/dashboard" element={<AttendantDashboard />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
