import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from "antd";
import {
  UserOutlined,
  DownOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  GlobalOutlined,
  FileExcelOutlined,
  RobotOutlined,
  FormOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const mainMenuItems = [
  {
    key: "nhan-su",
    icon: <TeamOutlined />,
    label: "Quản lý nhân sự",
    children: [
      { key: "danh-sach-nhan-vien", label: "Danh sách nhân viên" },
      { key: "phong-ban", label: "Phòng ban" },
      { key: "chuc-vu", label: "Chức vụ" },
      { key: "hop-dong", label: "Hợp đồng" },
      { key: "bang-cap", label: "Bằng cấp" },
    ],
  },
  {
    key: "cham-cong",
    icon: <ClockCircleOutlined />,
    label: "Chấm công",
    children: [
      { key: "check-in", label: "Chấm công" },
      { key: "lich-su-cham-cong", label: "Lịch sử chấm công" },
      { key: "nghi-phep", label: "Nghỉ phép" },
      { key: "ca-lam-viec", label: "Ca làm việc" },
      { key: "dang-ky-khuon-mat", label: "Đăng ký khuôn mặt" },
    ],
  },
  {
    key: "tai-chinh",
    icon: <DollarOutlined />,
    label: "Tài chính",
    children: [
      { key: "luong", label: "Lương" },
      { key: "thuong", label: "Thưởng" },
      { key: "phu-cap", label: "Phụ cấp" },
      { key: "bao-hiem", label: "Bảo hiểm" },
      { key: "thue", label: "Thuế" },
    ],
  },
  {
    key: "bao-cao",
    icon: <BarChartOutlined />,
    label: "Báo cáo",
    children: [
      { key: "bao-cao-nhan-su", label: "Báo cáo nhân sự" },
      { key: "bao-cao-cham-cong", label: "Báo cáo chấm công" },
      { key: "bao-cao-luong", label: "Báo cáo lương" },
      { key: "thong-ke", label: "Thống kê" },
      { key: "export", label: "Xuất Excel" },
    ],
  },
  {
    key: "ai-analysis",
    icon: <RobotOutlined />,
    label: "AI Phân Tích",
    children: [
      { key: "ai-dashboard", label: "Dashboard AI" },
      { key: "predictions", label: "Dự đoán" },
    ],
  },
  {
    key: "cai-dat",
    icon: <SettingOutlined />,
    label: "Cài đặt",
    children: [
      { key: "nguoi-dung", label: "Quản lý người dùng" },
      { key: "phan-quyen", label: "Phân quyền" },
      { key: "cau-hinh", label: "Cấu hình hệ thống" },
      { key: "sao-luu", label: "Sao lưu dữ liệu" },
    ],
  },
];

const userMenu = (
  <Menu>
    <Menu.Item key="profile" icon={<UserOutlined />}>
      Thông tin cá nhân
    </Menu.Item>
    <Menu.Item key="settings" icon={<SettingOutlined />}>
      Cài đặt tài khoản
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="logout">Đăng xuất</Menu.Item>
  </Menu>
);

const notificationMenu = (
  <Menu>
    <Menu.Item key="notification1">
      Có 5 nhân viên chưa chấm công hôm nay
    </Menu.Item>
    <Menu.Item key="notification2">3 đơn nghỉ phép cần duyệt</Menu.Item>
    <Menu.Item key="notification3">Báo cáo tháng đã sẵn sàng</Menu.Item>
  </Menu>
);

const AppHeader = ({ onMenuSelect }) => {
  const [selectedKeys, setSelectedKeys] = useState(["cham-cong"]);

  const handleMenuClick = ({ key }) => {
    setSelectedKeys([key]);
    // Gọi callback từ parent component
    if (onMenuSelect) {
      onMenuSelect(key);
    }
    // Xử lý navigation ở đây
    console.log("Selected menu:", key);
  };

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px #f0f1f2",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo và tên hệ thống */}
      <div style={{ display: "flex", alignItems: "center", minWidth: 200 }}>
        <span
          role="img"
          aria-label="logo"
          style={{ fontSize: 28, marginRight: 12 }}
        >
          🏢
        </span>
        <Title
          level={4}
          style={{ margin: 0, color: "#1890ff", fontWeight: 700 }}
        >
          QLNS Pro
        </Title>
      </div>

      {/* Menu chính */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Menu
          mode="horizontal"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          items={mainMenuItems}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 14,
          }}
        />
      </div>

      {/* Khu vực bên phải */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minWidth: 200,
          justifyContent: "flex-end",
        }}
      >
        {/* Thông báo */}
        <Dropdown
          overlay={notificationMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Badge count={3} size="small">
            <BellOutlined
              style={{ fontSize: 18, color: "#666", cursor: "pointer" }}
            />
          </Badge>
        </Dropdown>

        {/* Ngôn ngữ */}
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="vi">Tiếng Việt</Menu.Item>
              <Menu.Item key="en">English</Menu.Item>
            </Menu>
          }
          placement="bottomRight"
        >
          <GlobalOutlined
            style={{ fontSize: 18, color: "#666", cursor: "pointer" }}
          />
        </Dropdown>

        {/* User info */}
        <Dropdown overlay={userMenu} placement="bottomRight">
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff", marginRight: 8 }}
            />
            <span style={{ fontWeight: 500, color: "#333", marginRight: 4 }}>
              Admin
            </span>
            <DownOutlined style={{ fontSize: 12, color: "#888" }} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader; 