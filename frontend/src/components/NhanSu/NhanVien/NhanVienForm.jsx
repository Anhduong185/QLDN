import React, { useState, useEffect } from 'react';
import { nhanVienService } from '../../../services/nhanVienService';

const NhanVienForm = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    ma_nhan_vien: '',
    ten: '',
    email: '',
    so_dien_thoai: '',
    gioi_tinh: 'Nam',
    ngay_sinh: '',
    dia_chi: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ma_nhan_vien: employee.ma_nhan_vien || '',
        ten: employee.ten || '',
        email: employee.email || '',
        so_dien_thoai: employee.so_dien_thoai || '',
        gioi_tinh: employee.gioi_tinh || 'Nam',
        ngay_sinh: employee.ngay_sinh || '',
        dia_chi: employee.dia_chi || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (employee) {
        await nhanVienService.update(employee.id, formData);
        alert('Cập nhật nhân viên thành công!');
      } else {
        await nhanVienService.create(formData);
        alert('Thêm nhân viên thành công!');
      }
      onSuccess();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
      console.error('Error saving employee:', error);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', margin: '20px 0', backgroundColor: '#f9f9f9' }}>
      <h3>{employee ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="ma_nhan_vien"
            placeholder="Mã nhân viên"
            value={formData.ma_nhan_vien}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="ten"
            placeholder="Tên nhân viên"
            value={formData.ten}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="tel"
            name="so_dien_thoai"
            placeholder="Số điện thoại"
            value={formData.so_dien_thoai}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <select
            name="gioi_tinh"
            value={formData.gioi_tinh}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="date"
            name="ngay_sinh"
            value={formData.ngay_sinh}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            name="dia_chi"
            placeholder="Địa chỉ"
            value={formData.dia_chi}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '5px', height: '60px' }}
          />
        </div>
        <div>
          <button 
            type="submit"
            style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}
          >
            {employee ? 'Cập nhật' : 'Thêm'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default NhanVienForm;