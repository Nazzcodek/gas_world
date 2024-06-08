/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Tabs, Table, Select, message } from 'antd';
import moment from 'moment';
import {
    getStations,
    getPumpsByStation,
    getShiftsByStation,
    getPitShiftsByStation,
    getSalesByStation,
    getShiftByPump,
    getPitShiftByPump,
    getSalesByPump
} from '../../../Routes';

const { Option } = Select;

const SalesReport = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedPump, setSelectedPump] = useState('all');
    const [pumps, setPumps] = useState([]);
    const [pumpReadings, setPumpReadings] = useState([]);
    const [pitReadings, setPitReadings] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStations();
    }, []);

    useEffect(() => {
        if (selectedStation) {
            fetchPumps(selectedStation.id);
            fetchData(selectedStation.id, selectedPump);
        }
    }, [selectedStation]);

    useEffect(() => {
        if (selectedStation) {
            fetchData(selectedStation.id, selectedPump);
        }
    }, [selectedPump]);

    const fetchStations = async () => {
        try {
            const data = await getStations();
            setStations(data);
            if (data.length > 0) {
                setSelectedStation(data[0]);
            }
        } catch (error) {
            message.error('Failed to fetch stations');
        }
    };

    const fetchPumps = async (stationId) => {
        setLoading(true);
        try {
            const pumpData = await getPumpsByStation(stationId);
            setPumps(pumpData);
        } catch (error) {
            message.error('Failed to fetch pumps');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (stationId, pumpId) => {
        setLoading(true);
        try {
            let pumpData, pitData, salesData;

            if (pumpId === 'all') {
                [pumpData, pitData, salesData] = await Promise.all([
                    getShiftsByStation(stationId),
                    getPitShiftsByStation(stationId),
                    getSalesByStation(stationId)
                ]);
            } else {
                [pumpData, pitData, salesData] = await Promise.all([
                    getShiftByPump(pumpId),
                    getPitShiftByPump(pumpId),
                    getSalesByPump(pumpId)
                ]);
            }

            setPumpReadings(Array.isArray(pumpData) ? pumpData : []);
            setPitReadings(Array.isArray(pitData) ? pitData : []);
            setSales(Array.isArray(salesData) ? salesData : []);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleStationChange = (stationId) => {
        const selected = stations.find(station => station.id === stationId);
        setSelectedStation(selected);
        setSelectedPump('all');
    };

    const handlePumpFilterChange = (pumpId) => {
        setSelectedPump(pumpId);
    };

    const renderPumpReadings = () => (
        <Table
            dataSource={pumpReadings}
            columns={[
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
            dataSource={pitReadings}
            columns={[
                { title: 'Pit', dataIndex: 'pit_name', key: 'pit' },
                { title: 'Supply', dataIndex: 'supply', key: 'supply' },
                { title: 'Opening Stock', dataIndex: 'opening_stock', key: 'opening_stock' },
                { title: 'Closing Stock', dataIndex: 'closing_stock', key: 'closing_stock' },
                { title: 'Actual Closing Stock', dataIndex: 'actual_closing_stock', key: 'actual_closing_stock' },
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
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: '100vw' }}
        />
    );

    const renderSales = () => (
        <Table
            dataSource={sales}
            columns={[
                { title: 'Attendant', dataIndex: "attendant_name", key: 'attendant' },
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
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: '100vw' }}
        />
    );

    const stationTabs = stations.map(station => ({
        label: station.name,
        key: station.id,
        children: (
            <div>
                <Select
                    defaultValue="all"
                    style={{ width: 200, marginBottom: 16 }}
                    onChange={handlePumpFilterChange}
                    value={selectedPump}
                >
                    <Option value="all">All Pumps</Option>
                    {pumps.map(pump => (
                        <Option key={pump.id} value={pump.id}>{pump.name}</Option>
                    ))}
                </Select>
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
            </div>
        ),
    }));

    return (
        <div>
            <h1>Sales Report</h1>
            <Tabs 
                tabPosition="left" 
                defaultActiveKey={stations.length > 0 ? stations[0].id.toString() : null} 
                onChange={handleStationChange}
                items={stationTabs}
            />
        </div>
    );
};

export default SalesReport;
