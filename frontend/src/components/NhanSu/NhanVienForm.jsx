import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  message,
  Card,
  Divider,
  Switch,
  InputNumber,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { nhanVienService } from "../../services/nhanVienService";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const NhanVienForm = ({ mode, nhanVien, formData, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);

  // Khởi tạo form khi có dữ liệu nhân viên (chế độ edit)
  useEffect(() => {
    if (nhanVien && mode === "edit") {
      form.setFieldsValue({
        ...nhanVien,
        ngay_sinh: nhanVien.ngay_sinh ? dayjs(nhanVien.ngay_sinh) : null,
        ngay_vao_lam: nhanVien.ngay_vao_lam
          ? dayjs(nhanVien.ngay_vao_lam)
          : null,
      });

      if (nhanVien.anh_dai_dien) {
        setImageUrl(
          `${process.env.REACT_APP_API_URL}/storage/${nhanVien.anh_dai_dien}`
        );
        setFileList([
          {
            uid: "-1",
            name: "avatar.jpg",
            status: "done",
            url: `${process.env.REACT_APP_API_URL}/storage/${nhanVien.anh_dai_dien}`,
          },
        ]);
      }
    }
  }, [nhanVien, mode, form]);

  // Xử lý upload ảnh
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('Form values:', values);
      
      // Xử lý dữ liệu trước khi gửi
      const formData = new FormData();

      // Thêm các trường cơ bản
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === "ngay_sinh" || key === "ngay_vao_lam") {
            formData.append(key, values[key].format("YYYY-MM-DD"));
          } else if (key === "trang_thai") {
            // Chuyển đổi boolean thành integer
            formData.append(key, values[key] ? "1" : "0");
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Thêm ảnh đại diện nếu có
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("anh_dai_dien", fileList[0].originFileObj);
      }

      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      let response;
      if (mode === "add") {
        console.log('Creating new employee...');
        response = await nhanVienService.create(formData);
      } else {
        console.log('Updating employee...');
        response = await nhanVienService.update(nhanVien.id, formData);
      }

      console.log('API Response:', response);

      if (response.success) {
        message.success(
          mode === "add"
            ? "Thêm nhân viên thành công"
            : "Cập nhật nhân viên thành công"
        );
        onSuccess();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      // Kiểm tra xem có phải là lỗi validation không
      if (error.status === 422 && error.response && error.response.errors) {
        Object.keys(error.response.errors).forEach((key) => {
          message.error(error.response.errors[key][0]);
        });
        return;
      }

      // Hiển thị lỗi chung
      message.error(
        "Có lỗi xảy ra khi lưu thông tin nhân viên: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Upload props
  const uploadProps = {
    fileList,
    onChange: handleUploadChange,
    beforeUpload: () => false, // Không tự động upload
    listType: "picture-card",
    maxCount: 1,
    accept: "image/*",
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        trang_thai: true,
        gioi_tinh: "nam",
      }}
    >
      {/* Thông tin cơ bản */}
      <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ma_nhan_vien"
              label="Mã nhân viên"
              rules={[
                { required: true, message: "Vui lòng nhập mã nhân viên" },
                { max: 20, message: "Mã nhân viên không được quá 20 ký tự" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập mã nhân viên"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ten"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { max: 255, message: "Họ và tên không được quá 255 ký tự" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không đúng định dạng" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="so_dien_thoai"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { max: 15, message: "Số điện thoại không được quá 15 ký tự" },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gioi_tinh"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
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
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày sinh"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="trang_thai"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Đang làm việc"
                unCheckedChildren="Đã nghỉ"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="dia_chi"
          label="Địa chỉ"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ" },
            { max: 500, message: "Địa chỉ không được quá 500 ký tự" },
          ]}
        >
          <TextArea
            prefix={<HomeOutlined />}
            placeholder="Nhập địa chỉ"
            rows={3}
          />
        </Form.Item>
      </Card>

      {/* Thông tin công việc */}
      <Card title="Thông tin công việc" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phong_ban_id"
              label="Phòng ban"
              rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
            >
              <Select placeholder="Chọn phòng ban">
                {formData.phong_bans?.map((pb) => (
                  <Option key={pb.id} value={pb.id}>
                    {pb.ten}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="chuc_vu_id"
              label="Chức vụ"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
            >
              <Select placeholder="Chọn chức vụ">
                {formData.chuc_vus?.map((cv) => (
                  <Option key={cv.id} value={cv.id}>
                    {cv.ten}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ngay_vao_lam"
              label="Ngày vào làm"
              rules={[
                { required: true, message: "Vui lòng chọn ngày vào làm" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày vào làm"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="luong_co_ban"
              label="Lương cơ bản"
              rules={[
                { required: true, message: "Vui lòng nhập lương cơ bản" },
                {
                  type: "number",
                  min: 0,
                  message: "Lương cơ bản phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập lương cơ bản"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Thông tin cá nhân */}
      <Card title="Thông tin cá nhân" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cmnd_cccd"
              label="CMND/CCCD"
              rules={[
                { max: 20, message: "CMND/CCCD không được quá 20 ký tự" },
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Nhập CMND/CCCD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="noi_sinh"
              label="Nơi sinh"
              rules={[
                { max: 255, message: "Nơi sinh không được quá 255 ký tự" },
              ]}
            >
              <Input placeholder="Nhập nơi sinh" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="dan_toc"
              label="Dân tộc"
              rules={[{ max: 50, message: "Dân tộc không được quá 50 ký tự" }]}
            >
              <Input placeholder="Nhập dân tộc" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="ton_giao"
              label="Tôn giáo"
              rules={[{ max: 50, message: "Tôn giáo không được quá 50 ký tự" }]}
            >
              <Input placeholder="Nhập tôn giáo" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="tinh_trang_hon_nhan"
              label="Tình trạng hôn nhân"
              rules={[
                {
                  max: 50,
                  message: "Tình trạng hôn nhân không được quá 50 ký tự",
                },
              ]}
            >
              <Select placeholder="Chọn tình trạng hôn nhân" allowClear>
                <Option value="Độc thân">Độc thân</Option>
                <Option value="Đã kết hôn">Đã kết hôn</Option>
                <Option value="Ly hôn">Ly hôn</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Ảnh đại diện */}
      <Card title="Ảnh đại diện" style={{ marginBottom: 16 }}>
        <Form.Item name="anh_dai_dien">
          <Upload {...uploadProps}>
            {fileList.length < 1 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Card>

      {/* Buttons */}
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Hủy
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {mode === "add" ? "Thêm nhân viên" : "Cập nhật"}
        </Button>
      </div>
    </Form>
  );
};

export default NhanVienForm;
