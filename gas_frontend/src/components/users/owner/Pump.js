import React, { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, InputNumber, message, Select, Descriptions } from 'antd';
import moment from 'moment'; // Import moment for date formatting
import {
    getStations,
    createPump,
    updatePump,
    deletePump,
    getPumpsByStation,
    getProductByStation
} from '../../../Routes';

const PumpManagement = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [pumps, setPumps] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedPump, setSelectedPump] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
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

    useEffect(() => {
        console.log('Products:', products); // Log products for debugging
    }, [products]);

    const fetchPumps = async (stationId) => {
        try {
            const data = await getPumpsByStation(stationId);
            setPumps(data);
        } catch (error) {
            message.error('Failed to fetch pumps');
        }
    };

    const fetchProducts = async (stationId) => {
        try {
            const data = await getProductByStation(stationId);
            console.log('Fetched products:', data); // Log fetched products
            setProducts(data);
        } catch (error) {
            message.error('Failed to fetch products');
        }
    };

    const handleStationSelect = (stationId) => {
        const selected = stations.find(station => station.id === stationId);
        console.log(selected);
        setSelectedStation(selected);
        fetchPumps(stationId);
        fetchProducts(stationId);
    };

    const handleEdit = (pump) => {
        setSelectedPump(pump);
        form.setFieldsValue({
            name: pump.name,
            initial_meter: pump.initial_meter,
            product: pump.product_type, // Using product name for display
        });
        setIsModalVisible(true);
    };

    const handleCreateOrUpdatePump = async (values) => {
        console.log('Form values:', values); // Logging form values for debugging
        console.log('Available products:', products); // Log the available products

        const selectedProduct = products.find(product => product.name === values.product_type);
        
        if (!selectedProduct) {
            message.error('Selected product not found');
            return;
        }

        const productId = selectedProduct.id; // Ensure we're sending the product ID
        const payload = { 
            ...values, 
            initial_meter: parseFloat(values.initial_meter), 
            product_type: productId, 
            station: selectedStation.id // Ensure we're sending the station ID
        };

        console.log('Payload:', payload); // Logging payload for debugging

        try {
            if (selectedPump) {
                await updatePump(selectedPump.id, payload);
                message.success('Pump updated successfully');
            } else {
                await createPump(payload);
                message.success('Pump created successfully');
            }
            fetchPumps(selectedStation.id);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Failed to save pump:', error); // Log the error for debugging
            message.error('Failed to save pump');
        }
    };

    const handleDelete = (pumpId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this Pump?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deletePump(pumpId);
                    message.success('Pump deleted successfully');
                    fetchPumps(selectedStation.id);
                } catch (error) {
                    message.error('Failed to delete pump');
                }
            },
        });
    };

    const renderPumpInfo = (pump) => (
        <Descriptions title="Pump Info" bordered>
            <Descriptions.Item label="Name">{pump.name}</Descriptions.Item>
            <Descriptions.Item label="Initial Meter">{pump.initial_meter}</Descriptions.Item>
            <Descriptions.Item label="Product">{pump.product_type.name}</Descriptions.Item>
            <Descriptions.Item label="Created At">{moment(pump.created_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            {/* <Descriptions.Item label="Updated At">{pump.updated_at}</Descriptions.Item> */}
        </Descriptions>
    );

    return (
        <div>
            <h1>Pump Management</h1>
            <Tabs tabPosition="left" onChange={handleStationSelect}>
                {stations.map(station => (
                    <Tabs.TabPane tab={station.name} key={station.id}>
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" onClick={() => {
                                setSelectedPump(null); // Clear selected pump when adding new
                                setIsModalVisible(true);
                            }}>
                                Add Pump
                            </Button>
                        </div>
                        <Tabs tabPosition="top">
                            {pumps.map(pump => (
                                <Tabs.TabPane tab={pump.name} key={pump.id}>
                                    {renderPumpInfo(pump)}
                                    <Button type="primary" onClick={() => handleEdit(pump)}>Edit</Button>
                                    <Button type="danger" onClick={() => handleDelete(pump.id)} style={{ marginLeft: 8 }}>Delete</Button>
                                </Tabs.TabPane>
                            ))}
                        </Tabs>
                    </Tabs.TabPane>
                ))}
            </Tabs>

            <Modal
                title={selectedPump ? "Edit Pump" : "Add Pump"}
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdatePump} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="initial_meter" label="Initial Meter" rules={[{ required: true, message: 'Please input the initial meter!' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="product_type" label="Product" rules={[{ required: true, message: 'Please select a product!' }]}>
                        <Select>
                            {products.map(product => (
                                <Select.Option key={product.id} value={product.name}>{product.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {selectedPump ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PumpManagement;
