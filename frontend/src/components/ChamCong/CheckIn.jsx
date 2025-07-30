import React, { useState, useCallback } from 'react';
import { Card, Button, Alert, Typography, Space, Result, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { chamCongService } from '../../services/chamCongService';
import FaceRecognition from './FaceRecognition';

const { Title, Text } = Typography;

const CheckIn = () => {
  const [message, setMessage] = useState('');
  const [checkInStatus, setCheckInStatus] = useState('idle');
  const [lastCheckIn, setLastCheckIn] = useState(null);

  const handleCheckIn = useCallback(async (faceDescriptor) => {
    setCheckInStatus('processing');
    setMessage('');
    try {
      const result = await chamCongService.checkIn({ face_descriptor: Array.from(faceDescriptor) });
      if (result.success) {
        setCheckInStatus('success');
        setLastCheckIn(result.data);
        setMessage(result.message || 'Chấm công thành công!');
      } else {
        setCheckInStatus('error');
        setMessage(result.message || 'Không nhận diện được khuôn mặt');
      }
    } catch (e) {
      setCheckInStatus('error');
      let msg = e.message;
      try {
        // Nếu message bắt đầu bằng HTTP 400:, tách lấy phần JSON
        if (msg && msg.includes('HTTP 400:')) {
          const jsonPart = msg.split('HTTP 400:')[1]?.trim();
          if (jsonPart) {
            const parsed = JSON.parse(jsonPart);
            msg = parsed.message || msg;
          }
        }
        // Nếu message là JSON thuần
        else if (msg && msg.startsWith('{')) {
          const parsed = JSON.parse(msg);
          msg = parsed.message || msg;
        }
      } catch {}
      setMessage(msg || 'Lỗi hệ thống');
    }
  }, []);

  return (
    <Card
      style={{
        maxWidth: 700,
        margin: '32px auto',
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24
      }}
      bodyStyle={{ padding: 0, background: '#fff', borderRadius: 24 }}
      title={<Title level={3} style={{ margin: 0, textAlign: 'center' }}>🟢 Chấm công bằng khuôn mặt</Title>}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {checkInStatus === 'processing' && <Spin tip="Đang xác thực khuôn mặt..." />}
        {checkInStatus === 'error' && message && (
          <Result
            status="error"
            title="Chấm công thất bại"
            subTitle={message}
            style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(255,0,0,0.04)' }}
          />
        )}
        {checkInStatus !== 'error' && message && (
          <Alert
            message={message}
            type={checkInStatus === 'success' ? 'success' : 'info'}
            showIcon
          />
        )}

        {lastCheckIn && lastCheckIn.nhan_vien && (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Chấm công thành công!"
            subTitle={
              <Space direction="vertical" size={0}>
                <Text strong>👤 Nhân viên: {lastCheckIn.nhan_vien.ten}</Text>
                <Text>🆔 Mã NV: {lastCheckIn.nhan_vien.ma_nhan_vien}</Text>
                <Text>📅 Ngày: {lastCheckIn.ngay || '-'}</Text>
                <Text>🕒 Giờ vào: {lastCheckIn.gio_vao || '-'}</Text>
                <Text>🕔 Giờ ra: {lastCheckIn.gio_ra || '-'}</Text>
                <Text type="success">📊 Trạng thái: {lastCheckIn.trang_thai || '-'}</Text>
              </Space>
            }
          />
        )}

        <FaceRecognition
          onCheckIn={handleCheckIn}
          mode="checkin"
          disabled={checkInStatus === 'processing'}
        />

        <Card
          size="small"
          style={{ background: '#f4f8fb', borderRadius: 10, textAlign: 'center' }}
          bodyStyle={{ padding: 12 }}
        >
          <Text strong>🕐 Thời gian hiện tại:</Text>
          <div style={{ fontSize: 20, color: '#007bff', fontWeight: 700 }}>
            {new Date().toLocaleString('vi-VN')}
          </div>
        </Card>
      </Space>
    </Card>
  );
};

export default CheckIn;
