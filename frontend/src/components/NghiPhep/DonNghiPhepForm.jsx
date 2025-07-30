<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  Card,
  message,
} from "antd";
import { nghiPhepService } from "../../services/nghiPhepService";
import { nhanVienService } from "../../services/nhanVienService";
=======
import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, TimePicker, Select, Button, Card, message } from 'antd';
import { nghiPhepService } from '../../services/nghiPhepService';
import { nhanVienService } from '../../services/nhanVienService';
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08

const DonNghiPhepForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [nhanVienList, setNhanVienList] = useState([]);

  useEffect(() => {
    // Gọi API lấy danh sách nhân viên
<<<<<<< HEAD
    nhanVienService
      .getList()
      .then((response) => {
        console.log("NhanVien response:", response);
        // Kiểm tra cấu trúc response và lấy data
        const data = response.data || response || [];
        setNhanVienList(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Lỗi lấy danh sách nhân viên:", error);
        setNhanVienList([]);
      });
  }, []);

  const onFinish = async (values) => {
    console.log("Submit values:", values);
    try {
      const res = await nghiPhepService.create({
        ...values,
        ngay_nghi: values.ngay_nghi.format("YYYY-MM-DD"),
        thoi_gian_bat_dau: values.thoi_gian_bat_dau
          ? values.thoi_gian_bat_dau.format("HH:mm")
          : undefined,
        thoi_gian_ket_thuc: values.thoi_gian_ket_thuc
          ? values.thoi_gian_ket_thuc.format("HH:mm")
          : undefined,
      });
      console.log("Kết quả gửi đơn:", res);
      if (res.success) {
        message.success("Gửi đơn thành công!");
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        message.error("Gửi đơn thất bại!");
      }
    } catch (err) {
      console.error("Lỗi gửi đơn:", err);
      message.error("Gửi đơn thất bại!");
=======
    // Giả sử có nhanVienService.getAll()
    nhanVienService.getAll().then(data => setNhanVienList(data));
  }, []);

  const onFinish = async (values) => {
    console.log('Submit values:', values);
    try {
      const res = await nghiPhepService.create({
        ...values,
        ngay_nghi: values.ngay_nghi.format('YYYY-MM-DD'),
        thoi_gian_bat_dau: values.thoi_gian_bat_dau ? values.thoi_gian_bat_dau.format('HH:mm') : undefined,
        thoi_gian_ket_thuc: values.thoi_gian_ket_thuc ? values.thoi_gian_ket_thuc.format('HH:mm') : undefined
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
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
    }
  };

  return (
<<<<<<< HEAD
    <Card
      title="Gửi đơn nghỉ phép"
      style={{ maxWidth: 500, margin: "32px auto" }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="nhan_vien_id"
          label="Nhân viên"
          rules={[{ required: true }]}
        >
          <Select showSearch optionFilterProp="children">
            {nhanVienList.map((nv) => (
=======
    <Card title="Gửi đơn nghỉ phép" style={{ maxWidth: 500, margin: '32px auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="nhan_vien_id" label="Nhân viên" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="children">
            {nhanVienList.map(nv => (
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
              <Select.Option key={nv.id} value={nv.id}>
                {nv.ma_nhan_vien} - {nv.ten}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
<<<<<<< HEAD
        <Form.Item
          name="ngay_nghi"
          label="Ngày nghỉ"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} />
=======
        <Form.Item name="ngay_nghi" label="Ngày nghỉ" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
        </Form.Item>
        <Form.Item name="loai_nghi" label="Loại nghỉ" initialValue="ca_ngay">
          <Select>
            <Select.Option value="ca_ngay">Cả ngày</Select.Option>
            <Select.Option value="nua_ngay">Nửa ngày</Select.Option>
            <Select.Option value="theo_gio">Theo giờ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="thoi_gian_bat_dau" label="Thời gian bắt đầu">
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item name="thoi_gian_ket_thuc" label="Thời gian kết thúc">
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item name="ly_do" label="Lý do">
          <Input />
        </Form.Item>
        <Form.Item>
<<<<<<< HEAD
          <Button type="primary" htmlType="submit">
            Gửi đơn
          </Button>
=======
          <Button type="primary" htmlType="submit">Gửi đơn</Button>
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
        </Form.Item>
      </Form>
    </Card>
  );
};

<<<<<<< HEAD
export default DonNghiPhepForm;
=======
export default DonNghiPhepForm; 
>>>>>>> 64dbba14ae7d76430187779ddff4ddd3c2d5da08
