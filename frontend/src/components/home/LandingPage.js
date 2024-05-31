import React from 'react';
import { Layout, Menu, Button, Row, Col, Typography, Card } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import './HomeStyle.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const LandingPage = () => {
  return (
    <Layout className="layout">
      <Header>
        <div className="logo">Gas Station Management</div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
          <Menu.Item key="home">Home</Menu.Item>
          <Menu.Item key="blog">Blog</Menu.Item>
          <Menu.Item key="about">About Us</Menu.Item>
          <Menu.Item key="contact">Contact</Menu.Item>
          <Menu.Item key="login" icon={<LoginOutlined />}>Login</Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>Sign Up</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Row justify="center" align="middle" className="hero-section">
            <Col span={12}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Title style={{ color: '#024702' }}>Manage Your Gas Stations Effortlessly</Title>
                <Paragraph style={{ color: '#024702' }}>
                  With our app, you can oversee the affairs of all your stations, manage staff, monitor product stock, and more—all from a single platform.
                </Paragraph>
                <Button type="primary" size="large" style={{ backgroundColor: '#024702', borderColor: '#024702' }}>
                  Get Started
                </Button>
              </motion.div>
            </Col>
          </Row>
          <Row gutter={16} className="product-section">
            <Col span={8}>
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card hoverable cover={<img alt="Petrol" src="https://source.unsplash.com/800x600/?petrol" />}>
                  <Card.Meta title="Petrol" description="High quality petrol for efficient fuel consumption." />
                </Card>
              </motion.div>
            </Col>
            <Col span={8}>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card hoverable cover={<img alt="LPG" src="https://source.unsplash.com/800x600/?lpg" />}>
                  <Card.Meta title="LPG" description="Safe and reliable liquefied petroleum gas." />
                </Card>
              </motion.div>
            </Col>
            <Col span={8}>
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card hoverable cover={<img alt="AGO" src="https://source.unsplash.com/800x600/?diesel" />}>
                  <Card.Meta title="AGO" description="Automotive Gas Oil for your diesel engines." />
                </Card>
              </motion.div>
            </Col>
          </Row>
          <Row gutter={16} className="product-section">
            <Col span={8}>
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card hoverable cover={<img alt="DPK" src="https://source.unsplash.com/800x600/?kerosene" />}>
                  <Card.Meta title="DPK" description="Dual Purpose Kerosene for domestic and industrial use." />
                </Card>
              </motion.div>
            </Col>
            <Col span={8}>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card hoverable cover={<img alt="CNG" src="https://source.unsplash.com/800x600/?cng" />}>
                  <Card.Meta title="CNG" description="Compressed Natural Gas, an eco-friendly alternative." />
                </Card>
              </motion.div>
            </Col>
            <Col span={8}>
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card hoverable cover={<img alt="Lubricants" src="https://source.unsplash.com/800x600/?oil" />}>
                  <Card.Meta title="Lubricants" description="High-quality lubricants for all engine types." />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Gas Station Management ©2024</Footer>
    </Layout>
  );
};

export default LandingPage;
