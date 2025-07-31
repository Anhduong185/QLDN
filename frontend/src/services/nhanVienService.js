const API_BASE_URL = "http://localhost:8000/api";

export const nhanVienService = {
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Trả về array employees, không phải object
      return result.data || result || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  async getList(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== "") {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/nhan-vien?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
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
        },
      };
    } catch (error) {
      console.error("Error fetching employees list:", error);
      return {
        success: false,
        data: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0,
        },
      };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      console.error("Error fetching employee:", error);
      return {
        success: false,
        data: null,
      };
    }
  },

  async getFormData() {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/form-data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      console.error("Error fetching form data:", error);
      return {
        success: true,
        data: {
          phong_bans: [
            { id: 1, ten: "Phòng Kỹ thuật" },
            { id: 2, ten: "Phòng Nhân sự" },
            { id: 3, ten: "Phòng Kế toán" },
            { id: 4, ten: "Phòng Marketing" },
          ],
          chuc_vus: [
            { id: 1, ten: "Nhân viên" },
            { id: 2, ten: "Trưởng nhóm" },
            { id: 3, ten: "Quản lý" },
            { id: 4, ten: "Giám đốc" },
          ],
        },
      };
    }
  },

  async create(formData) {
    try {
      // Kiểm tra xem formData có phải là FormData không
      const isFormData = formData instanceof FormData;

      const headers = {
        Accept: "application/json",
      };

      // Nếu không phải FormData, chuyển đổi thành FormData
      let dataToSend = formData;
      if (!isFormData) {
        const newFormData = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== undefined && formData[key] !== null) {
            newFormData.append(key, formData[key]);
          }
        });
        dataToSend = newFormData;
      }

      console.log("Sending create request with FormData:");
      for (let [key, value] of dataToSend.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${API_BASE_URL}/nhan-vien`, {
        method: "POST",
        headers: headers,
        body: dataToSend,
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        // Tạo error object với thông tin chi tiết
        const error = new Error(result.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.response = result;
        throw error;
      }

      return {
        success: true,
        data: result.data || result,
        message: result.message,
      };
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },

  async update(id, formData) {
    try {
      // Kiểm tra xem formData có phải là FormData không
      const isFormData = formData instanceof FormData;

      const headers = {
        Accept: "application/json",
      };

      // Nếu không phải FormData, chuyển đổi thành FormData
      let dataToSend = formData;
      if (!isFormData) {
        const newFormData = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== undefined && formData[key] !== null) {
            newFormData.append(key, formData[key]);
          }
        });
        dataToSend = newFormData;
      }

      // Thêm _method=PUT cho Laravel
      dataToSend.append("_method", "PUT");

      console.log("Sending update request with FormData:");
      for (let [key, value] of dataToSend.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: "POST", // Sử dụng POST với _method=PUT cho Laravel
        headers: headers,
        body: dataToSend,
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        // Tạo error object với thông tin chi tiết
        const error = new Error(result.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.response = result;
        throw error;
      }

      return {
        success: true,
        data: result.data || result,
        message: result.message,
      };
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/nhan-vien/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  },

  async exportExcel(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== "") {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/nhan-vien/export-excel?${queryParams}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nhan-vien.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error("Error exporting excel:", error);
      throw error;
    }
  },
};
