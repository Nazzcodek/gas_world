import React, { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, InputNumber, message, Select, Descriptions } from 'antd';
import moment from 'moment';
import {
    getStations,
    createPit,
    updatePit,
    deletePit,
    getPitsByStation,
    getProductByStation
} from '../../../Routes';

const PitManagement = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [pits, setPits] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedPit, setSelectedPit] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        if (stations.length > 0) {
            handleStationSelect(stations[0].id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stations]);

    const fetchStations = async () => {
        try {
            const data = await getStations();
            setStations(data);
        } catch (error) {
            message.error('Failed to fetch stations');
        }
    };

    const fetchPits = async (stationId) => {
        try {
            const data = await getPitsByStation(stationId);
            setPits(data);
        } catch (error) {
            message.error('Failed to fetch pits');
        }
    };

    const fetchProducts = async (stationId) => {
        try {
            const data = await getProductByStation(stationId);
            setProducts(data);
        } catch (error) {
            message.error('Failed to fetch products');
        }
    };

    const handleStationSelect = (stationId) => {
        const selected = stations.find(station => station.id === stationId);
        setSelectedStation(selected);
        fetchPits(stationId);
        fetchProducts(stationId);
    };

    const handleEdit = (pit) => {
        setSelectedPit(pit);
        form.setFieldsValue({
            current_volume: pit.current_volume,
            max_volume: pit.max_volume,
            pit_product: pit.product_name,
        });
        setIsModalVisible(true);
    };

    const handleCreateOrUpdatePit = async (values) => {
        const selectedProduct = products.find(product => product.name === values.pit_product);

        if (!selectedProduct) {
            message.error('Selected product not found');
            return;
        }

        const productId = selectedProduct.id;
        const payload = {
            ...values,
            current_volume: parseFloat(values.current_volume),
            max_volume: parseFloat(values.max_volume),
            pit_product: productId,
            station: selectedStation.id
        };

        try {
            if (selectedPit) {
                await updatePit(selectedPit.id, payload);
                message.success('Pit updated successfully');
            } else {
                await createPit(payload);
                message.success('Pit created successfully');
            }
            fetchPits(selectedStation.id);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save pit');
        }
    };

    const handleDelete = (pitId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this Pit?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deletePit(pitId);
                    message.success('Pit deleted successfully');
                    fetchPits(selectedStation.id);
                } catch (error) {
                    message.error('Failed to delete pit');
                }
            },
        });
    };

    const renderPitInfo = (pit) => (
        <Descriptions style={{ marginBottom: 16 }} title="Pit Info" bordered column={2}>
            <Descriptions.Item label="Name">{pit.name}</Descriptions.Item>
            <Descriptions.Item label="Current Volume">{pit.current_volume}</Descriptions.Item>
            <Descriptions.Item label="Max Volume">{pit.max_volume}</Descriptions.Item>
            <Descriptions.Item label="Product">{pit.product_name}</Descriptions.Item>
            <Descriptions.Item label="Created At">{moment(pit.created_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
        </Descriptions>
    );

    const stationTabs = stations.map(station => ({
        label: station.name,
        key: station.id,
        children: (
            <div>
                <div style={{ marginBottom: 16 }}>
                    <Button type="primary" onClick={() => {
                        setSelectedPit(null);
                        setIsModalVisible(true);
                    }}>
                        Add Pit
                    </Button>
                </div>
                <Tabs tabPosition="top" items={pits.map(pit => ({
                    label: pit.product_name,
                    key: pit.id,
                    children: (
                        <div>
                            {renderPitInfo(pit)}
                            <Button type="primary" onClick={() => handleEdit(pit)}>Edit</Button>
                            <Button type="danger" onClick={() => handleDelete(pit.id)} style={{ marginLeft: 8 }}>Delete</Button>
                        </div>
                    ),
                }))} />
            </div>
        ),
    }));

    return (
        <div>
            <h1>Pit Management</h1>
            <Tabs 
                tabPosition="left" 
                defaultActiveKey={stations.length > 0 ? stations[0].id.toString() : null} 
                onChange={handleStationSelect}
                items={stationTabs}
            />

            <Modal
                title={selectedPit ? "Edit Pit" : "Add Pit"}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdatePit} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="current_volume" label="Current Volume" rules={[{ required: true, message: 'Please input the current volume!' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="max_volume" label="Max Volume" rules={[{ required: true, message: 'Please input the max volume!' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="pit_product" label="Product" rules={[{ required: true, message: 'Please select a product!' }]}>
                        <Select>
                            {products.map(product => (
                                <Select.Option key={product.id} value={product.name}>{product.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {selectedPit ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PitManagement;
