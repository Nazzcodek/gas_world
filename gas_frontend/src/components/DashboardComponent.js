import { useState } from 'react'
import { Layout, Menu, Avatar, Button, theme } from 'antd';
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
} from '@ant-design/icons';
import './DashboardComponent.css'

const { Header, Sider, Content } = Layout;

const CustomLayout = ({ role, children, components }) => {
const [collapsed, setCollapsed] = useState(false);

const name = localStorage.getItem('name')
const splitName = name.split(' ');
const initials = splitName[0][0] + splitName[1][0];

const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const menuItems = {
    owner: ['Analytics', 'Station', 'Manager', 'Products', 'Pits', 'Pumps'],
    manager: ['Analytics', 'Pumps', 'Attendant', 'Pits', 'Products'],
    attendant: ['Analytics', 'Sales Report'],
  };
  const icons = {
    Analytics: <PieChartOutlined />,
    Station: <HomeOutlined />,
    Manager: <UserOutlined />,
    Attedant: <TeamOutlined />,
    Products: <ProductOutlined />,
    Pumps: <HddOutlined />,
    Pits: <ExperimentOutlined />,
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
        <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <span style={{ marginLeft: '50px', fontWeight: 'bold', fontSize: '20px' }}>{role.toUpperCase()} / {selectedSider}</span>
          <div style={{ float: 'right', marginRight: '20px' }}>
            <span style={{ marginRight: '20px', fontWeight: 'bold', fontSize: '20px' }}>{name}</span>
            <Avatar style={{ backgroundColor: '#024702' }}>{initials}</Avatar>
          </div>
        </Header>
        <Layout>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className='sider'>
                <div className="logo" />
                <Menu
                    // theme="dark"
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