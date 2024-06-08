import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Form, Input, Button, Row, Col, Typography, message } from 'antd';
import { motion } from 'framer-motion';
import NavBar from './NavBar';
import './SignUp.css';
import { createOwner } from '../../Routes';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const SignUp = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const onFinish = async values => {
    setLoading(true);
    console.log('Received values: ', values);
    try {
      await createOwner(values);
      navigate('/login');
      message.success('Owner created successfully, login as Owner to your dashboard');
    } catch (error) {
      message.error('Failed to Create Owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="layout">
      <Header style={{ backgroundColor: 'white' }}>
        <NavBar />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Row justify="center" align="middle" className="form-section">
            <Col span={8}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Title level={3} style={{ color: '#024702' }}>Why Choose Us?</Title>
                <Paragraph style={{ color: '#024702', fontSize: '18px' }}>
                  Our platform provides you with comprehensive tools to manage your gas stations effectively. From tracking inventory to managing staff, we cover all aspects to ensure your operations run smoothly.
                </Paragraph>
                <Paragraph style={{ color: '#024702', fontSize: '18px' }}>
                  Join us today and take the first step towards a more efficient and streamlined gas station management experience.
                </Paragraph>
                <motion.img
                  src="https://source.unsplash.com/800x600/?gas-station"
                  alt="Gas Station"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="animated-image"
                />
              </motion.div>
            </Col>
            <Col span={2}>

            </Col>
            <Col span={8}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Title level={2} style={{ color: '#024702' }}>Sign Up</Title>
                <Form form={form} onFinish={onFinish}>
                  <Form.Item
                    name="name"
                    className="custom-input"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                  >
                    <Input placeholder="Name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    className="custom-input"
                    rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    className="custom-input"
                    rules={[{ required: true, message: 'Please input your phone number!' }]}
                  >
                    <Input placeholder="Phone" />
                  </Form.Item>
                  <Form.Item name="address" className="custom-input">
                    <Input.TextArea placeholder="Address" />
                  </Form.Item>
                  <Form.Item name="city" className="custom-input">
                    <Input placeholder="City" />
                  </Form.Item>
                  <Form.Item name="state" className="custom-input">
                    <Input placeholder="State" />
                  </Form.Item>
                  <Form.Item name="zip_code" className="custom-input"> 
                    <Input placeholder="Zip Code" />
                  </Form.Item>
                  <Form.Item name="country" className="custom-input">
                    <Input placeholder="Country" />
                  </Form.Item>
                  <Form.Item
                    name="company_name"
                    rules={[{ required: true, message: 'Please input your company name!' }]}
                    className="custom-input"
                  >
                    <Input placeholder="Company Name" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    hasFeedback
                    className="custom-input"
                  >
                    <Input.Password placeholder="Password" />
                  </Form.Item>
                  <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                      }),
                    ]}
                    className="custom-input"
                  >
                    <Input.Password placeholder="Confirm Password" />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      style={{ backgroundColor: '#024702', borderColor: '#024702' }}
                    >
                      Sign Up
                    </Button>
                  </Form.Item>
                </Form>
              </motion.div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default SignUp;
