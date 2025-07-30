<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { nhanVienService } from "../../../services/nhanVienService";
import NhanVienForm from "./NhanVienForm";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
=======
import React, { useState, useEffect } from 'react';
import { nhanVienService } from '../../../services/nhanVienService';
import NhanVienForm from './NhanVienForm';

>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
const NhanVienList = () => {
  const [nhanViens, setNhanViens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    fetchNhanViens();
  }, []);

  const fetchNhanViens = async () => {
    try {
      setLoading(true);
      const response = await nhanVienService.getAll();
      setNhanViens(response.data);
    } catch (err) {
<<<<<<< HEAD
      setError("Không thể tải danh sách nhân viên");
      console.error("Error fetching employees:", err);
=======
      setError('Không thể tải danh sách nhân viên');
      console.error('Error fetching employees:', err);
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchNhanViens();
    setShowForm(false);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
<<<<<<< HEAD
    if (window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      try {
        await nhanVienService.delete(id);
        fetchNhanViens();
        alert("Xóa nhân viên thành công!");
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa nhân viên");
        console.error("Error deleting employee:", error);
=======
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        await nhanVienService.delete(id);
        fetchNhanViens();
        alert('Xóa nhân viên thành công!');
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa nhân viên');
        console.error('Error deleting employee:', error);
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
<<<<<<< HEAD
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
=======
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
        <h2>Danh sách nhân viên</h2>
        <button onClick={() => setShowForm(true)}>Thêm nhân viên</button>
      </div>

      {showForm && (
<<<<<<< HEAD
        <NhanVienForm
=======
        <NhanVienForm 
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
          employee={editingEmployee}
          onSuccess={handleAddSuccess}
          onCancel={handleCloseForm}
        />
      )}

<<<<<<< HEAD
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#000000FF" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Mã NV</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tên</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Số điện thoại
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Thao tác
            </th>
=======
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#000000FF' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mã NV</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tên</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Số điện thoại</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Thao tác</th>
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
          </tr>
        </thead>
        <tbody>
          {nhanViens.map((nv) => (
            <tr key={nv.id}>
<<<<<<< HEAD
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {nv.ma_nhan_vien}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {nv.ten}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {nv.email}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {nv.so_dien_thoai}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() => handleEdit(nv)}
                  style={{
                    marginRight: "5px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(nv.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
=======
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nv.ma_nhan_vien}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nv.ten}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nv.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nv.so_dien_thoai}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button 
                  onClick={() => handleEdit(nv)}
                  style={{ marginRight: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Sửa
                </button>
                <button 
                  onClick={() => handleDelete(nv.id)}
                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NhanVienList;
<<<<<<< HEAD
=======

>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
