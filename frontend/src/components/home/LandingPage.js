import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Button, Row, Col, Typography, Card, Form, Input } from 'antd';
import { motion } from 'framer-motion';
import './HomeStyle.css';
import NavBar from './NavBar';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const LandingPage = () => {

  return (
    <Layout className="layout">
      <Header style={{ backgroundColor: 'white' }}>
        <NavBar />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Row justify="center" align="middle" className="hero-section">
            <Col span={12}>
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRadius: '10px' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Title style={{ color: '#024702' }}>Manage Your Gas Stations Effortlessly</Title>
                  <Paragraph style={{ color: '#024702', fontSize: '18px' }}>
                    With our app, you can oversee the affairs of all your stations, manage staff, monitor product stock, and more—all from a single platform.
                  </Paragraph>
                  <Link to="/signup">
                    <Button type="primary" size="large" style={{ backgroundColor: '#024702', borderColor: '#024702' }}>
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </div>
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
          <div id="about" className="about-section">
            <Row align="middle">
              <Col span={12}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Title>About Us</Title>
                  <Paragraph style={{ fontSize: '18px' }}>
                    We are committed to providing the best service in managing gas stations, offering innovative solutions to make your operations smooth and efficient.
                  </Paragraph>
                  <Title level={3}>Our Vision</Title>
                  <Paragraph style={{ fontSize: '18px' }}>
                    To revolutionize the gas station management industry through innovative and efficient solutions, ensuring optimal performance and customer satisfaction.
                  </Paragraph>
                  <Title level={3}>Our Mission</Title>
                  <Paragraph style={{ fontSize: '18px' }}>
                    Our mission is to provide comprehensive management tools that enable gas station owners to streamline operations, enhance productivity, and deliver exceptional service.
                  </Paragraph>
                </motion.div>
              </Col>
              <Col span={12}>
                <motion.img
                  src="https://source.unsplash.com/800x600/?business"
                  alt="About Us"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  style={{ width: '100%', borderRadius: '10px' }}
                />
              </Col>
            </Row>
          </div>
          <div id="contact" className="contact-section">
            <Row align="middle">
              <Col span={12}>
                <motion.img
                  src="https://source.unsplash.com/800x600/?contact"
                  alt="Contact Us"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  style={{ width: '100%', borderRadius: '10px' }}
                />
              </Col>
              <Col span={12}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Title>Contact Us</Title>
                  <Paragraph style={{ fontSize: '18px' }}>
                    If you have any questions or need support, feel free to reach out to us.
                  </Paragraph>
                  <Form layout="vertical">
                    <Form.Item label="Name">
                      <Input placeholder="Your Name" />
                    </Form.Item>
                    <Form.Item label="Email">
                      <Input placeholder="Your Email" />
                    </Form.Item>
                    <Form.Item label="Message">
                      <Input.TextArea rows={4} placeholder="Your Message" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" style={{ backgroundColor: '#024702', borderColor: '#024702' }}>
                        Submit
                      </Button>
                    </Form.Item>
                  </Form>
                </motion.div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default LandingPage;
