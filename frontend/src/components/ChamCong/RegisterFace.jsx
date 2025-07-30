import React, { useState, useEffect, useRef, useCallback } from "react";
import { nhanVienService } from "../../services/nhanVienService";
import { chamCongService } from "../../services/chamCongService";
import FaceRecognition from "./FaceRecognition";

const convertErrorMessage = (raw, selectedEmployee) => {
  try {
    // Nếu là object
    if (typeof raw === "object" && raw !== null) {
      if (raw.message) {
        // Kiểm tra nếu là lỗi đã đăng ký và là chính mình
        if (raw.message.includes("đã được đăng ký") && selectedEmployee) {
          const match = raw.message.match(/nhân viên: (.+)/);
          const name = match?.[1] || "";
          if (
            name &&
            selectedEmployee.ten &&
            name.trim() === selectedEmployee.ten.trim()
          ) {
            return "Bạn đang cập nhật lại khuôn mặt của mình. Đăng ký sẽ ghi đè dữ liệu cũ.";
          }
        }
        return raw.message;
      }
      return JSON.stringify(raw);
    }
    // Nếu là chuỗi JSON
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.message) {
          if (parsed.message.includes("đã được đăng ký") && selectedEmployee) {
            const match = parsed.message.match(/nhân viên: (.+)/);
            const name = match?.[1] || "";
            if (
              name &&
              selectedEmployee.ten &&
              name.trim() === selectedEmployee.ten.trim()
            ) {
              return "Bạn đang cập nhật lại khuôn mặt của mình. Đăng ký sẽ ghi đè dữ liệu cũ.";
            }
          }
          return parsed.message;
        }
      } catch {
        // Nếu là chuỗi unicode, decode lại
        try {
          const decoded = raw.replace(/\u([0-9a-fA-F]{4})/g, (m, g1) =>
            String.fromCharCode(parseInt(g1, 16))
          );
          if (decoded.includes("đã được đăng ký") && selectedEmployee) {
            const match = decoded.match(/nhân viên: (.+)/);
            const name = match?.[1] || "";
            if (
              name &&
              selectedEmployee.ten &&
              name.trim() === selectedEmployee.ten.trim()
            ) {
              return "Bạn đang cập nhật lại khuôn mặt của mình. Đăng ký sẽ ghi đè dữ liệu cũ.";
            }
          }
          return decoded;
        } catch {}
      }
      return raw;
    }
    return "Đã xảy ra lỗi không xác định.";
  } catch (e) {
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
  }
};

const RegisterFace = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("idle");
  const [hasFaceData, setHasFaceData] = useState(false); // mới
  const [allowOverride, setAllowOverride] = useState(false); // mới
  const selectedEmployeeRef = useRef(null);

  useEffect(() => {
    selectedEmployeeRef.current = selectedEmployee;
  }, [selectedEmployee]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await nhanVienService.getList();
      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (data && Array.isArray(data.data)) {
        setEmployees(data.data);
      } else {
        console.error("Invalid employees data format:", data);
        setEmployees([]);
        setMessage("❌ Dữ liệu nhân viên không hợp lệ");
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
      setMessage("❌ Lỗi khi tải danh sách nhân viên: " + error.message);
    }
  };

  const handleRegisterFace = useCallback(async (faceDescriptor) => {
    if (!selectedEmployeeRef.current) {
      setMessage("❌ Vui lòng chọn nhân viên trước");
      return;
    }

    setRegistrationStatus("processing");
    setMessage("🔄 Đang đăng ký khuôn mặt...");

    try {
      const result = await chamCongService.registerFace({
        nhan_vien_id: selectedEmployeeRef.current.id,
        face_descriptor: Array.from(faceDescriptor),
      });

      if (result.success) {
        setRegistrationStatus("success");
        setMessage(`✅ ${result.message}`);
        setTimeout(() => {
          setRegistrationStatus("idle");
          setSelectedEmployee(null);
          setMessage("");
        }, 3000);
      } else {
        setRegistrationStatus("error");
        setMessage(
          `❌ ${convertErrorMessage(
            result.message,
            selectedEmployeeRef.current
          )}`
        );
      }
    } catch (error) {
      setRegistrationStatus("error");
      console.error("Lỗi đăng ký khuôn mặt:", error);
      setMessage(
        `❌ ${convertErrorMessage(error.message, selectedEmployeeRef.current)}`
      );
    }
  }, []);

  const checkRegistrationStatus = async (employeeId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/cham-cong/registration-status/${employeeId}`
      );
      const raw = await response.text();

      let result;
      try {
        result = JSON.parse(raw);
      } catch (e) {
        console.error("❌ Không phải JSON:", raw);
        setMessage(
          "❌ Không thể kiểm tra trạng thái đăng ký (Phản hồi không hợp lệ)"
        );
        setHasFaceData(false);
        setAllowOverride(false);
        return;
      }

      if (result.success && result.data && result.data.has_face_data) {
        setMessage(
          `ℹ️ Nhân viên này đã đăng ký khuôn mặt vào ${new Date(
            result.data.registered_at
          ).toLocaleString()}`
        );
        setHasFaceData(true);
        setAllowOverride(false);
      } else {
        setMessage("ℹ️ Nhân viên này chưa đăng ký khuôn mặt");
        setHasFaceData(false);
        setAllowOverride(false);
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
      setMessage(`❌ Lỗi khi kiểm tra trạng thái: ${error.message}`);
      setHasFaceData(false);
      setAllowOverride(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2
        style={{ textAlign: "center", marginBottom: "30px", color: "#007bff" }}
      >
        📝 Đăng ký khuôn mặt
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          Chọn nhân viên:
        </label>
        <select
          value={selectedEmployee?.id || ""}
          onChange={(e) => {
            const employee = employees.find(
              (emp) => emp.id === parseInt(e.target.value)
            );
            setSelectedEmployee(employee);
            setMessage("");
            setHasFaceData(false);
            setAllowOverride(false);
            if (employee) {
              checkRegistrationStatus(employee.id);
            }
          }}
          style={{
            width: "100%",
            padding: "10px",
            border: "2px solid #ddd",
            borderRadius: "5px",
            fontSize: "16px",
          }}
          disabled={registrationStatus === "processing"}
        >
          <option value="">-- Chọn nhân viên --</option>
          {Array.isArray(employees) &&
            employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.ma_nhan_vien} - {employee.ten}
              </option>
            ))}
        </select>
      </div>

      {selectedEmployee && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>
            Thông tin nhân viên:
          </h4>
          <p>
            <strong>Mã:</strong> {selectedEmployee.ma_nhan_vien}
          </p>
          <p>
            <strong>Tên:</strong> {selectedEmployee.ten}
          </p>
          <p>
            <strong>Email:</strong> {selectedEmployee.email}
          </p>
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "5px",
            backgroundColor: message.includes("❌")
              ? "#f8d7da"
              : message.includes("✅")
              ? "#d4edda"
              : message.includes("ℹ️")
              ? "#d1ecf1"
              : "#fff3cd",
            color: message.includes("❌")
              ? "#721c24"
              : message.includes("✅")
              ? "#155724"
              : message.includes("ℹ️")
              ? "#0c5460"
              : "#856404",
            border: `1px solid ${
              message.includes("❌")
                ? "#f5c6cb"
                : message.includes("✅")
                ? "#c3e6cb"
                : message.includes("ℹ️")
                ? "#bee5eb"
                : "#ffeaa7"
            }`,
          }}
        >
          {message}
        </div>
      )}

      {/* Nếu đã có face-data, hiện nút thay mới */}
      {selectedEmployee && hasFaceData && !allowOverride && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={() => setAllowOverride(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            🔄 Thay mới khuôn mặt
          </button>
        </div>
      )}

      {/* Chỉ cho phép đăng ký khi chưa có face-data hoặc đã xác nhận thay mới */}
      {selectedEmployee && (!hasFaceData || allowOverride) && (
        <div style={{ textAlign: "center" }}>
          <FaceRecognition
            onRegisterFace={handleRegisterFace}
            mode="register"
            selectedEmployee={selectedEmployee}
            disabled={registrationStatus === "processing"}
          />
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#e9ecef",
          borderRadius: "5px",
        }}
      >
        <h4 style={{ color: "#495057", marginBottom: "15px" }}>
          📋 Hướng dẫn:
        </h4>
        <ul style={{ color: "#6c757d", lineHeight: "1.6" }}>
          <li>Chọn nhân viên cần đăng ký khuôn mặt</li>
          <li>Đảm bảo ánh sáng đủ và khuôn mặt rõ nét</li>
          <li>Nhìn thẳng vào camera và giữ yên</li>
          <li>Chờ thanh tiến trình hoàn thành</li>
          <li>Mỗi nhân viên chỉ đăng ký một lần</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterFace;
