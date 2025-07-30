import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Row, Col, Card } from 'antd';
import { nhanVienService } from '../../../services/nhanVienService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const NhanVienForm = ({ employee, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        ma_nhan_vien: employee.ma_nhan_vien || '',
        ten: employee.ten || '',
        email: employee.email || '',
        so_dien_thoai: employee.so_dien_thoai || '',
        gioi_tinh: employee.gioi_tinh || 'nam',
        ngay_sinh: employee.ngay_sinh ? dayjs(employee.ngay_sinh) : null,
        dia_chi: employee.dia_chi || '',
        ngay_vao_lam: employee.ngay_vao_lam ? dayjs(employee.ngay_vao_lam) : null,
        luong_co_ban: employee.luong_co_ban || '',
        phong_ban_id: employee.phong_ban_id || null,
        chuc_vu_id: employee.chuc_vu_id || null,
        trang_thai: employee.trang_thai !== undefined ? employee.trang_thai : true,
      });
    }
  }, [employee, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : null,
        ngay_vao_lam: values.ngay_vao_lam ? values.ngay_vao_lam.format('YYYY-MM-DD') : null,
        trang_thai: values.trang_thai,
      };

      if (employee) {
        await nhanVienService.update(employee.id, formData);
        message.success('Cập nhật nhân viên thành công!');
      } else {
        await nhanVienService.create(formData);
        message.success('Thêm nhân viên thành công!');
      }
      onSuccess();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error.message || 'Không thể lưu nhân viên'));
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={employee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gioi_tinh: 'nam',
          trang_thai: true,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ma_nhan_vien"
              label="Mã nhân viên"
              rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
            >
              <Input placeholder="Nhập mã nhân viên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ten"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="so_dien_thoai"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gioi_tinh"
              label="Giới tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="nam">Nam</Option>
                <Option value="nu">Nữ</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="ngay_sinh"
              label="Ngày sinh"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="ngay_vao_lam"
              label="Ngày vào làm"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày vào làm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phong_ban_id"
              label="Phòng ban"
            >
              <Select placeholder="Chọn phòng ban" allowClear>
                <Option value={1}>Phòng Kỹ thuật</Option>
                <Option value={2}>Phòng Nhân sự</Option>
                <Option value={3}>Phòng Kế toán</Option>
                <Option value={4}>Phòng Marketing</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="chuc_vu_id"
              label="Chức vụ"
            >
              <Select placeholder="Chọn chức vụ" allowClear>
                <Option value={1}>Nhân viên</Option>
                <Option value={2}>Trưởng nhóm</Option>
                <Option value={3}>Quản lý</Option>
                <Option value={4}>Giám đốc</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="luong_co_ban"
              label="Lương cơ bản"
            >
              <Input placeholder="Nhập lương cơ bản" type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="trang_thai"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Select placeholder="Chọn trạng thái">
                <Option value={true}>Đang làm việc</Option>
                <Option value={false}>Đã nghỉ việc</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="dia_chi"
          label="Địa chỉ"
        >
          <TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            {employee ? 'Cập nhật' : 'Thêm'}
          </Button>
          <Button onClick={onCancel}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NhanVienForm;