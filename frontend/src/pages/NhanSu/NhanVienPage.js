import React from 'react';
import NhanSuLayout from '../../components/NhanSu/Layout/NhanSuLayout';
import NhanVienList from '../../components/NhanSu/NhanVien/NhanVienList';

const NhanVienPage = () => {
  return (
    <NhanSuLayout>
      <div className="nhan-vien-page">
        <h1>Quản lý nhân viên</h1>
        <NhanVienList />
      </div>
    </NhanSuLayout>
  );
};

export default NhanVienPage;