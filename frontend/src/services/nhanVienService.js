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
      return result;
    } catch (error) {
      console.error('💥 Network error (getAll):', error.message);
      throw error;
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
      return result;
    } catch (error) {
      console.error('💥 Network error (getById):', error.message);
      throw error;
    }
  },

  async create(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('💥 Network error (create):', error.message);
      throw error;
    }
  },

  async update(id, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('💥 Network error (update):', error.message);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('💥 Network error (delete):', error.message);
      throw error;
    }
  },

  async getList(params = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/nhan-vien`);
      
      if (params.page) url.searchParams.append('page', params.page);
      if (params.per_page) url.searchParams.append('per_page', params.per_page);
      if (params.search) url.searchParams.append('search', params.search);
      if (params.phong_ban_id) url.searchParams.append('phong_ban_id', params.phong_ban_id);
      if (params.chuc_vu_id) url.searchParams.append('chuc_vu_id', params.chuc_vu_id);
      if (params.trang_thai !== undefined) url.searchParams.append('trang_thai', params.trang_thai);

      const response = await fetch(url, {
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
      return result;
    } catch (error) {
      console.error('💥 Network error (getList):', error.message);
      throw error;
    }
  },

  async getPhongBan() {
    try {
      const response = await fetch(`${API_BASE_URL}/phong-ban`, {
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
      return result;
    } catch (error) {
      console.error('💥 Network error (getPhongBan):', error.message);
      throw error;
    }
  },

  async getChucVu() {
    try {
      const response = await fetch(`${API_BASE_URL}/chuc-vu`, {
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
      return result;
    } catch (error) {
      console.error('💥 Network error (getChucVu):', error.message);
      throw error;
    }
  },

  async exportExcel(params = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/nhan-vien/export`);
      
      if (params.phong_ban_id) url.searchParams.append('phong_ban_id', params.phong_ban_id);
      if (params.chuc_vu_id) url.searchParams.append('chuc_vu_id', params.chuc_vu_id);
      if (params.trang_thai !== undefined) url.searchParams.append('trang_thai', params.trang_thai);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `nhan_vien_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error('💥 Network error (exportExcel):', error.message);
      throw error;
    }
  },
};
