<<<<<<< HEAD
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
);

export const nhanVienService = {
  // Lấy danh sách nhân viên với phân trang và tìm kiếm
  getList: async (params = {}) => {
    try {
      const response = await apiClient.get("/nhan-vien");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết nhân viên theo ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/nhan-vien/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Thêm nhân viên mới
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/nhan-vien`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response || error;
    }
  },

  // Cập nhật nhân viên
  update: async (id, formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/nhan-vien/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: { _method: "PUT" },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response || error;
    }
  },

  // Xóa nhân viên
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/nhan-vien/${id}`);
      return response;
    } catch (error) {
=======
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
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
      throw error;
    }
  },

<<<<<<< HEAD
  // Lấy dữ liệu cho form (phòng ban, chức vụ)
  getFormData: async () => {
    try {
      const response = await apiClient.get("/nhan-vien/form-data");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thống kê dashboard
  getDashboard: async () => {
    try {
      const response = await apiClient.get("/nhan-vien/dashboard");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export danh sách nhân viên
  exportExcel: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/nhan-vien/export`, {
        params,
        responseType: "blob",
      });

      // Tạo link download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `danh-sach-nhan-vien-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      throw error.response || error;
    }
  },

  // Upload ảnh đại diện
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("anh_dai_dien", file);

      const response = await axios.post(
        `${API_URL}/nhan-vien/upload-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response || error;
    }
  },

  // Kiểm tra mã nhân viên đã tồn tại chưa
  checkMaNhanVien: async (maNhanVien, id = null) => {
    try {
      const params = { ma_nhan_vien: maNhanVien };
      if (id) params.exclude_id = id;

      const response = await apiClient.get("/nhan-vien/check-ma", { params });
      return response;
    } catch (error) {
=======
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
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
      throw error;
    }
  },

<<<<<<< HEAD
  // Kiểm tra email đã tồn tại chưa
  checkEmail: async (email, id = null) => {
    try {
      const params = { email };
      if (id) params.exclude_id = id;

      const response = await apiClient.get("/nhan-vien/check-email", {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
=======
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
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
