// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        userId: null,
        role: null,
        stationId: null,
        stations: [],
        name: null,
        isAuthenticated: false,
    });

    useEffect(() => {
        // Load auth information from local storage or cookies when the app starts
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        const stations = JSON.parse(localStorage.getItem('stations')) || [];
        const stationId = localStorage.getItem('stationId');
        const name = localStorage.getItem('name');

        if (userId && role) {
            setAuth({
                userId,
                role,
                stationId,
                stations,
                name,
                isAuthenticated: true,
            });
        }
    }, []);

    const login = (data) => {
        const { id, role, stations, stationId, name } = data;
        localStorage.setItem('userId', id);
        localStorage.setItem('role', role);
        localStorage.setItem('stations', JSON.stringify(stations));
        localStorage.setItem('stationId', stationId);
        localStorage.setItem('name', name);

        setAuth({
            userId: id,
            role,
            stationId,
            stations,
            name,
            isAuthenticated: true,
        });
    };

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('stations');
        localStorage.removeItem('stationId');
        localStorage.removeItem('name');
        Cookies.remove('access');
        Cookies.remove('refresh');
        Cookies.remove('csrftoken');

        setAuth({
            userId: null,
            role: null,
            stationId: null,
            stations: [],
            name: null,
            isAuthenticated: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
