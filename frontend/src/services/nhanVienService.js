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
  }
};