const API_BASE_URL = 'http://localhost:8000/api';

export const chamCongService = {
  async registerFace(data) {
    console.log('🌐 API Call - Register Face');
    const url = `${API_BASE_URL}/cham-cong/register-face`;
    console.log('📤 Request URL:', url);
    console.log('📤 Request data:', data);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nhan_vien_id: data.nhan_vien_id,
          face_descriptor: data.face_descriptor,
        }),
      });

      console.log('📥 Response status:', response.status);

      const rawText = await response.text();
      console.log('📄 Raw response text:', rawText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(rawText);
          console.error('❌ HTTP Error:', response.status, errorData);
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch (e) {
          console.error('❌ HTTP Error (non-JSON):', rawText);
          throw new Error(`HTTP ${response.status}: ${rawText}`);
        }
      }

      const result = JSON.parse(rawText);
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (registerFace):', error.message);
      throw error;
    }
  },

  async checkIn(data) {
    console.log('🌐 API Call - Check In');
    const url = `${API_BASE_URL}/cham-cong/check-in`;
    console.log('📤 Request URL:', url);
    console.log('📤 Request data:', data);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          face_descriptor: data.face_descriptor,
          vi_tri: data.vi_tri || 'Văn phòng',
          device_info: data.device_info || 'Web browser',
        }),
      });

      console.log('📥 Response status:', response.status);

      const rawText = await response.text();
      console.log('📄 Raw response text:', rawText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(rawText);
          console.error('❌ HTTP Error:', response.status, errorData);
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch (e) {
          console.error('❌ HTTP Error (non-JSON):', rawText);
          throw new Error(`HTTP ${response.status}: ${rawText}`);
        }
      }

      const result = JSON.parse(rawText);
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (checkIn):', error.message);
      throw error;
    }
  },

  async getRegistrationStatus(nhanVienId) {
    console.log('🌐 API Call - Get Registration Status');
    const url = `${API_BASE_URL}/cham-cong/registration-status/${nhanVienId}`;
    console.log('📤 Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getRegistrationStatus):', error.message);
      throw error;
    }
  },

  async getDashboard(params = {}) {
    console.log('🌐 API Call - Get Dashboard');
    const url = new URL(`${API_BASE_URL}/cham-cong/dashboard`);
    
    if (params.from) url.searchParams.append('from', params.from);
    if (params.to) url.searchParams.append('to', params.to);
    if (params.phong_ban_id) url.searchParams.append('phong_ban_id', params.phong_ban_id);

    console.log('📤 Request URL:', url.toString());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getDashboard):', error.message);
      throw error;
    }
  },

  async getAccessLogs(params = {}) {
    console.log('🌐 API Call - Get Access Logs');
    const url = new URL(`${API_BASE_URL}/cham-cong/access-logs`);
    
    if (params.nhan_vien_id) url.searchParams.append('nhan_vien_id', params.nhan_vien_id);
    if (params.from) url.searchParams.append('from', params.from);
    if (params.to) url.searchParams.append('to', params.to);
    if (params.loai_su_kien) url.searchParams.append('loai_su_kien', params.loai_su_kien);

    console.log('📤 Request URL:', url.toString());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getAccessLogs):', error.message);
      throw error;
    }
  },

  async getTodayAttendance() {
    console.log('🌐 API Call - Get Today Attendance');
    const url = `${API_BASE_URL}/cham-cong/today`;
    console.log('📤 Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getTodayAttendance):', error.message);
      throw error;
    }
  },

  async getAllAttendance(params = {}) {
    console.log('🌐 API Call - Get All Attendance');
    const url = new URL(`${API_BASE_URL}/cham-cong/all`);
    
    if (params.from) url.searchParams.append('from', params.from);
    if (params.to) url.searchParams.append('to', params.to);
    if (params.phong_ban_id) url.searchParams.append('phong_ban_id', params.phong_ban_id);

    console.log('📤 Request URL:', url.toString());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getAllAttendance):', error.message);
      throw error;
    }
  },

  async getAttendanceHistory(params = {}) {
    console.log('🌐 API Call - Get Attendance History');
    const url = new URL(`${API_BASE_URL}/cham-cong/history`);
    
    if (params.nhan_vien_id) url.searchParams.append('nhan_vien_id', params.nhan_vien_id);
    if (params.from) url.searchParams.append('from', params.from);
    if (params.to) url.searchParams.append('to', params.to);

    console.log('📤 Request URL:', url.toString());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getAttendanceHistory):', error.message);
      throw error;
    }
  },

  async exportExcel(params = {}) {
    console.log('🌐 API Call - Export Excel');
    const url = new URL(`${API_BASE_URL}/cham-cong/export`);
    
    if (params.from) url.searchParams.append('from', params.from);
    if (params.to) url.searchParams.append('to', params.to);
    if (params.phong_ban_id) url.searchParams.append('phong_ban_id', params.phong_ban_id);

    console.log('📤 Request URL:', url.toString());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `cham_cong_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      console.log('📥 Excel file downloaded successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 Network error (exportExcel):', error.message);
      throw error;
    }
  },

  async getEmployeeTodayAttendance(nhanVienId) {
    console.log('🌐 API Call - Get Employee Today Attendance');
    const url = `${API_BASE_URL}/cham-cong/employee/${nhanVienId}/today`;
    console.log('📤 Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (getEmployeeTodayAttendance):', error.message);
      throw error;
    }
  },

  async createTestFaceData(nhanVienId) {
    console.log('🌐 API Call - Create Test Face Data');
    const url = `${API_BASE_URL}/cham-cong/create-test-face-data/${nhanVienId}`;
    console.log('📤 Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (createTestFaceData):', error.message);
      throw error;
    }
  },

  async debugNhanVien(nhanVienId) {
    console.log('🌐 API Call - Debug Nhan Vien');
    const url = `${API_BASE_URL}/cham-cong/debug-nhan-vien/${nhanVienId}`;
    console.log('📤 Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      return result;
    } catch (error) {
      console.error('💥 Network error (debugNhanVien):', error.message);
      throw error;
    }
  },
};
