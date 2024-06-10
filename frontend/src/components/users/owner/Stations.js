/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Descriptions, Divider } from 'antd';
import { getStations, getStationById, createStation, updateStation, deleteStation } from '../../../Routes';

const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [form] = Form.useForm();

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

    const handleCreateOrUpdate = async (values) => {
        try {
            if (selectedStation) {
                const updatedStation = await updateStation(selectedStation.id, values);
                setStations((prevStations) => 
                    prevStations.map(station => 
                        station.id === updatedStation.id ? updatedStation : station
                    )
                );
                message.success('Station updated successfully');
            } else {
                const newStation = await createStation(values);
                setStations((prevStations) => [...prevStations, newStation]);
                message.success('Station created successfully');
            }
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save station');
        }
    };
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this station?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteStation(id);
                    setStations((prevStations) => prevStations.filter(station => station.id !== id));
                    message.success('Station deleted successfully');
                } catch (error) {
                    message.error('Failed to delete station');
                }
            },
        });
    };

    const handleEdit = (station) => {
        setSelectedStation(station);
        form.setFieldsValue(station);
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedStation(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleRowClick = async (record) => {
        try {
            const data = await getStationById(record.id);
            console.log('Fetched station details:', data); // Add this line
            setSelectedStation(data);
            setIsDetailVisible(true);
        } catch (error) {
            message.error('Failed to fetch station details');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <a onClick={() => handleRowClick(record)}>{text}</a>,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <span>
                    <Button onClick={() => handleEdit(record)} type="link">Edit</Button>
                    <Button onClick={() => handleDelete(record.id)} type="link" danger>Delete</Button>
                </span>
            ),
        },
    ];

    return (
        <div>
            <h1>Station Management</h1>
            <Button
                type="primary"
                onClick={handleAdd}
                style={{ marginBottom: "10px", float: "right"}}
            >
                    Add Station
            </Button>
            <Table columns={columns} dataSource={stations} rowKey="id" />
            
            <Modal
                title={selectedStation ? "Edit Station" : "Add Station"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdate} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input the address!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="city" label="City" rules={[{ required: false, message: 'Please input the city!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please input the state!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="zip_code" label="Zip Code" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please input the country!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {selectedStation ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Station Details"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={null}
                width={800}
            >
                {selectedStation && (
                    <>
                        <Descriptions title="Basic Information" bordered column={2}>
                            <Descriptions.Item label="Name">{selectedStation.name}</Descriptions.Item>
                            <Descriptions.Item label="Address">{selectedStation.address}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{selectedStation.phone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedStation.email}</Descriptions.Item>
                            <Descriptions.Item label="City">{selectedStation.city}</Descriptions.Item>
                            <Descriptions.Item label="State">{selectedStation.state}</Descriptions.Item>
                            <Descriptions.Item label="Zip Code">{selectedStation.zip_code}</Descriptions.Item>
                            <Descriptions.Item label="Country">{selectedStation.country}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Manager" bordered>
                            <Descriptions.Item label="Name">
                                {selectedStation.manager ? selectedStation.manager.name : "No manager attached"}
                            </Descriptions.Item>
                            <Descriptions.Item>
                                <Button type="primary">
                                    {selectedStation.manager ? "Edit Manager" : "Add Manager"}
                                </Button>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Attendants" bordered>
                            {selectedStation.attendants && selectedStation.attendants.length > 0 ? (
                                selectedStation.attendants.map(attendant => (
                                    <Descriptions.Item label="Name" key={attendant.id}>
                                        {attendant.name}
                                    </Descriptions.Item>
                                ))
                            ) : (
                                <Descriptions.Item>No attendants attached</Descriptions.Item>
                            )}
                            <Descriptions.Item>
                                <Button type="primary">Add Attendant</Button>
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default StationManagement;
