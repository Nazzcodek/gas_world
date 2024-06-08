import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { LoginOutlined, UserAddOutlined, DashboardOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname.substr(1) || 'home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setSelectedKey(location.pathname.substr(1) || 'home');
    const name = localStorage.getItem('name');
    const access = Cookies.get('access');
    setIsLoggedIn(!!name && !!access);
  }, [location]);

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    switch (e.key) {
      case 'home':
        navigate('/');
        break;
      case 'blog':
        navigate('/blog');
        break;
        case 'about':
          if (location.pathname !== '/') {
            navigate('/');
          }
          setTimeout(() => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
          break;
        case 'contact':
          if (location.pathname !== '/') {
            navigate('/');
          }
          setTimeout(() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
          break;
      case 'login':
        navigate('/login');
        break;
      case 'signup':
        navigate('/signup');
        break;
      case 'dashboard':
        navigate(`/${localStorage.getItem('role')}/${localStorage.getItem('userId')}/dashboard`);
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { label: 'Home', key: 'home' },
    { label: 'Blog', key: 'blog' },
    { label: 'About Us', key: 'about' },
    { label: 'Contact Us', key: 'contact' },
    ...(isLoggedIn
      ? [{ label: 'Dashboard', key: 'dashboard', icon: <DashboardOutlined />, style: { marginLeft: 'auto' } }]
      : [
          { label: 'Login', key: 'login', icon: <LoginOutlined />, style: { marginLeft: 'auto' } },
          { label: 'Sign Up', key: 'signup', icon: <UserAddOutlined /> }
        ]),
  ];

  return (
    <div className='nav'>
      <img src='gas_world_02.png' alt="Logo" className="nav-logo" />
      <Menu
        theme="light"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ fontSize: "20px" }}
      />
    </div>
  );
};

export default NavBar;
