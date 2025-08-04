import React from "react";
import { Descriptions, Avatar, Tag, Card, Row, Col, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const NhanVienDetail = ({ nhanVien }) => {
  if (!nhanVien) return null;

  const formatDate = (date) => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "Chưa cập nhật";
  };

  const formatCurrency = (amount) => {
    return amount
      ? new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ"
      : "Chưa cập nhật";
  };

  return (
    <div>
      {/* Header với ảnh và thông tin cơ bản */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar
              size={80}
              src={
                nhanVien.anh_dai_dien
                  ? `${process.env.REACT_APP_API_URL}/storage/${nhanVien.anh_dai_dien}`
                  : null
              }
              icon={<UserOutlined />}
            />
          </Col>
          <Col flex="auto">
            <h2 style={{ margin: 0, marginBottom: 8 }}>{nhanVien.ten}</h2>
            <p style={{ margin: 0, color: "#666" }}>
              Mã nhân viên: {nhanVien.ma_nhan_vien}
            </p>
            <Tag
              color={nhanVien.trang_thai ? "green" : "red"}
              style={{ marginTop: 8 }}
            >
              {nhanVien.trang_thai ? "Đang làm việc" : "Đã nghỉ"}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Thông tin cơ bản */}
      <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Họ và tên" span={2}>
            {nhanVien.ten}
          </Descriptions.Item>
          <Descriptions.Item label="Mã nhân viên">
            {nhanVien.ma_nhan_vien}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{nhanVien.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {nhanVien.so_dien_thoai || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {nhanVien.gioi_tinh === "nam" ? "Nam" : "Nữ"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {formatDate(nhanVien.ngay_sinh)}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {nhanVien.dia_chi || "Chưa cập nhật"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Thông tin công việc */}
      <Card title="Thông tin công việc" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Phòng ban">
            {nhanVien.phong_ban?.ten || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Chức vụ">
            {nhanVien.chuc_vu?.ten || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày vào làm">
            {formatDate(nhanVien.ngay_vao_lam)}
          </Descriptions.Item>
          <Descriptions.Item label="Lương cơ bản">
            {formatCurrency(nhanVien.luong_co_ban)}
          </Descriptions.Item>
          <Descriptions.Item label="Ca làm việc">
            {nhanVien.caLamViec?.ten || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={nhanVien.trang_thai ? "green" : "red"}>
              {nhanVien.trang_thai ? "Đang làm việc" : "Đã nghỉ"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Thông tin cá nhân */}
      <Card title="Thông tin cá nhân" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="CMND/CCCD">
            {nhanVien.cmnd_cccd || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Nơi sinh">
            {nhanVien.noi_sinh || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Dân tộc">
            {nhanVien.dan_toc || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Tôn giáo">
            {nhanVien.ton_giao || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Tình trạng hôn nhân">
            {nhanVien.tinh_trang_hon_nhan || "Chưa cập nhật"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Thông tin hệ thống */}
      <Card title="Thông tin hệ thống">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Ngày tạo">
            {formatDate(nhanVien.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {formatDate(nhanVien.updated_at)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default NhanVienDetail;
