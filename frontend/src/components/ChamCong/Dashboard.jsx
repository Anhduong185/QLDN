import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Tag,
  Typography,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { chamCongService } from '../../services/chamCongService';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    chamCongService
      .getDashboard({})
      .then((res) => {
        console.log('Dashboard API raw:', res);
        setDashboardData(res.data || {});
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card loading={true} style={{ margin: '32px auto', maxWidth: 1200 }} />
    );
  }

  if (!dashboardData) {
    return <Card>Không có dữ liệu</Card>;
  }

  const {
    tong_quan,
    theo_trang_thai,
    theo_phong_ban,
    hom_nay,
    tuan_nay,
    thang_nay,
    top_nhan_vien_dung_gio,
    theo_gio_cham_cong,
  } = dashboardData;

  // Cột cho bảng top nhân viên
  const topNhanVienColumns = [
    { title: 'Tên nhân viên', dataIndex: 'ten', key: 'ten' },
    { title: 'Phòng ban', dataIndex: 'phong_ban', key: 'phong_ban' },
    { title: 'Đúng giờ', dataIndex: 'dung_gio', key: 'dung_gio' },
    { title: 'Tổng ngày', dataIndex: 'tong_ngay', key: 'tong_ngay' },
    {
      title: 'Tỷ lệ',
      dataIndex: 'ty_le',
      key: 'ty_le',
      render: (ty_le) => (
        <Progress
          percent={ty_le}
          size="small"
          status={
            ty_le >= 90 ? 'success' : ty_le >= 70 ? 'normal' : 'exception'
          }
        />
      ),
    },
  ];

  // Cột cho bảng theo giờ chấm công
  const gioChamCongColumns = [
    { title: 'Giờ', dataIndex: 'gio', key: 'gio' },
    { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong' },
  ];

  return (
    <div style={{ margin: '32px auto', maxWidth: 1200 }}>
      <Title level={2}>Dashboard Chấm Công</Title>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng ngày công"
              value={tong_quan?.tong_ngay_cong || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có chấm công"
              value={tong_quan?.co_cham_cong || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chấm công"
              value={tong_quan?.ty_le_cham_cong || 0}
              suffix="%"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vắng mặt"
              value={tong_quan?.vang_mat || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê theo trạng thái */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="📊 Thống Kê Theo Trạng Thái">
            <Row gutter={[8, 8]}>
              {Array.isArray(theo_trang_thai) && theo_trang_thai.map((item, index) => (
                <Col xs={12} sm={8} key={index}>
                  <Card size="small">
                    <Statistic
                      title={item.trang_thai}
                      value={item.so_luong}
                      valueStyle={{ color: item.color || '#1890ff' }}
                    />
                  </Card>
                </Col>
              ))}
              {!Array.isArray(theo_trang_thai) && (
                <Col span={24}>
                  <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    Chưa có dữ liệu thống kê theo trạng thái
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="🏢 Thống Kê Theo Phòng Ban">
            <Row gutter={[8, 8]}>
              {Array.isArray(theo_phong_ban) && theo_phong_ban.map((item, index) => (
                <Col xs={12} sm={8} key={index}>
                  <Card size="small">
                    <Statistic
                      title={item.phong_ban}
                      value={item.so_luong}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              ))}
              {!Array.isArray(theo_phong_ban) && (
                <Col span={24}>
                  <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    Chưa có dữ liệu thống kê theo phòng ban
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Thống kê theo thời gian */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={hom_nay?.tong || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tuần này"
              value={tuan_nay?.tong || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tháng này"
              value={thang_nay?.tong || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng và biểu đồ */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="🏆 Top Nhân Viên Đúng Giờ" style={{ height: '400px' }}>
            <Table
              dataSource={top_nhan_vien_dung_gio || []}
              columns={topNhanVienColumns}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="⏰ Thống Kê Theo Giờ Chấm Công" style={{ height: '400px' }}>
            <Table
              dataSource={theo_gio_cham_cong || []}
              columns={gioChamCongColumns}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 