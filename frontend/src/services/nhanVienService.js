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
      throw error;
    }
  },

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
      throw error;
    }
  },

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
