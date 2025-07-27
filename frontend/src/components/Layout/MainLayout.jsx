import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  UserOutlined, ClockCircleOutlined, TableOutlined, FileExcelOutlined, FormOutlined, RobotOutlined, BarChartOutlined
} from '@ant-design/icons';
import CheckIn from '../ChamCong/CheckIn';
import AccessLog from '../ChamCong/AccessLog';
import Dashboard from '../ChamCong/Dashboard';
import DonNghiPhepForm from '../NghiPhep/DonNghiPhepForm';
import DonNghiPhepList from '../NghiPhep/DonNghiPhepList';
import ExportExcel from '../ChamCong/ExportExcel';
import RegisterFace from '../ChamCong/RegisterFace';
import AiDashboard from '../AiAnalysis/AiDashboard';
import StatisticsDashboard from '../Statistics/StatisticsDashboard';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: 'checkin', icon: <ClockCircleOutlined />, label: 'Chấm công', component: <CheckIn /> },
  { key: 'accesslog', icon: <UserOutlined />, label: 'Lịch sử ra/vào', component: <AccessLog /> },
  { key: 'dashboard', icon: <TableOutlined />, label: 'Dashboard', component: <Dashboard /> },
  { key: 'registerface', icon: <UserOutlined />, label: 'Đăng ký khuôn mặt', component: <RegisterFace /> },
  { key: 'nghiphep', icon: <FormOutlined />, label: 'Nghỉ phép', component: (
      <div>
        <DonNghiPhepForm />
        <DonNghiPhepList />
      </div>
    )
  },
  { key: 'export', icon: <FileExcelOutlined />, label: 'Xuất Excel', component: <ExportExcel /> },
  { key: 'ai-dashboard', icon: <RobotOutlined />, label: 'AI Phân Tích', component: <AiDashboard /> },
  { key: 'statistics', icon: <BarChartOutlined />, label: 'Thống Kê', component: <StatisticsDashboard /> }
];

const MainLayout = () => {
  const [selectedKey, setSelectedKey] = useState('checkin');
  const selected = menuItems.find(item => item.key === selectedKey);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: '#001529' }}>
        <div style={{
          height: 64, margin: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20
        }}>
          <span role="img" aria-label="logo">🕑</span> Chấm Công AI
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={e => setSelectedKey(e.key)}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px #f0f1f2'
        }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            {selected.label}
          </Title>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          {selected.component}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 