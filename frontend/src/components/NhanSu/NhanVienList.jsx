import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Tooltip,
  Badge,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import NhanVienForm from "./NhanVienForm";
import NhanVienDetail from "./NhanVienDetail";
import { nhanVienService } from "../../services/nhanVienService";

const { Search } = Input;
const { Option } = Select;

const NhanVienList = () => {
  const [nhanVienList, setNhanVienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    phong_ban_id: "",
    chuc_vu_id: "",
    trang_thai: "",
  });
  const [formData, setFormData] = useState({
    phong_bans: [],
    chuc_vus: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'edit'

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadFormData();
    loadNhanVienList();
  }, []);

  // Load danh sách nhân viên
  const loadNhanVienList = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pageSize,
        ...filters,
      };

      const response = await nhanVienService.getList(params);
      if (response.success) {
        setNhanVienList(response.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.pagination.total,
        }));
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu cho form (phòng ban, chức vụ)
  const loadFormData = async () => {
    try {
      const response = await nhanVienService.getFormData();
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu form");
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadNhanVienList(1, pagination.pageSize);
  };

  // Xử lý lọc
  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadNhanVienList(1, pagination.pageSize);
  };

  // Xử lý phân trang
  const handleTableChange = (pagination) => {
    loadNhanVienList(pagination.current, pagination.pageSize);
  };

  // Mở modal thêm mới
  const handleAdd = () => {
    setFormMode("add");
    setSelectedNhanVien(null);
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (record) => {
    setFormMode("edit");
    setSelectedNhanVien(record);
    setModalVisible(true);
  };

  // Mở modal xem chi tiết
  const handleView = async (record) => {
    try {
      const response = await nhanVienService.getById(record.id);
      if (response.success) {
        setSelectedNhanVien(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error("Lỗi khi tải thông tin nhân viên");
    }
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    try {
      const response = await nhanVienService.delete(id);
      if (response.success) {
        message.success("Xóa nhân viên thành công");
        loadNhanVienList(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error("Lỗi khi xóa nhân viên");
    }
  };

  // Xử lý sau khi thêm/sửa thành công
  const handleFormSuccess = () => {
    setModalVisible(false);
    loadNhanVienList(pagination.current, pagination.pageSize);
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: "Mã NV",
      dataIndex: "ma_nhan_vien",
      key: "ma_nhan_vien",
      width: 100,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Ảnh",
      dataIndex: "anh_dai_dien",
      key: "anh_dai_dien",
      width: 60,
      render: (text, record) => (
        <Avatar
          size={40}
          src={text ? `${process.env.REACT_APP_API_URL}/storage/${text}` : null}
          icon={<UserOutlined />}
        />
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "ten",
      key: "ten",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "so_dien_thoai",
      key: "so_dien_thoai",
      width: 120,
    },
    {
      title: "Phòng ban",
      dataIndex: ["phong_ban", "ten"],
      key: "phong_ban",
      width: 120,
    },
    {
      title: "Chức vụ",
      dataIndex: ["chuc_vu", "ten"],
      key: "chuc_vu",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 100,
      render: (trang_thai) => (
        <Tag color={trang_thai ? "green" : "red"}>
          {trang_thai ? "Đang làm việc" : "Đã nghỉ"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa nhân viên này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <h2 style={{ margin: 0 }}>Quản lý nhân viên</h2>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm nhân viên
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm theo tên, mã NV, email..."
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Phòng ban"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) => handleFilter("phong_ban_id", value)}
            >
              {formData.phong_bans?.map((pb) => (
                <Option key={pb.id} value={pb.id}>
                  {pb.ten}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Chức vụ"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) => handleFilter("chuc_vu_id", value)}
            >
              {formData.chuc_vus?.map((cv) => (
                <Option key={cv.id} value={cv.id}>
                  {cv.ten}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) => handleFilter("trang_thai", value)}
            >
              <Option value={1}>Đang làm việc</Option>
              <Option value={0}>Đã nghỉ</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilters({
                  search: "",
                  phong_ban_id: "",
                  chuc_vu_id: "",
                  trang_thai: "",
                });
                loadNhanVienList(1, pagination.pageSize);
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={nhanVienList}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal form thêm/sửa */}
      <Modal
        title={
          formMode === "add" ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên"
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <NhanVienForm
          mode={formMode}
          nhanVien={selectedNhanVien}
          formData={formData}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết nhân viên"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        <NhanVienDetail nhanVien={selectedNhanVien} />
      </Modal>
    </div>
  );
};

export default NhanVienList;
