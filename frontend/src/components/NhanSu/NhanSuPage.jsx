import React, { useState } from "react";
import { Layout, Menu, Card, Row, Col, Statistic } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  CrownOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import NhanVienList from "./NhanVienList";
import { nhanVienService } from "../../services/nhanVienService";

const { Content, Sider } = Layout;

const NhanSuPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("nhan-vien");
  const [dashboardData, setDashboardData] = useState({
    tong_nv: 0,
    dang_lam: 0,
    da_nghi: 0,
    nhan_vien_moi: 0,
  });

  // Load dashboard data
  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await nhanVienService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    }
  };

  const menuItems = [
    {
      key: "nhan-vien",
      icon: <UserOutlined />,
      label: "Quản lý nhân viên",
      component: <NhanVienList />,
    },
    {
      key: "phong-ban",
      icon: <BankOutlined />,
      label: "Quản lý phòng ban",
      component: <div>Quản lý phòng ban (Đang phát triển)</div>,
    },
    {
      key: "chuc-vu",
      icon: <CrownOutlined />,
      label: "Quản lý chức vụ",
      component: <div>Quản lý chức vụ (Đang phát triển)</div>,
    },
    {
      key: "hop-dong",
      icon: <FileTextOutlined />,
      label: "Quản lý hợp đồng",
      component: <div>Quản lý hợp đồng (Đang phát triển)</div>,
    },
    {
      key: "bao-cao",
      icon: <BarChartOutlined />,
      label: "Báo cáo nhân sự",
      component: <div>Báo cáo nhân sự (Đang phát triển)</div>,
    },
  ];

  const selectedComponent = menuItems.find(
    (item) => item.key === selectedMenu
  )?.component;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Dashboard Stats */}
      <div style={{ padding: "24px 24px 0 24px" }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng nhân viên"
                value={dashboardData.tong_nv}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang làm việc"
                value={dashboardData.dang_lam}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã nghỉ"
                value={dashboardData.da_nghi}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Nhân viên mới (tháng)"
                value={dashboardData.nhan_vien_moi}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Layout style={{ padding: "24px" }}>
        {/* Sidebar Menu */}
        <Sider width={250} style={{ background: "#fff", marginRight: 16 }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            style={{ height: "100%", borderRight: 0 }}
            onClick={({ key }) => setSelectedMenu(key)}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
            }))}
          />
        </Sider>

        {/* Main Content */}
        <Content style={{ background: "#fff", padding: 0, minHeight: 280 }}>
          {selectedComponent}
        </Content>
      </Layout>
    </Layout>
  );
};

export default NhanSuPage;
