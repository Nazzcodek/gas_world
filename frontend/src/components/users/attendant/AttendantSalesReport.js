/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Tabs, Typography } from 'antd';
import { useAuth } from '../../../AuthContext';
import { getSalesByAttendant, updateShiftSales } from '../../../Routes';
import moment from 'moment';
import { evaluate } from 'mathjs';

const { TabPane } = Tabs;
const { Title } = Typography;

const AttendantSalesReport = () => {
  const { userId } = useAuth();
  const [sales, setSales] = useState([]);
  const [latestSale, setLatestSale] = useState(null);
  const [editableFields, setEditableFields] = useState({});

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const data = await getSalesByAttendant(userId);
      const latest = data.find(sale => sale.is_active);
      setLatestSale(latest);
      setSales(data);
    } catch (error) {
      message.error('Failed to fetch sales');
    }
  };

  const handleFieldChange = (id, field, value) => {
    setEditableFields({
      ...editableFields,
      [id]: {
        ...editableFields[id],
        [field]: value,
      },
    });
  };

  const handleSave = async (id) => {
    try {
      const updatedSale = editableFields[id];
      if (updatedSale) {
        for (const field in updatedSale) {
          updatedSale[field] = evaluateExpression(updatedSale[field]);
        }
        await updateShiftSales(id, updatedSale);
        message.success('Sales updated successfully');
        fetchSales();
      }
    } catch (error) {
      message.error('Failed to update sales');
    }
  };

  const evaluateExpression = (expression) => {
    try {
      return evaluate(expression);
    } catch {
      return expression;
    }
  };

  const columns = (isOngoing) => [
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => moment(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Cash',
      dataIndex: 'cash',
      key: 'cash',
      render: (text, record) => (
        isOngoing ? (
          <Input
            defaultValue={text}
            onChange={(e) => handleFieldChange(record.id, 'cash', e.target.value)}
          />
        ) : (
          text
        )
      ),
    },
    {
      title: 'Transfer',
      dataIndex: 'transfer',
      key: 'transfer',
      render: (text, record) => (
        isOngoing ? (
          <Input
            defaultValue={text}
            onChange={(e) => handleFieldChange(record.id, 'transfer', e.target.value)}
          />
        ) : (
          text
        )
      ),
    },
    {
      title: 'POS',
      dataIndex: 'pos',
      key: 'pos',
      render: (text, record) => (
        isOngoing ? (
          <Input
            defaultValue={text}
            onChange={(e) => handleFieldChange(record.id, 'pos', e.target.value)}
          />
        ) : (
          text
        )
      ),
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (text, record) => (
        isOngoing ? (
          <Input
            defaultValue={text}
            onChange={(e) => handleFieldChange(record.id, 'expenses', e.target.value)}
          />
        ) : (
          text
        )
      ),
    },
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
    ...(isOngoing ? [{
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleSave(record.id)}>Save</Button>
      ),
    }] : []),
  ];

  return (
    <div>
      <Title level={3}>Attendant Sales Report</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Ongoing Sale" key="1">
          {latestSale ? (
            <Table
              dataSource={[latestSale]}
              columns={columns(true)}
              rowKey="id"
              pagination={false}
            />
          ) : (
            <p>No ongoing sale available</p>
          )}
        </TabPane>
        <TabPane tab="All Sales" key="2">
          <Table
            dataSource={sales}
            columns={columns(false)}
            rowKey="id"
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AttendantSalesReport;
