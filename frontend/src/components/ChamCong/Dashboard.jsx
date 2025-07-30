import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Tag,
  Typography,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { chamCongService } from "../../services/chamCongService";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    chamCongService
      .getDashboard({})
      .then((res) => {
        console.log("Dashboard API raw:", res);
        setDashboardData(res.data || {});
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card loading={true} style={{ margin: "32px auto", maxWidth: 1200 }} />
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
    { title: "Tên nhân viên", dataIndex: "ten", key: "ten" },
    { title: "Phòng ban", dataIndex: "phong_ban", key: "phong_ban" },
    { title: "Đúng giờ", dataIndex: "dung_gio", key: "dung_gio" },
    { title: "Tổng ngày", dataIndex: "tong_ngay", key: "tong_ngay" },
    {
      title: "Tỷ lệ",
      dataIndex: "ty_le",
      key: "ty_le",
      render: (ty_le) => (
        <Progress
          percent={ty_le}
          size="small"
          status={
            ty_le >= 90 ? "success" : ty_le >= 70 ? "normal" : "exception"
          }
        />
      ),
    },
  ];

  // Cột cho bảng theo giờ chấm công
  const gioChamCongColumns = [
    { title: "Giờ", dataIndex: "gio", key: "gio" },
    { title: "Số lượng", dataIndex: "so_luong", key: "so_luong" },
  ];

  return (
    <div style={{ margin: "32px auto", maxWidth: 1200 }}>
      <Title level={2}>Dashboard Chấm Công</Title>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng ngày công"
              value={tong_quan?.tong_ngay_cong || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có chấm công"
              value={tong_quan?.co_cham_cong || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chấm công"
              value={tong_quan?.ty_le_cham_cong || 0}
              suffix="%"
              prefix={
                <Progress
                  type="circle"
                  percent={tong_quan?.ty_le_cham_cong || 0}
                  size={40}
                />
              }
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={hom_nay?.cham_cong || 0}
              suffix={`/ ${hom_nay?.nhan_vien || 0}`}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê theo trạng thái */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đúng giờ"
              value={theo_trang_thai?.dung_gio || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đi muộn"
              value={theo_trang_thai?.di_muon || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Về sớm"
              value={theo_trang_thai?.ve_som || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vắng"
              value={theo_trang_thai?.vang || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê theo phòng ban */}
      {theo_phong_ban && theo_phong_ban.length > 0 && (
        <Card title="Thống kê theo phòng ban" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {theo_phong_ban.map((pb, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card size="small">
                  <Statistic
                    title={pb.phong_ban}
                    value={pb.tong_ngay}
                    suffix={`ngày (${pb.dung_gio} đúng giờ)`}
                    prefix={<TeamOutlined />}
                  />
                  <Progress
                    percent={
                      pb.tong_ngay > 0
                        ? Math.round((pb.dung_gio / pb.tong_ngay) * 100)
                        : 0
                    }
                    size="small"
                    status={
                      pb.tong_ngay > 0 && pb.dung_gio / pb.tong_ngay >= 0.9
                        ? "success"
                        : "normal"
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Top nhân viên đúng giờ */}
      {top_nhan_vien_dung_gio && top_nhan_vien_dung_gio.length > 0 && (
        <Card title="Top nhân viên đúng giờ" style={{ marginBottom: 24 }}>
          <Table
            columns={topNhanVienColumns}
            dataSource={top_nhan_vien_dung_gio}
            rowKey="nhan_vien_id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Thống kê theo giờ chấm công */}
      {theo_gio_cham_cong && theo_gio_cham_cong.length > 0 && (
        <Card title="Thống kê theo giờ chấm công" style={{ marginBottom: 24 }}>
          <Table
            columns={gioChamCongColumns}
            dataSource={theo_gio_cham_cong}
            rowKey="gio"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Thông tin bổ sung */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Thống kê thời gian">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Tuần này"
                  value={tuan_nay || 0}
                  suffix="chấm công"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tháng này"
                  value={thang_nay || 0}
                  suffix="chấm công"
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Tỷ lệ hôm nay">
            <Statistic
              title="Chấm công hôm nay"
              value={hom_nay?.ty_le || 0}
              suffix="%"
              prefix={
                <Progress
                  type="circle"
                  percent={hom_nay?.ty_le || 0}
                  size={60}
                />
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
