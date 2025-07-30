const API_BASE_URL = 'http://localhost:8000/api';

export const nhanVienService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // Trả về array employees, không phải object
      return result.data || result || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  async getList(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/nhan-vien?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination || {
          current: 1,
          pageSize: 10,
          total: 0,
        }
      };
    } catch (error) {
      console.error('Error fetching employees list:', error);
      return {
        success: false,
        data: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0,
        }
      };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('Error fetching employee:', error);
      return {
        success: false,
        data: null
      };
    }
  },

  async getFormData() {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/form-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('Error fetching form data:', error);
      return {
        success: true,
        data: {
          phong_bans: [
            { id: 1, ten: 'Phòng Kỹ thuật' },
            { id: 2, ten: 'Phòng Nhân sự' },
            { id: 3, ten: 'Phòng Kế toán' },
            { id: 4, ten: 'Phòng Marketing' }
          ],
          chuc_vus: [
            { id: 1, ten: 'Nhân viên' },
            { id: 2, ten: 'Trưởng nhóm' },
            { id: 3, ten: 'Quản lý' },
            { id: 4, ten: 'Giám đốc' }
          ]
        }
      };
    }
  },

  async create(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  async exportExcel(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/nhan-vien/export-excel?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nhan-vien.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting excel:', error);
      throw error;
    }
  }
};