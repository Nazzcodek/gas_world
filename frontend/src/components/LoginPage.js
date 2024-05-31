// src/components/LoginPage.js
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { login } from '../Routes';
import './LoginPage.css';
import { Form, Input, Button, Radio } from 'antd';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('owner');

    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const routeMap = {
                owner: login.ownerLogin,
                manager: login.managerLogin,
                attendant: login.attendantLogin,
            };
            const data = await routeMap[role](email, password);
            console.log('Login successful:');
    
            // Set token in cookies
            Cookies.set('access', data.access, { expires: 1, secure: false, sameSite: 'Lax' });
            Cookies.set('csrftoken', data.csrftoken, {expires: 1, secure: false, sameSite: 'Lax'});
    
            localStorage.setItem('name', data.name);
            // Navigate to the dashboard of the logged-in user
            navigate(`/${role}/dashboard`);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <>
            <h1 style={{ marginLeft: '40px', color: '#024702' }}>Welcome to Gas World</h1>
            <div className="login-container">
                <div className="login-form">
                    <div className="centered-content">
                        <Radio.Group onChange={(e) => setRole(e.target.value)} value={role}>
                            <Radio.Button value="owner">Owner</Radio.Button>
                            <Radio.Button value="manager">Manager</Radio.Button>
                            <Radio.Button value="attendant">Attendant</Radio.Button>
                        </Radio.Group>
                        <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
                    </div>
                    <Form onFinish={handleLogin}>
                        <Form.Item label="Email" name="email">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='input-box'
                            />
                        </Form.Item>
                        <Form.Item label="Password" name="password">
                            <Input.Password
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='input-box'
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
