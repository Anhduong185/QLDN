import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  TableOutlined,
  FileExcelOutlined,
  FormOutlined,
  RobotOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = ({ collapsed, onCollapse, currentModule, onModuleChange }) => {
  const [selectedKey, setSelectedKey] = useState('cham-cong');

  const menuItems = [
    {
      key: 'cham-cong',
      icon: <ClockCircleOutlined />,
      label: 'Chấm Công',
      children: [
        {
          key: 'check-in',
          icon: <ClockCircleOutlined />,
          label: 'Chấm Công',
        },
        {
          key: 'access-logs',
          icon: <TableOutlined />,
          label: 'Lịch Sử Ra/Vào',
        },
        {
          key: 'dashboard',
          icon: <BarChartOutlined />,
          label: 'Dashboard',
        },
        {
          key: 'register-face',
          icon: <UserOutlined />,
          label: 'Đăng Ký Khuôn Mặt',
        },
        {
          key: 'export',
          icon: <FileExcelOutlined />,
          label: 'Xuất Excel',
        },
      ],
    },
    {
      key: 'nhan-su',
      icon: <UserOutlined />,
      label: 'Nhân Sự',
      children: [
        {
          key: 'nhan-vien',
          icon: <UserOutlined />,
          label: 'Quản Lý Nhân Viên',
        },
        {
          key: 'phong-ban',
          icon: <TableOutlined />,
          label: 'Phòng Ban',
        },
        {
          key: 'chuc-vu',
          icon: <UserOutlined />,
          label: 'Chức Vụ',
        },
      ],
    },
    {
      key: 'nghi-phep',
      icon: <FormOutlined />,
      label: 'Nghỉ Phép',
    },
    {
      key: 'ai-analysis',
      icon: <RobotOutlined />,
      label: 'AI Phân Tích',
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: 'Thống Kê',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    onModuleChange && onModuleChange(key);
  };

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case 'logout':
        // Xử lý đăng xuất
        console.log('Đăng xuất');
        break;
      case 'profile':
        // Xử lý hồ sơ cá nhân
        console.log('Hồ sơ cá nhân');
        break;
      case 'settings':
        // Xử lý cài đặt
        console.log('Cài đặt');
        break;
      default:
        break;
    }
  };

  const getPageTitle = () => {
    const menuItem = menuItems.find(item => 
      item.key === selectedKey || 
      item.children?.some(child => child.key === selectedKey)
    );
    
    if (menuItem?.children) {
      const childItem = menuItem.children.find(child => child.key === selectedKey);
      return childItem?.label || menuItem.label;
    }
    
    return menuItem?.label || 'Hệ thống Quản lý Nhân sự';
  };

  return (
    <AntHeader style={{
      background: '#fff',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Left side - Logo and Collapse button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapse}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
            marginRight: 16,
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#1890ff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
              QL
            </span>
          </div>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {getPageTitle()}
          </Title>
        </div>
      </div>

      {/* Center - Navigation Menu */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Right side - User info and notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications */}
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: '16px' }}
          badge={{ count: 3 }}
        />
        
        {/* User dropdown */}
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', hover: { background: '#f5f5f5' } }}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                Admin User
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                Quản trị viên
              </span>
            </div>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
