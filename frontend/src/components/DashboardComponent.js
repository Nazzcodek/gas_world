import { useState } from 'react';
import { Layout, Menu, Avatar, Button, Dropdown, theme, message } from 'antd';
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  HomeOutlined,
  TeamOutlined,
  ProductOutlined,
  ExperimentOutlined,
  HddOutlined,
  TableOutlined,
  DownOutlined,
  HomeFilled,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { logout } from '../Routes';
import './DashboardComponent.css';

const { Header, Sider, Content } = Layout;

const CustomLayout = ({ role, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const name = localStorage.getItem('name');
  const splitName = name.split(' ');
  const initials = splitName[0][0] + splitName[1][0];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = {
    owner: ['Analytics', 'Stations', 'Managers', 'Products', 'Pits', 'Pumps', 'Sales Report'],
    manager: ['Analytics', 'Attendants', 'Products', 'Pits', 'Pumps', 'Sales Report'],
    attendant: ['Analytics', 'Shifts', 'Sales Report'],
  };

  const icons = {
    Analytics: <PieChartOutlined />,
    Stations: <HomeOutlined />,
    Managers: <UserOutlined />,
    Attendants: <TeamOutlined />,
    Products: <ProductOutlined />,
    Pumps: <HddOutlined />,
    Pits: <ExperimentOutlined />,
    Shifts: <TableOutlined />,
    'Sales Report': <TableOutlined />,
  };

  const items = menuItems[role].map((item, index) => ({
    key: index + 1,
    label: item,
    icon: icons[item],
  }));

  const [selectedSider, setSelectedSider] = useState(localStorage.getItem('selectedSider') || items[0].label);

  const handleMenuClick = e => {
    const clickedItem = items.find(item => item.key === Number(e.key));
    localStorage.setItem('selectedSider', clickedItem.label);
    setSelectedSider(clickedItem.label);
  };

  const selectedKey = items.find(item => item.label === selectedSider).key;

  const handleLogout = async () => {
    try {
        // Call the API to log out the user
        await logout();
        
        // Clear localStorage
        localStorage.clear();

        // Clear cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.trim().startsWith("expires=") ? c : `${c.split("=")[0]}=;expires=${new Date().toUTCString()};path=/`;
        });

        // Redirect to login page
        navigate('/login');
    } catch (error) {
        console.error('Logout failed:', error);
        message.error('Failed to log out. Please try again.');
    }
};


  const profileItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <ProfileOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const profileMenu = (
    <Menu
      items={profileItems}
      className='profle-menu'
      style={{ 
        width: 150,
        // marginTop: '20px',
      }} />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
          <img className="logo" src='/gas_world_02.png' alt='Gas World Logo'/>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
            color: '#024702'
          }}
        />
        <Button
          type="text"
          icon={<HomeFilled />}
          onClick={() => navigate('/')}
          style={{
            fontSize: '16px',
            marginLeft: '20px',
            color: '#024702'
          }}
        />
        <span style={{ marginLeft: '50px', fontWeight: 'bold', fontSize: '20px', color: '#024702' }}>{role.toUpperCase()} / {selectedSider}</span>
        <div style={{ float: 'right', marginRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '20px', fontWeight: 'bold', fontSize: '20px', color: '#024702' }}>{name}</span>
          <Avatar style={{ backgroundColor: '#024702' }}>{initials}</Avatar>
          <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
            <div className='dropdown-div'>
              <DownOutlined />
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className='sider'>
          <Menu
            mode="inline"
            defaultSelectedKeys={[selectedKey.toString()]}
            className="sider-menu"
            items={items}
            onClick={handleMenuClick}
          />
        </Sider>
        <Content style={{
          margin: '24px 16px 0',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG
        }}>
          <div style={{ padding: 24, minHeight: 360 }}>{children[selectedSider]}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
