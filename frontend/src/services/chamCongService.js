const API_BASE_URL = "http://localhost:8000/api";

export const chamCongService = {
  async registerFace(data) {
    console.log("🌐 API Call - Register Face");
    const url = `${API_BASE_URL}/cham-cong/register-face`;
    console.log("📤 Request URL:", url);
    console.log("📤 Request data:", data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nhan_vien_id: data.nhan_vien_id,
          face_descriptor: data.face_descriptor,
        }),
      });

      console.log("📥 Response status:", response.status);

      const rawText = await response.text();
      console.log("📄 Raw response text:", rawText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(rawText);
          console.error("❌ HTTP Error:", response.status, errorData);
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch (e) {
          console.error("❌ HTTP Error (non-JSON):", rawText);
          throw new Error(`HTTP ${response.status}: ${rawText}`);
        }
      }

      const result = JSON.parse(rawText);
      console.log("📥 Response data:", result);

      return result;
    } catch (error) {
      console.error("💥 Network error (registerFace):", error.message);
      throw error;
    }
  },

  async checkIn(data) {
    console.log("🌐 API Call - Check In");
    const url = `${API_BASE_URL}/cham-cong/check-in`;
    console.log("📤 Request URL:", url);
    console.log("📤 Request data:", data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          face_descriptor: data.face_descriptor,
        }),
      });

      console.log("📥 Response status:", response.status);

      const rawText = await response.text();
      console.log("📄 Raw response text:", rawText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(rawText);
          console.error("❌ HTTP Error:", response.status, errorData);
          throw new Error(errorData.message || `HTTP ${response.status}`);
        } catch (e) {
          console.error("❌ HTTP Error (non-JSON):", rawText);
          throw new Error(`HTTP ${response.status}: ${rawText}`);
        }
      }

      const result = JSON.parse(rawText);
      console.log("📥 Response data:", result);

      return result;
    } catch (error) {
      console.error("💥 Network error (checkIn):", error.message);
      throw error;
    }
  },
  async getAccessLogs(params) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/cham-cong/access-logs?${query}`);
    return res.json();
  },
  async getDashboard(params) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/cham-cong/dashboard?${query}`);
    return res.json();
  },
  async exportExcel(params) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/cham-cong/export-excel?${query}`);
    return res.blob();
  },
};
