import React, { useEffect, useState } from 'react';
import { Table, Card } from 'antd';
import { chamCongService } from '../../services/chamCongService';

const columns = [
  { title: 'Nhân viên', dataIndex: 'nhan_vien', key: 'nhan_vien', render: nv => nv?.ten || nv?.ma_nhan_vien || '-' },
  { title: 'Ngày', dataIndex: 'ngay', key: 'ngay' },
  { title: 'Giờ vào', dataIndex: 'gio_vao', key: 'gio_vao' },
  { title: 'Giờ ra', dataIndex: 'gio_ra', key: 'gio_ra' },
  { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai' }
];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    chamCongService.getDashboard({})
      .then(res => {
        console.log('Dashboard API raw:', res);
        setData(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card title="Dashboard chấm công" style={{ margin: '32px auto', maxWidth: 900 }}>
      <Table columns={columns} dataSource={Array.isArray(data) ? data : []} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default Dashboard; 