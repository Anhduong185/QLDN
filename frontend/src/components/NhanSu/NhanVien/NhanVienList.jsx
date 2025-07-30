import React, { useState, useEffect } from 'react';
import { nhanVienService } from '../../../services/nhanVienService';
import NhanVienForm from './NhanVienForm';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Table,
  Button,
  Space,
  Card,
  Input,
  Select,
  Modal,
  message,
  Tag,
  Tooltip,
  Descriptions,
  Avatar,
} from 'antd';

const { Search } = Input;

const NhanVienList = () => {
  const [nhanViens, setNhanViens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchNhanViens();
  }, []);

  const fetchNhanViens = async () => {
    try {
      setLoading(true);
      const response = await nhanVienService.getAll();
      setNhanViens(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách nhân viên');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchNhanViens();
    setShowForm(false);
    message.success('Thêm nhân viên thành công!');
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleViewDetail = (employee) => {
    setSelectedEmployee(employee);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa nhân viên này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await nhanVienService.delete(id);
          fetchNhanViens();
          message.success('Xóa nhân viên thành công!');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xóa nhân viên');
          console.error('Error deleting employee:', error);
        }
      },
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedEmployee(null);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      true: { color: 'green', text: 'Đang làm việc' },
      false: { color: 'red', text: 'Đã nghỉ việc' },
    };
    const config = statusConfig[status] || statusConfig.false;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const filteredNhanViens = nhanViens.filter((nhanVien) => {
    const matchesSearch = nhanVien.ten?.toLowerCase().includes(searchText.toLowerCase()) ||
                         nhanVien.ma_nhan_vien?.toLowerCase().includes(searchText.toLowerCase()) ||
                         nhanVien.email?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && nhanVien.trang_thai) ||
                         (filterStatus === 'inactive' && !nhanVien.trang_thai);
    
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'ma_nhan_vien',
      key: 'ma_nhan_vien',
      width: 120,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'ten',
      key: 'ten',
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'so_dien_thoai',
      key: 'so_dien_thoai',
      width: 150,
    },
    {
      title: 'Phòng ban',
      dataIndex: ['phong_ban', 'ten'],
      key: 'phong_ban',
      width: 150,
    },
    {
      title: 'Chức vụ',
      dataIndex: ['chuc_vu', 'ten'],
      key: 'chuc_vu',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>👥 Danh sách nhân viên</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
            >
              Thêm nhân viên
            </Button>
          </div>
        }
      >
        {/* Bộ lọc và tìm kiếm */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder="Tìm kiếm theo tên, mã NV, email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Đang làm việc' },
              { value: 'inactive', label: 'Đã nghỉ việc' },
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchNhanViens}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Bảng dữ liệu */}
        <Table
          columns={columns}
          dataSource={filteredNhanViens}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal form */}
      <Modal
        title={editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        width={800}
        destroyOnClose
      >
        <NhanVienForm
          employee={editingEmployee}
          onSuccess={handleAddSuccess}
          onCancel={handleCloseForm}
        />
      </Modal>

      {/* Modal chi tiết nhân viên */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            Chi tiết nhân viên
          </div>
        }
        open={showDetail}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            handleCloseDetail();
            handleEdit(selectedEmployee);
          }}>
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={handleCloseDetail}>
            Đóng
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        {selectedEmployee && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>{selectedEmployee.ten}</h2>
              <Tag color={selectedEmployee.trang_thai ? 'green' : 'red'}>
                {selectedEmployee.trang_thai ? 'Đang làm việc' : 'Đã nghỉ việc'}
              </Tag>
            </div>
            
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã nhân viên" span={2}>
                {selectedEmployee.ma_nhan_vien}
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {selectedEmployee.ten}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedEmployee.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedEmployee.so_dien_thoai}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedEmployee.ngay_sinh}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedEmployee.gioi_tinh === 'nam' ? 'Nam' : 'Nữ'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedEmployee.dia_chi}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                {selectedEmployee.phong_ban?.ten || 'Chưa phân công'}
              </Descriptions.Item>
              <Descriptions.Item label="Chức vụ">
                {selectedEmployee.chuc_vu?.ten || 'Chưa phân công'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày vào làm">
                {selectedEmployee.ngay_vao_lam}
              </Descriptions.Item>
              <Descriptions.Item label="Lương cơ bản">
                {selectedEmployee.luong_co_ban ? `${selectedEmployee.luong_co_ban.toLocaleString()} VNĐ` : 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NhanVienList;
