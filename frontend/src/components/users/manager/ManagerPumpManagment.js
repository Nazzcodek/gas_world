/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, InputNumber, message, Select, Descriptions, Table } from 'antd';
import { useAuth } from '../../../AuthContext';
import {
    getProductByStation,
    getPumpByProduct,
    createShift,
    updateShift,
    getShiftByPump,
    createPump,
    updatePump,
    deletePump,
    getPitsByStation,
    getAttendantsByStation,
} from '../../../Routes';
import moment from 'moment';

const { Option } = Select;
const { useForm } = Form; // Ensure useForm is imported here

const ManagerPumpManagement = () => {
    const { stationId } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [pumps, setPumps] = useState([]);
    const [pits, setPits] = useState([]);
    const [selectedPump, setSelectedPump] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [attendants, setAttendants] = useState([]);
    const [isPumpModalVisible, setIsPumpModalVisible] = useState(false);
    const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [shiftForm] = useForm(); // Use useForm here
    const [editingShift, setEditingShift] = useState(null);

    useEffect(() => {
        if (stationId) {
            fetchProductsForStation(stationId);
            fetchAttendantsForStation(stationId);
            fetchPits(stationId);
        }
    }, [stationId]);

    useEffect(() => {
        if (products.length > 0 && !selectedProduct) {
            setSelectedProduct(products[0]);
        }
    }, [products]);

    useEffect(() => {
        if (selectedProduct) {
            fetchPumpsForProduct(selectedProduct.id);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (pumps.length > 0 && !selectedPump) {
            setSelectedPump(pumps[0]);
        }
    }, [pumps]);

    useEffect(() => {
        if (selectedPump) {
            fetchShiftsForPump(selectedPump.id);
        }
    }, [selectedPump]);

    const fetchProductsForStation = async (stationId) => {
        try {
            const products = await getProductByStation(stationId);
            setProducts(Array.isArray(products) ? products : []);
        } catch (error) {
            message.error('Failed to fetch products for station');
        }
    };

    const fetchPumpsForProduct = async (productId) => {
        try {
            const pumps = await getPumpByProduct(productId);
            setPumps(Array.isArray(pumps) ? pumps : []);
        } catch (error) {
            message.error('Failed to fetch pumps for product');
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

    const fetchShiftsForPump = async (pumpId) => {
        try {
            const shifts = await getShiftByPump(pumpId);
            setShifts(Array.isArray(shifts) ? shifts : []);
        } catch (error) {
            message.error('Failed to fetch shifts for pump');
        }
    };

    const fetchAttendantsForStation = async (stationId) => {
        try {
            const attendants = await getAttendantsByStation(stationId);
            setAttendants(Array.isArray(attendants) ? attendants : []);
        } catch (error) {
            message.error('Failed to fetch attendants for station');
        }
    };

    const handleEditPump = (pump) => {
        setSelectedPump(pump);
        form.setFieldsValue({
            name: pump.name,
            initial_meter: pump.initial_meter,
            product_type: pump.product_type,
            pump_pit: pump.pump_pit,
        });
        setIsPumpModalVisible(true);
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
            station: stationId
        };

        try {
            if (selectedPump) {
                await updatePump(selectedPump.id, payload);
                message.success('Pump updated successfully');
            } else {
                await createPump(payload);
                message.success('Pump created successfully');
            }
            fetchPumpsForProduct(selectedProduct.id);
            setIsPumpModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save pump');
        }
    };

    const handleDeletePump = (pumpId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this pump?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deletePump(pumpId);
                    message.success('Pump deleted successfully');
                    setPumps(pumps.filter(pump => pump.id !== pumpId));
                } catch (error) {
                    message.error('Failed to delete pump');
                }
            },
        });
    };

    const handleCreateShift = (pump) => {
        setSelectedPump(pump);
        setEditingShift(null);
        shiftForm.resetFields();
        setIsShiftModalVisible(true);
    };

    const handleEditShift = (shift) => {
        setEditingShift(shift);
        shiftForm.setFieldsValue({
            attendant: shift.attendant.id,
            closing_meter: shift.closing_meter,
            rate: shift.rate,
        });
        setIsShiftModalVisible(true);
    };

    const handleCreateOrUpdateShift = async (values) => {
        try {
            const payload = {
                ...values,
                pump: selectedPump.id,
            };
            if (editingShift) {
                await updateShift(editingShift.id, payload);
                message.success('Shift updated successfully');
            } else {
                await createShift(selectedPump.id, payload);
                message.success('Shift created successfully');
            }
            fetchShiftsForPump(selectedPump.id);
            setIsShiftModalVisible(false);
            shiftForm.resetFields();
        } catch (error) {
            message.error('Failed to save shift');
        }
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

    const renderShifts = () => {
        const hasPendingShifts = shifts.some(shift => shift.status === 'PENDING');

        const columns = [
            { title: 'Attendant', dataIndex: 'attendant_name', key: 'attendant' },
            { title: 'Opening Meter', dataIndex: 'opening_meter', key: 'opening_meter' },
            { title: 'Closing Meter', dataIndex: 'closing_meter', key: 'closing_meter' },
            { title: 'Rate', dataIndex: 'rate', key: 'rate' },
            { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
                let color = status === 'PENDING' ? 'red' : status === 'COMPLETED' ? 'green' : 'orange';
                return <span style={{ color }}>{status}</span>;
            }},
            { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss') },
        ];

        if (hasPendingShifts) {
            columns.push({
                title: 'Action', key: 'action', render: (_, record) => (
                    record.status === 'PENDING' ? (
                        <Button type="link" onClick={() => handleEditShift(record)}>Edit</Button>
                    ) : null
                ),
            });
        }

        return (
            <Table
                dataSource={shifts.slice(0, 10).sort((a, b) => moment(b.timestamp).diff(moment(a.timestamp)))}
                columns={columns}
                rowKey="id"
                pagination={false}
            />
        );
    };

    const handleProductChange = (productId) => {
        const selected = products.find(product => product.id === productId);
        setSelectedProduct(selected);
        setSelectedPump(null);
    };

    const handlePumpSelect = (pumpId) => {
        const selected = pumps.find(pump => pump.id === pumpId);
        setSelectedPump(selected);
    };

    const productTabs = products.map(product => ({
        label: product.name,
        key: product.id,
        children: (
            <div>
                <div style={{ marginBottom: 16 }}>
                    <Button type="primary" onClick={() => {
                        setSelectedPump(null);
                        setIsPumpModalVisible(true);
                    }}>
                        Add Pump
                    </Button>
                </div>
                <Tabs
                    tabPosition="top"
                    onChange={handlePumpSelect}
                    activeKey={selectedPump ? selectedPump.id.toString() : null}
                    items={pumps.map(pump => ({
                        label: pump.name,
                        key: pump.id,
                        children: (
                            <div>
                                {renderPumpInfo(pump)}
                                <Button type="primary" onClick={() => handleEditPump(pump)}>Edit</Button>
                                <Button type="danger" onClick={() => handleDeletePump(pump.id)} style={{ marginLeft: 8 }}>Delete</Button>
                                <Button onClick={() => handleCreateShift(pump)} type="link">Create Shift</Button>
                            </div>
                        ),
                    }))}
                />
            </div>
        ),
    }));

    return (
        <div>
            <h1>Pump Management</h1>
            <Tabs
                tabPosition="left"
                defaultActiveKey={products.length > 0 ? products[0].id.toString() : null}
                onChange={handleProductChange}
                items={productTabs}
            />
            {selectedPump && (
                <div style={{ marginTop: 24 }}>
                    <h2>Shifts for {selectedPump.name}</h2>
                    {renderShifts()}
                </div>
            )}

            <Modal
                title={selectedPump ? "Edit Pump" : "Add Pump"}
                open={isPumpModalVisible}
                onCancel={() => {
                    setIsPumpModalVisible(false);
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
            <Modal
                title={editingShift ? "Edit Shift" : "Create Shift"}
                open={isShiftModalVisible}
                onCancel={() => setIsShiftModalVisible(false)}
                footer={null}
            >
                <Form form={shiftForm} onFinish={handleCreateOrUpdateShift} layout="vertical">
                    <Form.Item name="attendant" label="Attendant" rules={[{ required: true, message: 'Please select an attendant!' }]}>
                        <Select placeholder="Select an attendant">
                            {attendants.map(attendant => (
                                <Option key={attendant.id} value={attendant.id}>{attendant.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="rate" label="Rate">
                        <InputNumber placeholder={'Enter rate (optional)'} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingShift ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManagerPumpManagement;
