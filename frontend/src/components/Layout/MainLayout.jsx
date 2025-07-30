import React, { useState } from 'react';
import { Layout, Typography } from 'antd';
import CheckIn from '../ChamCong/CheckIn';
import AccessLog from '../ChamCong/AccessLog';
import Dashboard from '../ChamCong/Dashboard';
import DonNghiPhepForm from '../NghiPhep/DonNghiPhepForm';
import DonNghiPhepList from '../NghiPhep/DonNghiPhepList';
import ExportExcel from '../ChamCong/ExportExcel';
import RegisterFace from '../ChamCong/RegisterFace';
import AiDashboard from '../AiAnalysis/AiDashboard';
import StatisticsDashboard from '../Statistics/StatisticsDashboard';
import NhanVienList from '../NhanSu/NhanVienList';
import AppHeader from '../common/Header';

const { Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: 'checkin', label: 'Chấm công', component: <CheckIn /> },
  { key: 'accesslog', label: 'Lịch sử ra/vào', component: <AccessLog /> },
  { key: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
  { key: 'registerface', label: 'Đăng ký khuôn mặt', component: <RegisterFace /> },
  { key: 'nghiphep', label: 'Nghỉ phép', component: (
      <div>
        <DonNghiPhepForm />
        <DonNghiPhepList />
      </div>
    )
  },
  { key: 'export', label: 'Xuất Excel', component: <ExportExcel /> },
  { key: 'nhanvien', label: 'Quản lý nhân viên', component: <NhanVienList /> },
  { key: 'ai-dashboard', label: 'AI Phân Tích', component: <AiDashboard /> },
  { key: 'statistics', label: 'Thống Kê', component: <StatisticsDashboard /> }
];

const MainLayout = () => {
  const [selectedKey, setSelectedKey] = useState('checkin');
  const selected = menuItems.find(item => item.key === selectedKey);

  const handleMenuSelect = (key) => {
    // Map header menu keys to component keys
    const keyMapping = {
      'check-in': 'checkin',
      'lich-su-cham-cong': 'accesslog',
      'dashboard': 'dashboard',
      'dang-ky-khuon-mat': 'registerface',
      'nghi-phep': 'nghiphep',
      'export': 'export',
      'danh-sach-nhan-vien': 'nhanvien',
      'ai-analysis': 'ai-dashboard',
      'thong-ke': 'statistics',
      // Default mappings
      'cham-cong': 'checkin',
      'nhan-su': 'nhanvien',
      'bao-cao': 'dashboard',
    };
    
    const mappedKey = keyMapping[key] || key;
    setSelectedKey(mappedKey);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <AppHeader onMenuSelect={handleMenuSelect} />
      
      {/* Main Content */}
      <Content style={{ 
        margin: '24px', 
        padding: '24px', 
        background: '#fff', 
        borderRadius: '8px',
        minHeight: 'calc(100vh - 88px)',
        overflow: 'auto'
      }}>
        {selected?.component}
      </Content>
    </Layout>
  );
};

export default MainLayout; 