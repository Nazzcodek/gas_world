import React, { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, InputNumber, message, Select, Descriptions } from 'antd';
import moment from 'moment';
import {
    getStations,
    createPump,
    updatePump,
    deletePump,
    getPumpsByStation,
    getProductByStation,
    getPitsByStation
} from '../../../Routes';

const PumpManagement = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [pumps, setPumps] = useState([]);
    const [products, setProducts] = useState([]);
    const [pits, setPits] = useState([]);
    const [selectedPump, setSelectedPump] = useState(null);
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
            setProducts(data);
        } catch (error) {
            message.error('Failed to fetch products');
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

    const handleStationSelect = (stationId) => {
        const selected = stations.find(station => station.id === stationId);
        setSelectedStation(selected);
        fetchPumps(stationId);
        fetchProducts(stationId);
        fetchPits(stationId);
    };

    const handleEdit = (pump) => {
        setSelectedPump(pump);
        form.setFieldsValue({
            name: pump.name,
            initial_meter: pump.initial_meter,
            product_type: pump.product_type,
            pump_pit: pump.pump_pit,
        });
        setIsModalVisible(true);
    };

    const handleCreateOrUpdatePump = async (values) => {
        const selectedProduct = products.find(product => product.id === values.product_type);
        const selectedPit = pits.find(pit => pit.id === values.pump_pit);

        if (!selectedProduct) {
            message.error('Selected product not found');
            return;
        }

        if (!selectedPit) {
            message.error('Selected pit not found');
            return;
        }

        const productId = selectedProduct.id;
        const pitId = selectedPit.id;
        const payload = { 
            ...values, 
            initial_meter: parseFloat(values.initial_meter), 
            product_type: productId, 
            pump_pit: pitId,
            station: selectedStation.id 
        };

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
        <Descriptions style={{ marginBottom: 16 }} title="Pump Info" bordered column={2}>
            <Descriptions.Item label="Name">{pump.name}</Descriptions.Item>
            <Descriptions.Item label="Initial Meter">{pump.initial_meter}</Descriptions.Item>
            <Descriptions.Item label="Product">{pump.product_name}</Descriptions.Item>
            <Descriptions.Item label="Pit">{pump.pit_name}</Descriptions.Item>
            <Descriptions.Item label="Created At">{moment(pump.created_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
        </Descriptions>
    );

    const stationTabs = stations.map(station => ({
        label: station.name,
        key: station.id,
        children: (
            <div>
                <div style={{ marginBottom: 16 }}>
                    <Button type="primary" onClick={() => {
                        setSelectedPump(null);
                        setIsModalVisible(true);
                    }}>
                        Add Pump
                    </Button>
                </div>
                <Tabs tabPosition="top" items={pumps.map(pump => ({
                    label: pump.name,
                    key: pump.id,
                    children: (
                        <div>
                            {renderPumpInfo(pump)}
                            <Button type="primary" onClick={() => handleEdit(pump)}>Edit</Button>
                            <Button type="danger" onClick={() => handleDelete(pump.id)} style={{ marginLeft: 8 }}>Delete</Button>
                        </div>
                    ),
                }))} />
            </div>
        ),
    }));

    return (
        <div>
            <h1>Pump Management</h1>
            <Tabs 
                tabPosition="left" 
                defaultActiveKey={stations.length > 0 ? stations[0].id.toString() : null} 
                onChange={handleStationSelect}
                items={stationTabs}
            />

            <Modal
                title={selectedPump ? "Edit Pump" : "Add Pump"}
                open={isModalVisible}
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
                                <Select.Option key={product.id} value={product.id}>{product.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="pump_pit" label="Pit" rules={[{ required: true, message: 'Please select a pit!' }]}>
                        <Select>
                            {pits.map(pit => (
                                <Select.Option key={pit.id} value={pit.id}>{pit.name}</Select.Option>
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
