import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, message, Row, Col } from 'antd';
import { useAuth } from '../../../AuthContext';
import { getProductByStation, createProduct, updateProduct, deleteProduct } from '../../../Routes';

const ProductManagement = () => {
    const { stationId } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (stationId) {
            fetchProductsForStation(stationId);
            setSelectedStation({ id: stationId });
        }
    }, [stationId]);

    const fetchProductsForStation = async (stationId) => {
        try {
            const products = await getProductByStation(stationId);
            setProducts(Array.isArray(products) ? products : []);
        } catch (error) {
            message.error('Failed to fetch products for station');
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        form.setFieldsValue({
            name: product.name,
            description: product.description,
        });
        setIsModalVisible(true);
    };

    const handleCreate = () => {
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
            console.error(error.response ? error.response.data : error.message);
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
                    setProducts(products.filter(product => product.id !== productId));
                } catch (error) {
                    message.error('Failed to delete product');
                }
            },
        });
    };

    const renderProducts = () => {
        const productChunks = [];
        for (let i = 0; i < products.length; i += 2) {
            productChunks.push(products.slice(i, i + 2));
        }
    
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {productChunks.map((chunk, index) => (
                    <Row key={index} gutter={[16, 16]} justify="center">
                        {chunk.map((product, innerIndex) => (
                            <Col key={product.id} xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <div style={{ marginBottom: innerIndex === 1 && index === 0 ? 0 : 16 }}>
                                    <Card
                                        title={product.name}
                                        extra={
                                            <div>
                                                <Button onClick={() => handleEdit(product)} type="link">Edit</Button>
                                                <Button onClick={() => handleDelete(product.id)} type="link" danger>Delete</Button>
                                            </div>
                                        }
                                        style={{ width: 400 }}
                                    >
                                        <p>{product.description}</p>
                                    </Card>
                                </div>
                            </Col>
                        ))}
                    </Row>
                ))}
            </div>
        );
        
    };
        
    return (
        <div>
            <h1>Product Management</h1>
            <Button type="primary" onClick={handleCreate} style={{ marginBottom: 16 }}>Add Product</Button>
            {renderProducts()}
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
