import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message } from 'antd';
import { nghiPhepService } from '../../services/nghiPhepService';

const DonNghiPhepList = ({ reload }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadList = () => {
    setLoading(true);
    nghiPhepService.getList({})
      .then(res => {
        console.log('DonNghiPhepList API raw:', res);
        setList(res.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line
  }, [reload]);

  const handleApprove = async (id) => {
    try {
      await nghiPhepService.approve(id);
      message.success('Đã duyệt đơn!');
      loadList();
    } catch (err) {
      message.error('Duyệt đơn thất bại!');
    }
  };

  const columns = [
    { title: 'Nhân viên', dataIndex: 'nhan_vien', key: 'nhan_vien', render: nv => nv?.ten || nv?.ma_nhan_vien || '-' },
    { title: 'Ngày nghỉ', dataIndex: 'ngay_nghi', key: 'ngay_nghi' },
    { title: 'Loại', dataIndex: 'loai_nghi', key: 'loai_nghi' },
    { title: 'Lý do', dataIndex: 'ly_do', key: 'ly_do' },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text, record) =>
        record.trang_thai === 'cho_duyet' ? (
          <Button type="primary" onClick={() => handleApprove(record.id)}>Duyệt</Button>
        ) : null
    }
  ];

  return (
    <Card title="Danh sách đơn nghỉ phép" style={{ margin: '32px auto', maxWidth: 800 }}>
      <Table columns={columns} dataSource={Array.isArray(list) ? list : []} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default DonNghiPhepList; 