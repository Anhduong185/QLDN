import React, { useState } from "react";
import { Layout, Menu, Card, Row, Col, Statistic } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  TableOutlined,
  FileExcelOutlined,
  FormOutlined,
  EyeOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import CheckIn from "./CheckIn";
import AccessLog from "./AccessLog";
import Dashboard from "./Dashboard";
import DonNghiPhepForm from "../NghiPhep/DonNghiPhepForm";
import DonNghiPhepList from "../NghiPhep/DonNghiPhepList";
import ExportExcel from "./ExportExcel";
import RegisterFace from "./RegisterFace";

const { Content, Sider } = Layout;

const ChamCongPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("check-in");

  const menuItems = [
    {
      key: "check-in",
      icon: <ClockCircleOutlined />,
      label: "Chấm công",
      component: <CheckIn />,
    },
    {
      key: "access-log",
      icon: <EyeOutlined />,
      label: "Lịch sử ra/vào",
      component: <AccessLog />,
    },
    {
      key: "dashboard",
      icon: <BarChartOutlined />,
      label: "Dashboard",
      component: <Dashboard />,
    },
    {
      key: "register-face",
      icon: <UserOutlined />,
      label: "Đăng ký khuôn mặt",
      component: <RegisterFace />,
    },
    {
      key: "nghi-phep",
      icon: <FormOutlined />,
      label: "Nghỉ phép",
      component: (
        <div>
          <DonNghiPhepForm />
          <DonNghiPhepList />
        </div>
      ),
    },
    {
      key: "export",
      icon: <FileExcelOutlined />,
      label: "Xuất Excel",
      component: <ExportExcel />,
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
                value={150}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã chấm công hôm nay"
                value={120}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chưa chấm công"
                value={30}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đơn nghỉ phép chờ duyệt"
                value={5}
                prefix={<FormOutlined />}
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
        <Content
          style={{
            background: "#fff",
            padding: 24,
            minHeight: 280,
            borderRadius: 8,
          }}
        >
          {selectedComponent}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChamCongPage;
