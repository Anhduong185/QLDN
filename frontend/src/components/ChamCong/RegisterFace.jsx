import React, { useState, useEffect, useRef, useCallback } from 'react';
import { nhanVienService } from '../../services/nhanVienService';
import { chamCongService } from '../../services/chamCongService';
import FaceRecognition from './FaceRecognition';

const convertErrorMessage = (raw, selectedEmployee) => {
  try {
    // Nếu là object
    if (typeof raw === 'object' && raw !== null) {
      if (raw.message) {
        // Kiểm tra nếu là lỗi đã đăng ký và là chính mình
        if (raw.message.includes('đã được đăng ký') && selectedEmployee) {
          const match = raw.message.match(/nhân viên: (.+)/);
          const name = match?.[1] || '';
          if (name && selectedEmployee.ten && name.trim() === selectedEmployee.ten.trim()) {
            return 'Bạn đang cập nhật lại khuôn mặt của mình. Đăng ký sẽ ghi đè dữ liệu cũ.';
          }
        }
        return raw.message;
      }
      return JSON.stringify(raw);
    }
    // Nếu là chuỗi JSON
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.message) {
          if (parsed.message.includes('đã được đăng ký') && selectedEmployee) {
            const match = parsed.message.match(/nhân viên: (.+)/);
            const name = match?.[1] || '';
            if (name && selectedEmployee.ten && name.trim() === selectedEmployee.ten.trim()) {
              return 'Bạn đang cập nhật lại khuôn mặt của mình. Đăng ký sẽ ghi đè dữ liệu cũ.';
            }
          }
          return parsed.message;
        }
      } catch {
        // Nếu là chuỗi unicode, decode lại
        try {
          const decoded = raw.replace(/\u([0-9a-fA-F]{4})/g, (m, g1) => String.fromCharCode(parseInt(g1, 16)));
          if (decoded.includes('đã được đăng ký') && selectedEmployee) {
            const match = decoded.match(/nhân viên: (.+)/);
            const name = match?.[1] || '';
            if (name && selectedEmployee.ten && name.trim() === selectedEmployee.ten.trim()) {
              return 'Bạn đang cập nhật lại khuôn mặt của mình. Đăng ký sẽ ghi đè dữ liệu cũ.';
            }
          }
          return decoded;
        } catch {
          return raw;
        }
      }
    }
    return raw;
  } catch {
    return raw;
  }
};

const RegisterFace = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await nhanVienService.getAll();
      if (response.success) {
        setEmployees(response.data || []);
      } else {
        setError('Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Lỗi khi tải danh sách nhân viên');
    }
  };

  const handleEmployeeSelect = async (employeeId) => {
    if (!employeeId) {
      setSelectedEmployee(null);
      setRegistrationStatus(null);
      return;
    }

    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);

    try {
      const status = await chamCongService.getRegistrationStatus(employeeId);
      setRegistrationStatus(status);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setRegistrationStatus({ registered: false });
    }
  };

  const handleRegisterFace = useCallback(async (faceDescriptor) => {
    if (!selectedEmployee) {
      setError('Vui lòng chọn nhân viên trước khi đăng ký khuôn mặt');
      return;
    }

    if (isProcessing) {
      console.log('🔍 RegisterFace: Already processing, skipping...');
      return;
    }

    console.log('🔍 RegisterFace: handleRegisterFace called', new Date().toISOString());
    setIsProcessing(true);
    setIsRegistering(true);
    setMessage('');
    setError('');
    setSuccess(false);

    try {
      const result = await chamCongService.registerFace({
        nhan_vien_id: selectedEmployee.id,
        face_descriptor: Array.from(faceDescriptor),
      });

      console.log('🔍 RegisterFace: API response', result);

      if (result.success) {
        setSuccess(true);
        setMessage('Đăng ký khuôn mặt thành công!');
        // Cập nhật trạng thái đăng ký
        setRegistrationStatus({ registered: true, updated_at: new Date().toISOString() });
      } else {
        setError(result.message || 'Đăng ký khuôn mặt thất bại');
      }
    } catch (e) {
      console.error('🔍 RegisterFace: Error', e);
      const userFriendlyMsg = convertErrorMessage(e.message, selectedEmployee);
      setError(userFriendlyMsg);
    } finally {
      setIsRegistering(false);
      setIsProcessing(false);
    }
  }, [selectedEmployee, isProcessing]);

  const checkRegistrationStatus = async (employeeId) => {
    try {
      const status = await chamCongService.getRegistrationStatus(employeeId);
      setRegistrationStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return { registered: false };
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <h2>📝 Đăng Ký Khuôn Mặt</h2>

      {/* Chọn nhân viên */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Chọn nhân viên:
        </label>
        <select
          value={selectedEmployee?.id || ''}
          onChange={(e) => handleEmployeeSelect(e.target.value ? parseInt(e.target.value) : null)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value="">-- Chọn nhân viên --</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.ma_nhan_vien} - {employee.ten}
            </option>
          ))}
        </select>
      </div>

      {/* Thông tin nhân viên được chọn */}
      {selectedEmployee && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
          <h3>👤 Thông tin nhân viên</h3>
          <p><strong>Mã NV:</strong> {selectedEmployee.ma_nhan_vien}</p>
          <p><strong>Tên:</strong> {selectedEmployee.ten}</p>
          <p><strong>Email:</strong> {selectedEmployee.email || 'N/A'}</p>
          <p><strong>Phòng ban:</strong> {selectedEmployee.phong_ban?.ten || 'N/A'}</p>
          
          {/* Trạng thái đăng ký */}
          {registrationStatus && (
            <div style={{ marginTop: '12px' }}>
              <p>
                <strong>Trạng thái đăng ký:</strong>{' '}
                {registrationStatus.registered ? (
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    ✅ Đã đăng ký
                  </span>
                ) : (
                  <span style={{ color: '#faad14', fontWeight: 'bold' }}>
                    ⚠️ Chưa đăng ký
                  </span>
                )}
              </p>
              {registrationStatus.registered && registrationStatus.updated_at && (
                <p>
                  <strong>Cập nhật lần cuối:</strong>{' '}
                  {new Date(registrationStatus.updated_at).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thông báo lỗi */}
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#fff2f0', borderRadius: '6px', border: '1px solid #ffccc7', color: '#cf1322' }}>
          ❌ {error}
        </div>
      )}

      {/* Thông báo thành công */}
      {success && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f', color: '#52c41a' }}>
          ✅ {message}
        </div>
      )}

      {/* Face Recognition Component */}
      {selectedEmployee && (
        <div style={{ marginTop: '24px' }}>
          <h3>📷 Đăng ký khuôn mặt cho {selectedEmployee.ten}</h3>
          <FaceRecognition
            onRegisterFace={handleRegisterFace}
            mode="register"
            selectedEmployee={selectedEmployee}
            disabled={isRegistering || isProcessing}
          />
        </div>
      )}

      {/* Hướng dẫn */}
      {!selectedEmployee && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
          <h3>📋 Hướng dẫn</h3>
          <ol>
            <li>Chọn nhân viên từ danh sách bên trên</li>
            <li>Đảm bảo camera hoạt động bình thường</li>
            <li>Đặt khuôn mặt vào khung hình</li>
            <li>Chờ hệ thống nhận diện và đăng ký</li>
            <li>Hoàn tất quá trình đăng ký</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default RegisterFace;
