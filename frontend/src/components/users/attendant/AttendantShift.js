/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Tabs, Typography } from 'antd';
import { useAuth } from '../../../AuthContext';
import { getShiftsByAttendant, updateShift } from '../../../Routes';
import moment from 'moment';

const { TabPane } = Tabs;
const { Title } = Typography;

const AttendantShiftManagement = () => {
  const { userId } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [latestShift, setLatestShift] = useState(null);
  const [closingMeter, setClosingMeter] = useState(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const data = await getShiftsByAttendant(userId);
      const latest = data.find(shift => shift.status === 'PENDING' || shift.status === 'ACCEPTED');
      setLatestShift(latest);
      setShifts(data);
      if (latest) {
        setClosingMeter(latest.closing_meter);
      }
    } catch (error) {
      message.error('Failed to fetch shifts');
    }
  };

  const handleAcceptShift = async (shift) => {
    try {
      const updatedShift = { ...shift, status: 'ACCEPTED' };
      await updateShift(shift.id, updatedShift);
      message.success('Shift accepted successfully');
      fetchShifts();
    } catch (error) {
      message.error('Failed to accept shift');
    }
  };

  const handleSaveClosingMeter = async (shift) => {
    try {
      const updatedShift = { ...shift, closing_meter: closingMeter };
      await updateShift(shift.id, updatedShift);
      message.success('Closing meter updated successfully');
      fetchShifts();
    } catch (error) {
      message.error('Failed to update closing meter');
    }
  };

  const commonColumns = [
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Pump',
      dataIndex: 'pump_name',
      key: 'pump',
    },
    {
      title: 'Opening Meter',
      dataIndex: 'opening_meter',
      key: 'opening_meter',
    },
    {
      title: 'Closing Meter',
      dataIndex: 'closing_meter',
      key: 'closing_meter',
      render: (text) => text,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let backgroundColor = '';

        if (status === 'PENDING') {
          color = 'white';
          backgroundColor = '#FFCCCB'; // light red
        } else if (status === 'ACCEPTED') {
          color = 'black';
          backgroundColor = '#FFC107'; // amber
        } else if (status === 'COMPLETED') {
          color = 'white';
          backgroundColor = '#4CAF50'; // green
        }

        return (
          <span style={{ color, backgroundColor, padding: '4px 8px', borderRadius: '4px' }}>
            {status}
          </span>
        );
      },
    },
  ];

  const latestShiftColumns = [
    ...commonColumns.slice(0, 3),
    {
      title: 'Closing Meter',
      dataIndex: 'closing_meter',
      key: 'closing_meter',
      render: (text, record) => (
        record.status === 'ACCEPTED' ? (
          <InputNumber
            min={0}
            value={closingMeter}
            onChange={(value) => setClosingMeter(value)}
          />
        ) : (
          text
        )
      ),
    },
    ...commonColumns.slice(4),
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        record.status === 'PENDING' ? (
          <Button type="primary" onClick={() => handleAcceptShift(record)}>Accept</Button>
        ) : record.status === 'ACCEPTED' ? (
          <Button type="primary" onClick={() => handleSaveClosingMeter(record)}>Save</Button>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Attendant Shift Management</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Latest Shift" key="1">
          {latestShift ? (
            <Table
              dataSource={[latestShift]}
              columns={latestShiftColumns}
              rowKey="id"
              pagination={false}
              scroll={{ x: '100vw' }}
            />
          ) : (
            <p>No latest shift available</p>
          )}
        </TabPane>
        <TabPane tab="All Shifts" key="2">
          <Table
            dataSource={shifts}
            columns={commonColumns}
            rowKey="id"
            scroll={{ x: '100vw' }}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AttendantShiftManagement;
