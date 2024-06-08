import React, { useState, useEffect } from 'react';
import { Tabs, Radio, Space, Button, Modal, Form, Input, message, Descriptions } from 'antd';
import { getStations, createManager, updateManager, changeManagerPassword, deleteManager } from '../../../Routes';

const ManagerManagement = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedManager, setSelectedManager] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [tabPosition, setTabPosition] = useState('top');
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const data = await getStations();
            setStations(data);
        } catch (error) {
            message.error('Failed to fetch stations');
        }
    };

    const handleEdit = (station) => {
        setSelectedStation(station);
        setSelectedManager(station.manager || null); // Set to null if there's no manager

        if (station.manager) {
            form.setFieldsValue({
                name: station.manager.name,
                email: station.manager.email,
                phone: station.manager.phone,
                address: station.manager.address,
                city: station.manager.city,
                state: station.manager.state,
                zip_code: station.manager.zip_code,
                country: station.manager.country,
            });
        } else {
            form.resetFields(); // Clear the form if adding a new manager
        }

        setIsModalVisible(true);
    };

    const handleCreateOrUpdateManager = async (values) => {
        try {
            if (selectedManager) {
                await updateManager(selectedStation.id, selectedManager.id, values);
                message.success('Manager updated successfully');
            } else {
                console.log(selectedStation)
                await createManager({ ...values, station: selectedStation.id });
                message.success('Manager created successfully');
            }
            fetchStations();
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save manager');
        }
    };

    const handleDelete = (stationId, managerId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this manager?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteManager(stationId, managerId);
                    message.success('Manager deleted successfully');
                    fetchStations();
                } catch (error) {
                    message.error('Failed to delete manager');
                }
            },
        });
    };

    const handlePasswordChange = async (values) => {
        try {
            await changeManagerPassword(selectedManager.id, values);
            message.success('Password updated successfully');
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            console.error(error); // Log the error
            message.error('Failed to update password');
        }
    };

    const changeTabPosition = (e) => {
        setTabPosition(e.target.value);
    };
    

    const renderManagerInfo = (station) => (
        <>
            <Descriptions title="Manager Info" bordered column={2}>
                {station.manager ? (
                    <>
                        <Descriptions.Item label="Name">{station.manager.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{station.manager.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{station.manager.phone}</Descriptions.Item>
                        <Descriptions.Item label="Address">{station.manager.address}</Descriptions.Item>
                        <Descriptions.Item label="City">{station.manager.city}</Descriptions.Item>
                        <Descriptions.Item label="State">{station.manager.state}</Descriptions.Item>
                        <Descriptions.Item label="Zip Code">{station.manager.zip_code}</Descriptions.Item>
                        <Descriptions.Item label="Country">{station.manager.country}</Descriptions.Item>
                    </>
                ) : (
                    <Descriptions.Item>
                        No manager attached
                    </Descriptions.Item>
                )}
            </Descriptions>
            <div style={{ marginTop: 16 }}>
                {station.manager ? (
                    <>
                        <Button type="primary" onClick={() => handleEdit(station)}>Edit</Button>
                        <Button type="danger" onClick={() => handleDelete(station.id, station.manager.id)} style={{ marginLeft: 8 }}>Delete</Button>
                        <Button type="default" onClick={() => {setSelectedManager(station.manager); setIsPasswordModalVisible(true)}} style={{ marginLeft: 8 }}>Change Password</Button>                    </>
                ) : (
                    <Button type="primary" onClick={() => handleEdit(station)}>Add Manager</Button> // Pass the station here
                )}
            </div>
        </>
    );

    return (
        <div>
            <h1>Manager Management</h1>
            <Space style={{ marginBottom: 16 }}>
                <Radio.Group value={tabPosition} onChange={changeTabPosition}>
                    <Radio.Button value="top">Top</Radio.Button>
                    <Radio.Button value="bottom">Bottom</Radio.Button>
                    <Radio.Button value="left">Left</Radio.Button>
                    <Radio.Button value="right">Right</Radio.Button>
                </Radio.Group>
            </Space>
            <Tabs tabPosition={tabPosition}>
                {stations.map(station => (
                    <Tabs.TabPane tab={station.name} key={station.id}>
                        {renderManagerInfo(station)}
                    </Tabs.TabPane>
                ))}
            </Tabs>

            <Modal
                title={selectedManager ? "Edit Manager" : "Add Manager"}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields(); // Reset fields when modal is closed
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdateManager} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input the address!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please input the city!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please input the state!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="zip_code" label="Zip Code" rules={[{ required: true, message: 'Please input the zip code!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please input the country!' }]}>
                        <Input />
                    </Form.Item>
                    {!selectedManager && (
                        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input the password!' }]}>
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {selectedManager ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Change Password"
                open={isPasswordModalVisible}
                onCancel={() => {
                    setIsPasswordModalVisible(false);
                    passwordForm.resetFields();
                }}
                footer={null}
            >
                <Form form={passwordForm} onFinish={handlePasswordChange} layout="vertical">
                    <Form.Item name="password" label="New Password" rules={[{ required: true, message: 'Please input the new password!' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="confirmPassword" label="Confirm Password" dependencies={['password']} hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm the new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Password
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManagerManagement;
