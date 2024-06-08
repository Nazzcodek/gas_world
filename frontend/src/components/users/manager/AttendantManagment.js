import React, { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, message, Descriptions, Table, Card, Row, Col } from 'antd';
import { useAuth } from '../../../AuthContext';
import {
    getAttendantsByStation,
    getShiftsByAttendant,
    createAttendant,
    updateAttendant,
    deleteAttendant
} from '../../../Routes';


const AttendantManagement = () => {
    const { stationId } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [attendants, setAttendants] = useState([]);
    const [selectedAttendant, setSelectedAttendant] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (stationId) {
            fetchAttendantsForStation(stationId);
        }
    }, [stationId]);

    useEffect(() => {
        if (selectedAttendant) {
            fetchShiftsForAttendant(selectedAttendant.id);
        }
    }, [selectedAttendant]);

    const fetchAttendantsForStation = async (stationId) => {
        try {
            const attendants = await getAttendantsByStation(stationId);
            setAttendants(Array.isArray(attendants) ? attendants : []);
            if (attendants.length > 0) {
                setSelectedAttendant(attendants[0]);
            }
        } catch (error) {
            message.error('Failed to fetch attendants for station');
        }
    };

    const fetchShiftsForAttendant = async (attendantId) => {
        try {
            const shifts = await getShiftsByAttendant(attendantId);
            setShifts(Array.isArray(shifts) ? shifts : []);
        } catch (error) {
            message.error("Failed to fetch attendant shifts");
        }
    };

    const handleCreateOrUpdateAttendant = async (values) => {
        try {
            if (selectedAttendant) {
                await updateAttendant(stationId, selectedAttendant.id, values);
                message.success('Attendant updated successfully');
            } else {
                await createAttendant(stationId, values);
                message.success('Attendant created successfully');
            }
            fetchAttendantsForStation(stationId);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save attendant');
        }
    };

    const handleEditAttendant = (attendant) => {
        setSelectedAttendant(attendant);
        form.setFieldsValue(attendant);
        setIsModalVisible(true);
    };

    const handleDeleteAttendant = (attendantId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this attendant?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteAttendant(attendantId);
                    message.success('Attendant deleted successfully');
                    setAttendants(attendants.filter(attendant => attendant.id !== attendantId));
                    setSelectedAttendant(null);
                } catch (error) {
                    message.error('Failed to delete attendant');
                }
            },
        });
    };

    const renderAttendantInfo = (attendant) => (
        <Descriptions title="Attendant Info" bordered column={2}>
            <Descriptions.Item label="Name">{attendant.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{attendant.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{attendant.phone}</Descriptions.Item>
            <Descriptions.Item label="Address">{attendant.address}</Descriptions.Item>
            <Descriptions.Item label="City">{attendant.city}</Descriptions.Item>
            <Descriptions.Item label="State">{attendant.state}</Descriptions.Item>
            <Descriptions.Item label="Zip Code">{attendant.zip_code}</Descriptions.Item>
            <Descriptions.Item label="Country">{attendant.country}</Descriptions.Item>
        </Descriptions>
    );

    const renderShifts = () => (
        <Table
            dataSource={shifts}
            columns={[
                { title: 'Opening Meter', dataIndex: 'opening_meter', key: 'opening_meter' },
                { title: 'Closing Meter', dataIndex: 'closing_meter', key: 'closing_meter' },
                { title: 'Rate', dataIndex: 'rate', key: 'rate' },
                { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
                    let color = status === 'ACTIVE' ? 'green' : 'red';
                    return <span style={{ color }}>{status}</span>;
                }},
                { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
        />
    );

    const activeAttendants = attendants.filter(attendant => {
        const lastShift = shifts.find(shift => shift.attendant.id === attendant.id);
        return lastShift && lastShift.status === 'ACTIVE';
    });

    return (
        <div>
            <h1>Attendant Management</h1>
            <Button type="primary" onClick={() => {
                setSelectedAttendant(null);
                form.resetFields();
                setIsModalVisible(true);
            }} style={{ marginBottom: 16 }}>
                Add Attendant
            </Button>
            <Row gutter={8} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card title="Total Attendants" bordered={false}>
                        {attendants.length}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Active Attendants" bordered={false}>
                        {activeAttendants.length}
                    </Card>
                </Col>
            </Row>
            <Tabs
                tabPosition="left"
                onChange={(key) => {
                    const selected = attendants.find(attendant => attendant.id.toString() === key);
                    setSelectedAttendant(selected);
                }}
                defaultActiveKey={attendants.length > 0 ? attendants[0].id.toString() : null}
            >
                {attendants.map(attendant => (
                    <Tabs.TabPane tab={attendant.name} key={attendant.id.toString()}>
                        {selectedAttendant && (
                            <div>
                                {renderAttendantInfo(selectedAttendant)}
                                <div style={{ marginBottom: 16 }}>
                                    <Button type="primary" onClick={() => handleEditAttendant(selectedAttendant)}>Edit</Button>
                                    <Button type="danger" onClick={() => handleDeleteAttendant(selectedAttendant.id)} style={{ marginLeft: 8 }}>Delete</Button>
                                </div>
                                {renderShifts()}
                            </div>
                        )}
                    </Tabs.TabPane>
                ))}
            </Tabs>
            <Modal
                title={selectedAttendant ? "Edit Attendant" : "Add Attendant"}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdateAttendant} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input the address!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please input the city!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please input the state!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="zip_code" label="Zip Code" rules={[{ required: true, message: 'Please input the zip code!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please input the country!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    {!selectedAttendant && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input the password!' }]}>
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {selectedAttendant ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendantManagement;
