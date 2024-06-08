import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { login } from '../Routes';
import './LoginPage.css';
import { Form, Input, Button, Radio, Layout } from 'antd';
import NavBar from './home/NavBar';

const { Header } = Layout;

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('owner');
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const routeMap = {
                owner: login.ownerLogin,
                manager: login.managerLogin,
                attendant: login.attendantLogin,
            };
            const data = await routeMap[role](email, password);
    
            Cookies.set('access', data.access, { expires: 1, secure: false, sameSite: 'Lax' });
            Cookies.set('csrftoken', data.csrftoken, {expires: 1, secure: false, sameSite: 'Lax'});
            Cookies.set('refresh', data.refresh, { expires: 7, secure: false, sameSite: 'Lax' });
    
            const userData = {
                id: data.id,
                role,
                stations: data.stations || [],
                stationId: data.station_id || null,
                name: data.name,
            };
            console.log(userData)
            authLogin(userData);
            navigate(`/${role}/${data.id}/dashboard`);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <>
            <Header style={{ backgroundColor: 'white' }}>
                <NavBar />
            </Header>
            <h2 style={{ marginLeft: '40px', marginBottom: '0', marginTop: '50px', color: '#024702' }}>Welcome Back, Login To Your User Account</h2>
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
                                className='input-box'
                                style={{ width: '260px' }}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
