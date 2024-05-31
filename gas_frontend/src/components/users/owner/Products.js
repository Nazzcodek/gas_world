import React, { useState, useEffect } from 'react';
import { Tabs, Radio, Space, Button, Modal, Form, Input, message } from 'antd';
import { getStations, createProduct, updateProduct, deleteProduct, getProductByStation } from '../../../Routes';

const ProductManagement = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tabPosition, setTabPosition] = useState('top');
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const data = await getStations();
            setStations(data);
            if (data.length > 0) {
                fetchProductsForStation(data[0].id);
            }
        } catch (error) {
            message.error('Failed to fetch stations');
        }
    };

    const fetchProductsForStation = async (stationId) => {
        try {
            const products = await getProductByStation(stationId);
            setStations(prevStations =>
                prevStations.map(station =>
                    station.id === stationId ? { ...station, products: Array.isArray(products) ? products : [] } : station
                )
            );
        } catch (error) {
            message.error('Failed to fetch products for station');
        }
    };

    const handleEdit = (station, product) => {
        setSelectedStation(station);
        setSelectedProduct(product);
        form.setFieldsValue({
            name: product.name,
            description: product.description,
        });
        setIsModalVisible(true);
    };

    const handleCreate = (station) => {
        setSelectedStation(station);
        setSelectedProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCreateOrUpdateProduct = async (values) => {
        try {
            if (selectedProduct) {
                await updateProduct(selectedProduct.id, values);
                message.success('Product updated successfully');
            } else {
                await createProduct({ ...values, station: selectedStation.id });
                message.success('Product created successfully');
            }
            fetchProductsForStation(selectedStation.id);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save product');
        }
    };

    const handleDelete = (productId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this product?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteProduct(productId);
                    message.success('Product deleted successfully');
                    setStations(prevStations =>
                        prevStations.map(station =>
                            station.id === selectedStation.id
                                ? { ...station, products: station.products.filter(product => product.id !== productId) }
                                : station
                        )
                    );
                } catch (error) {
                    message.error('Failed to delete product');
                }
            },
        });
    };

    const changeTabPosition = (e) => {
        setTabPosition(e.target.value);
    };

    const renderProductInfo = (station) => (
        <>
            {Array.isArray(station.products) && station.products.length > 0 ? (
                station.products.map(product => (
                    <div key={product.id} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{product.name}</h2>
                            <div>
                                <Button onClick={() => handleEdit(station, product)} type="link">Edit</Button>
                                <Button onClick={() => handleDelete(product.id)} type="link" danger>Delete</Button>
                            </div>
                        </div>
                        <p>{product.description}</p>
                    </div>
                ))
            ) : (
                <p>No products available for this station.</p>
            )}
            <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={() => handleCreate(station)}>Add Product</Button>
            </div>
        </>
    );

    return (
        <div>
            <h1>Product Management</h1>
            <Space style={{ marginBottom: 16 }}>
                <Radio.Group value={tabPosition} onChange={changeTabPosition}>
                    <Radio.Button value="top">Top</Radio.Button>
                    <Radio.Button value="bottom">Bottom</Radio.Button>
                    <Radio.Button value="left">Left</Radio.Button>
                    <Radio.Button value="right">Right</Radio.Button>
                </Radio.Group>
            </Space>
            <Tabs tabPosition={tabPosition} onChange={(key) => fetchProductsForStation(key)}>
                {stations.map(station => (
                    <Tabs.TabPane tab={station.name} key={station.id}>
                        {renderProductInfo(station)}
                    </Tabs.TabPane>
                ))}
            </Tabs>

            <Modal
                title={selectedProduct ? "Edit Product" : "Add Product"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrUpdateProduct} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the product name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input the product description!' }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {selectedProduct ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;
