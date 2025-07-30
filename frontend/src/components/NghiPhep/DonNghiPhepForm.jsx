import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, TimePicker, Select, Button, Card, message } from 'antd';
import { nghiPhepService } from '../../services/nghiPhepService';
import { nhanVienService } from '../../services/nhanVienService';

const DonNghiPhepForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [nhanVienList, setNhanVienList] = useState([]);

  useEffect(() => {
    // Gọi API lấy danh sách nhân viên
    nhanVienService
      .getAll()
      .then((response) => {
        console.log('NhanVien response:', response);
        // Kiểm tra cấu trúc response và lấy data
        const data = response.data || response || [];
        setNhanVienList(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Lỗi lấy danh sách nhân viên:', error);
        setNhanVienList([]);
      });
  }, []);

  const onFinish = async (values) => {
    console.log('Submit values:', values);
    try {
      const res = await nghiPhepService.create({
        ...values,
        ngay_nghi: values.ngay_nghi.format('YYYY-MM-DD'),
        thoi_gian_bat_dau: values.thoi_gian_bat_dau
          ? values.thoi_gian_bat_dau.format('HH:mm')
          : undefined,
        thoi_gian_ket_thuc: values.thoi_gian_ket_thuc
          ? values.thoi_gian_ket_thuc.format('HH:mm')
          : undefined,
      });
      console.log('Kết quả gửi đơn:', res);
      if (res.success) {
        message.success('Gửi đơn thành công!');
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        message.error('Gửi đơn thất bại!');
      }
    } catch (err) {
      console.error('Lỗi gửi đơn:', err);
      message.error('Gửi đơn thất bại!');
    }
  };

  return (
    <Card
      title="Gửi đơn nghỉ phép"
      style={{ maxWidth: 500, margin: '32px auto' }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="nhan_vien_id"
          label="Nhân viên"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
        >
          <Select placeholder="Chọn nhân viên">
            {nhanVienList.map((nhanVien) => (
              <Select.Option key={nhanVien.id} value={nhanVien.id}>
                {nhanVien.ma_nhan_vien} - {nhanVien.ten}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="loai_nghi"
          label="Loại nghỉ"
          rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ!' }]}
        >
          <Select placeholder="Chọn loại nghỉ">
            <Select.Option value="nghi_phep">Nghỉ phép</Select.Option>
            <Select.Option value="nghi_om">Nghỉ ốm</Select.Option>
            <Select.Option value="nghi_khac">Nghỉ khác</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="ngay_nghi"
          label="Ngày nghỉ"
          rules={[{ required: true, message: 'Vui lòng chọn ngày nghỉ!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="thoi_gian_bat_dau"
          label="Thời gian bắt đầu"
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="thoi_gian_ket_thuc"
          label="Thời gian kết thúc"
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="ly_do"
          label="Lý do"
          rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập lý do nghỉ phép..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Gửi đơn
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DonNghiPhepForm;
