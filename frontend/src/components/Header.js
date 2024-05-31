import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <nav>
                <ul className="nav">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/owner/dashboard">Owner Dashboard</Link></li>
                    <li><Link to="/manager/dashboard">Manager Dashboard</Link></li>
                    <li><Link to="/attendant/dashboard">Attendant Dashboard</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
