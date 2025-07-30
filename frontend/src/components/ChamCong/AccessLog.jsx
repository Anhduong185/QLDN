import React, { useEffect, useState } from 'react';
import { Table, Card } from 'antd';
import { chamCongService } from '../../services/chamCongService';

const columns = [
  { title: 'Nhân viên', dataIndex: 'nhan_vien', key: 'nhan_vien', render: nv => nv?.ten || nv?.ma_nhan_vien || '-' },
  { title: 'Thời gian', dataIndex: 'thoi_gian', key: 'thoi_gian' },
  { title: 'Loại', dataIndex: 'loai_su_kien', key: 'loai_su_kien' },
  { title: 'Vị trí', dataIndex: 'vi_tri', key: 'vi_tri' }
];

const AccessLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    chamCongService.getAccessLogs({})
      .then(res => {
        console.log('AccessLog API raw:', res);
        setLogs(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card title="Lịch sử ra/vào" style={{ margin: '32px auto', maxWidth: 800 }}>
      <Table columns={columns} dataSource={Array.isArray(logs) ? logs : []} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default AccessLog; 