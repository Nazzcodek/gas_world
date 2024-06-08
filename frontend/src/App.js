import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './AuthContext';
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';
import OwnerDashboard from './components/users/owner/OwnerDashboard'
import ManagerDashboard from './components/users/manager/ManagerDashboard'
import AttendantDashboard from './components/users/attendant/AttendantDashboard'
import LandingPage from './components/home/LandingPage'
import SignUp from './components/home/SignUp';
import './App.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route exact path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/owner/:userId/dashboard" element={<OwnerDashboard />} />
                        <Route path="/manager/:userId/dashboard" element={<ManagerDashboard />} />
                        <Route path="/attendant/:userId/dashboard/" element={<AttendantDashboard />} />
                    </Routes>
                    <Footer/>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;