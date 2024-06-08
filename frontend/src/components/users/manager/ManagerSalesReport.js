import React, { useState, useEffect } from 'react';
import { Tabs, Table, message, InputNumber, Button, Switch } from 'antd';
import moment from 'moment';
import { useAuth } from '../../../AuthContext';
import {
    getPumpsByStation,
    getShiftByPump,
    getPitShiftByPump,
    getSalesByPump,
    updatePitShift,
    updateShiftSales
} from '../../../Routes';

const ManagerSalesReport = () => {
    const { stationId } = useAuth();
    const [pumps, setPumps] = useState([]);
    const [selectedPump, setSelectedPump] = useState(null);
    const [pumpReadings, setPumpReadings] = useState([]);
    const [pitReadings, setPitReadings] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPitReading, setEditingPitReading] = useState(null);

    useEffect(() => {
        if (stationId) {
            fetchPumps(stationId);
        }
    }, [stationId]);

    useEffect(() => {
        if (selectedPump) {
            fetchPumpData(selectedPump.id);
        }
    }, [selectedPump]);

    const fetchPumps = async (stationId) => {
        setLoading(true);
        try {
            const pumpsData = await getPumpsByStation(stationId);
            setPumps(pumpsData);
            if (pumpsData.length > 0) {
                setSelectedPump(pumpsData[0]);
            }
        } catch (error) {
            message.error('Failed to fetch pumps');
        } finally {
            setLoading(false);
        }
    };

    const fetchPumpData = async (pumpId) => {
        setLoading(true);
        try {
            const [pumpReadingsData, pitReadingsData, salesData] = await Promise.all([
                getShiftByPump(pumpId),
                getPitShiftByPump(pumpId),
                getSalesByPump(pumpId)
            ]);

            setPumpReadings(pumpReadingsData);
            setPitReadings(pitReadingsData);
            setSales(salesData);
        } catch (error) {
            message.error('Failed to fetch pump data');
        } finally {
            setLoading(false);
        }
    };

    const handlePitReadingEdit = (record) => {
        setEditingPitReading({ ...record });
    };

    const handlePitReadingSave = async () => {
        try {
            await updatePitShift(editingPitReading.id, editingPitReading);
            message.success('Pit reading updated successfully');
            setEditingPitReading(null);
            fetchPumpData(selectedPump.id);
        } catch (error) {
            message.error('Failed to update pit reading');
        }
    };

    const handleSaveActiveStatus = async (record) => {
        console.log('Before toggle:', record.is_active);
        const updatedRecord = { ...record, is_active: record.is_active };
        console.log('After toggle:', updatedRecord.is_active);
        try {
            await updateShiftSales(record.id, { is_active: updatedRecord.is_active });
            const updatedSales = sales.map(sale => sale.id === record.id ? updatedRecord : sale);
            setSales(updatedSales);
            message.success('Sales active status updated successfully');
        } catch (error) {
            message.error('Failed to update sales active status');
        }
    };

    const handlePumpChange = (pumpId) => {
        const selected = pumps.find(pump => pump.id === pumpId);
        setSelectedPump(selected);
    };

    const renderPumpReadings = () => (
        <Table
            dataSource={Array.isArray(pumpReadings) ? pumpReadings : []}
            columns={[
                { title: 'Attendant', dataIndex: 'attendant_name', key: 'attendant' },
                { title: 'Pump', dataIndex: 'pump_name', key: 'pump' },
                { title: 'Opening Meter', dataIndex: 'opening_meter', key: 'opening_meter' },
                { title: 'Closing Meter', dataIndex: 'closing_meter', key: 'closing_meter' },
                { title: 'Liters Sold', dataIndex: 'liters_sold', key: 'liters_sold' },
                { title: 'Rate', dataIndex: 'rate', key: 'rate' },
                { title: 'Amount', dataIndex: 'amount', key: 'amount' },
                { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss') },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: '100vw' }}
        />
    );

    const renderPitReadings = () => (
        <Table
            dataSource={Array.isArray(pitReadings) ? pitReadings : []}
            columns={[
                { title: 'Date', dataIndex: 'timestamp', key: 'timestamp', render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss') },
                { title: 'Pit', dataIndex: 'pit_name', key: 'pit' },
                { title: 'Supply', dataIndex: 'supply', key: 'supply' },
                { title: 'Opening Stock', dataIndex: 'opening_stock', key: 'opening_stock' },
                { title: 'Closing Stock', dataIndex: 'closing_stock', key: 'closing_stock' },
                { title: 'Actual Closing Stock', dataIndex: 'actual_closing_stock', key: 'actual_closing_stock', render: (text, record) => (
                    editingPitReading && editingPitReading.id === record.id ? 
                    <InputNumber value={editingPitReading.actual_closing_stock} onChange={(value) => setEditingPitReading({ ...editingPitReading, actual_closing_stock: value })} /> :
                    text
                ) },
                {
                    title: 'Excess or Shortage', dataIndex: 'excess_or_shortage', key: 'excess_or_shortage', render: excess_or_shortage => {
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
                    <Button onClick={handlePitReadingSave}>Save</Button> :
                    <Button onClick={() => handlePitReadingEdit(record)}>Edit</Button>
                ) },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: '100vw' }}
        />
    );

    const renderSales = () => (
        <Table
            dataSource={Array.isArray(sales) ? sales : []}
            columns={[
                { title: 'Attendant', dataIndex: 'attendant_name', key: 'attendant' },
                { title: 'Pump', dataIndex: 'pump_reading_name', key: 'pump' },
                { title: 'Cash', dataIndex: 'cash', key: 'cash' },
                { title: 'Transfer', dataIndex: 'transfer', key: 'transfer' },
                { title: 'POS', dataIndex: 'pos', key: 'pos' },
                { title: 'Expenses', dataIndex: 'expenses', key: 'expenses' },
                {
                    title: 'Shortage or Excess',
                    dataIndex: 'shortage_or_excess',
                    key: 'shortage_or_excess',
                    render: (text) => {
                      const value = Math.abs(text);
                      const color = text < 0 ? 'red' : 'green';
                      return <span style={{ color }}>{value.toFixed(2)}</span>;
                    },
                },
                { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss') },
                { 
                    title: 'Is Active', 
                    dataIndex: 'is_active', 
                    key: 'is_active', 
                    render: (text, record) => (
                        <Switch 
                            checked={record.is_active} 
                            onChange={checked => setSales(sales.map(sale => sale.id === record.id ? { ...sale, is_active: checked } : sale))}
                        />
                    ) 
                },
                { 
                    title: 'Actions', 
                    key: 'actions', 
                    render: (text, record) => (
                        <Button onClick={() => handleSaveActiveStatus(record)}>Save</Button>
                    ) 
                },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: '100vw' }}
        />
    );

    const pumpTabs = pumps.map(pump => ({
        label: pump.name,
        key: pump.id.toString(),
        children: (
            <Tabs defaultActiveKey="pumpReadings" tabPosition="top">
                <Tabs.TabPane tab="Pump Readings" key="pumpReadings">
                    {renderPumpReadings()}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Pit Readings" key="pitReadings">
                    {renderPitReadings()}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Sales" key="sales">
                    {renderSales()}
                </Tabs.TabPane>
            </Tabs>
        )
    }));

    return (
        <div>
            <h1>Sales Report</h1>
            <Tabs 
                tabPosition="left" 
                defaultActiveKey={pumps.length > 0 ? pumps[0].id.toString() : null} 
                onChange={handlePumpChange}
                items={pumpTabs}
            />
        </div>
    );
};

export default ManagerSalesReport;
