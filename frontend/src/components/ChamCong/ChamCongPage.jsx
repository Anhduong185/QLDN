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
