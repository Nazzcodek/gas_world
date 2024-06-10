import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Row, Col } from 'antd';
import { useAuth } from '../../AuthContext';
import { changePassword, updateUser, getUser } from '../../Routes';

const { Title } = Typography;

const Profile = () => {
    const { userId, role, stationId, isAuthenticated } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        company_name: ''
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (isAuthenticated) {
                try {
                    const userData = await getUser(role, userId, stationId);
                    setUserDetails(userData);
                    form.setFieldsValue(userData);
                } catch (error) {
                    message.error('Failed to fetch user details');
                }
            }
        };

        fetchUserDetails();
    }, [isAuthenticated, form, role, userId, stationId]);

    const handleEdit = () => {
        setEditing(!editing);
        if (editing) {
            form.submit();
        }
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const response = await updateUser(role, userId, values, stationId);
            console.log('Response from server:', response);
            message.success('Profile updated successfully');
            setEditing(false);
            setUserDetails(values);
        } catch (error) {
            console.error('Failed to update profile:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
            }
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            const data = {
                email: values.email,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
                password: values.newPassword,
            };
            await changePassword(userId, role, data);
            message.success('Password changed successfully');
            passwordForm.resetFields();
            setShowPasswordForm(false);
        } catch (error) {
            message.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <Title level={2}>Profile</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    initialValues={userDetails}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input your name!' }]}
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.name}</Typography.Text>}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Please input your email!' }]}
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.email}</Typography.Text>}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Phone"
                                name="phone"
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.phone}</Typography.Text>}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Address"
                                name="address"
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.address}</Typography.Text>}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="City"
                                name="city"
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.city}</Typography.Text>}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="State"
                                name="state"
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.state}</Typography.Text>}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Zip Code"
                                name="zip_code"
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.zip_code}</Typography.Text>}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Country"
                                name="country"
                            >
                                {editing ? <Input /> : <Typography.Text>{userDetails.country}</Typography.Text>}
                            </Form.Item>
                        </Col>
                    </Row>
                    {role === 'owner' && (
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Company Name"
                                    name="company_name"
                                    rules={[{ required: true, message: 'Please input your company name!' }]}
                                >
                                    {editing ? <Input /> : <Typography.Text>{userDetails.company_name}</Typography.Text>}
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                    <Form.Item>
                        <Button type="primary" onClick={handleEdit} loading={loading}>
                            {editing ? 'Save' : 'Edit'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <Title level={2}>Change Password</Title>
                {!showPasswordForm ? (
                    <Button type="primary" onClick={() => setShowPasswordForm(true)}>
                        Change Password
                    </Button>
                ) : (
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        initialValues={{ email: userDetails.email }}
                    >
                        <Form.Item label="Email" name="email">
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            label="New Password"
                            name="newPassword"
                            rules={[{ required: true, message: 'Please input your new password!', min: 6 }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            rules={[{ required: true, message: 'Please confirm your new password!', min: 6 }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default Profile;