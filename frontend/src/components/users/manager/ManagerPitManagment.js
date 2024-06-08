import React, { useState, useEffect } from 'react';
import {
    Tabs, Button,
    Modal, Form,
    InputNumber, message,
    Descriptions, Table,
    Input 
} from 'antd';
import { useAuth } from '../../../AuthContext';
import {
    getProductByStation,
    getPitsByProduct,
    createPit,
    updatePit,
    deletePit,
    getPitShiftByPit,
    createPitShift,
    updatePitShift
} from '../../../Routes';
import moment from 'moment';

const ManagerPitManagement = () => {
    const { stationId } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [pits, setPits] = useState([]);
    const [selectedPit, setSelectedPit] = useState(null);
    const [pitReadings, setPitReadings] = useState([]);
    const [isPitModalVisible, setIsPitModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingPit, setEditingPit] = useState(null);
    const [editingPitReading, setEditingPitReading] = useState(null);

    useEffect(() => {
        if (stationId) {
            fetchProductsForStation(stationId);
        }
    }, [stationId]);

    useEffect(() => {
        if (products.length > 0 && !selectedProduct) {
            setSelectedProduct(products[0]);
        }
    }, [products, selectedProduct]);

    useEffect(() => {
        if (selectedProduct) {
            fetchPitsForProduct(selectedProduct.id);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (pits.length > 0 && !selectedPit) {
            setSelectedPit(pits[0]);
        }
    }, [pits, selectedPit]);

    useEffect(() => {
        if (selectedPit) {
            fetchPitReadings(selectedPit.id);
        }
    }, [selectedPit]);

    const fetchProductsForStation = async (stationId) => {
        try {
            const products = await getProductByStation(stationId);
            setProducts(Array.isArray(products) ? products : []);
        } catch (error) {
            message.error('Failed to fetch products for station');
        }
    };

    const fetchPitsForProduct = async (productId) => {
        try {
            const pits = await getPitsByProduct(productId);
            setPits(Array.isArray(pits) ? pits : []);
        } catch (error) {
            message.error('Failed to fetch pits for product');
        }
    };

    const fetchPitReadings = async (pitId) => {
        try {
            const data = await getPitShiftByPit(pitId);
            setPitReadings(data);
        } catch (error) {
            message.error('Failed to fetch pit readings');
        }
    };

    const handleCreateOrUpdatePit = async (values) => {
        try {
            const pitData = {
                ...values,
                station: stationId,
                pit_product: selectedProduct.id
            };
            if (editingPit) {
                await updatePit(editingPit.id, pitData);
                message.success('Pit updated successfully');
            } else {
                await createPit(pitData);
                message.success('Pit created successfully');
            }

            fetchPitsForProduct(selectedProduct.id);
            setIsPitModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save pit');
        }
    };

    const handleDeletePit = async (pitId) => {
        try {
            await deletePit(pitId);
            message.success('Pit deleted successfully');
            setPits(pits.filter(pit => pit.id !== pitId));
        } catch (error) {
            message.error('Failed to delete pit');
        }
    };

    const handleEditPit = (pit) => {
        setEditingPit(pit);
        form.setFieldsValue({
            name: pit.name,
            max_volume: pit.max_volume
        });
        setIsPitModalVisible(true);
    };

    const handleProductChange = (productId) => {
        const selected = products.find(product => product.id === productId);
        setSelectedProduct(selected);
        setSelectedPit(null);
    };

    const handlePitChange = (pitId) => {
        const selected = pits.find(pit => pit.id === pitId);
        setSelectedPit(selected);
    };

    const handleCreatePitReading = async () => {
        try {
            await createPitShift(selectedPit.id);
            message.success('Pit reading created successfully');
            fetchPitReadings(selectedPit.id);
        } catch (error) {
            message.error('Failed to create pit reading');
        }
    };
    

    const handlePitReadingEdit = (record) => {
        setEditingPitReading({ ...record });
    };

    const handlePitReadingSave = async () => {
        try {
            await updatePitShift(editingPitReading.id, editingPitReading);
            message.success('Pit reading updated successfully');
            fetchPitReadings(selectedPit.id);
            setEditingPitReading(null);
        } catch (error) {
            message.error('Failed to update pit reading');
        }
    };

    const handleActualClosingStockChange = (value, readingId) => {
        if (editingPitReading && editingPitReading.id === readingId) {
            setEditingPitReading({ ...editingPitReading, actual_closing_stock: value });
        }
    };

    const renderPitDescription = (pit) => (
        <Descriptions title="Pit Info" bordered column={2}>
            <Descriptions.Item label="Name">{pit.name}</Descriptions.Item>
            <Descriptions.Item label="Product">{pit.product_name}</Descriptions.Item>
            <Descriptions.Item label="Current Volume">{pit.current_volume}</Descriptions.Item>
            <Descriptions.Item label="Max Volume">{pit.max_volume}</Descriptions.Item>
        </Descriptions>
    );

    const renderPitReadings = () => (
        <Table
            dataSource={pitReadings}
            columns={[
                {  
                    title: 'Date',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    render: timestamp => moment(timestamp).format('YYYY-MM-DD') 
                },
                { title: 'Opening Stock', dataIndex: 'opening_stock', key: 'opening_stock' },
                {
                    title: 'Actual Closing Stock',
                    dataIndex: 'actual_closing_stock',
                    key: 'actual_closing_stock',
                    render: (actual_closing_stock, record) => (
                        editingPitReading && editingPitReading.id === record.id ? 
                        <InputNumber
                            value={editingPitReading.actual_closing_stock}
                            onChange={value => handleActualClosingStockChange(value, record.id)}
                            style={{ width: '100%' }}
                        /> :
                        actual_closing_stock
                    ),
                },
                { title: 'Closing Stock', dataIndex: 'closing_stock', key: 'closing_stock' },
                {
                    title: 'Excess or Shortage',
                    dataIndex: 'excess_or_shortage',
                    key: 'excess_or_shortage',
                    render: excess_or_shortage => {
                        if (excess_or_shortage > 0) {
                            return <span style={{ color: 'green' }}>{excess_or_shortage}</span>;
                        } else if (excess_or_shortage < 0) {
                            return <span style={{ color: 'red' }}>{-excess_or_shortage}</span>;
                        } else {
                            return null;
                        }
                    },
                },
                { title: 'Actions', key: 'actions', render: (text, record) => (
                    editingPitReading && editingPitReading.id === record.id ? 
                    <Button onClick={() => handlePitReadingSave(record)}>Save</Button> :
                    <Button onClick={() => handlePitReadingEdit(record)}>Edit</Button>
                ) },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
        />
    );

    const pitTabs = pits.map(pit => ({
        label: pit.name,
        key: pit.id,
        children: (
            <div>
                <div style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        onClick={() => handleEditPit(pit)}
                    >
                        Edit Pit
                    </Button>
                    <Button
                        type="danger"
                        onClick={() => handleDeletePit(pit.id)}
                        style={{ marginLeft: 8 }}
                    >
                        Delete Pit
                    </Button>
                </div>
                {renderPitDescription(pit)}
                <h2>Pit Readings</h2>
                {renderPitReadings()}
                <Button
                    type="primary"
                    onClick={handleCreatePitReading}
                    style={{ marginTop: 16 }}
                >
                    Create Pit Reading
                </Button>
            </div>
        ),
    }));

    return (
        <div>
            <h1>Pit Management</h1>
            <Tabs
                tabPosition="left"
                defaultActiveKey={products.length > 0 ? products[0].id.toString() : null}
                onChange={handleProductChange}
                items={products.map(product => ({
                    label: product.name,
                    key: product.id,
                    children: (
                        <Tabs
                            defaultActiveKey={pits.length > 0 ? pits[0].id.toString() : null}
                            onChange={handlePitChange}
                            items={pitTabs}
                        />
                    ),
                }))}
            />

            <Modal
                title={editingPit ? "Edit Pit" : "Create Pit"}
                visible={isPitModalVisible}
                onCancel={() => setIsPitModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdatePit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter the pit name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="max_volume"
                        label="Max Volume"
                        rules={[{ required: true, message: 'Please enter the max volume!' }]}>
                        <InputNumber />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingPit ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManagerPitManagement;
