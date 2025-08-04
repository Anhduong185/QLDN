# Hệ Thống Quản Lý Nhân Sự & Chấm Công

Hệ thống quản lý nhân sự và chấm công với nhận diện khuôn mặt, được xây dựng bằng Laravel (Backend) và React (Frontend).

## 🚀 Tính Năng Chính

### Nhân Sự

- ✅ Quản lý nhân viên (CRUD)
- ✅ Quản lý phòng ban
- ✅ Quản lý chức vụ
- ✅ Dashboard thống kê nhân sự
- ✅ Upload ảnh đại diện
- ✅ Tìm kiếm và phân trang

### Chấm Công

- ✅ Chấm công bằng nhận diện khuôn mặt
- ✅ Đăng ký khuôn mặt cho nhân viên
- ✅ Dashboard thống kê chấm công
- ✅ Lịch sử chấm công
- ✅ Xuất báo cáo Excel
- ✅ Access logs

### Nghỉ Phép

- ✅ Quản lý đơn nghỉ phép
- ✅ Phê duyệt đơn nghỉ phép

## 🛠️ Cài Đặt & Chạy

### Backend (Laravel)

```bash
cd backend

# Cài đặt dependencies
composer install

# Copy file env
cp .env.example .env

# Tạo key ứng dụng
php artisan key:generate

# Cấu hình database trong .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=qlns
DB_USERNAME=root
DB_PASSWORD=

# Chạy migration
php artisan migrate

# Chạy seeder (tùy chọn)
php artisan db:seed

# Khởi động server
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend (React)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm start
```

## 📊 API Endpoints

### Nhân Viên

- `GET /api/nhan-vien` - Lấy danh sách nhân viên
- `POST /api/nhan-vien` - Thêm nhân viên mới
- `GET /api/nhan-vien/{id}` - Chi tiết nhân viên
- `PUT /api/nhan-vien/{id}` - Cập nhật nhân viên
- `DELETE /api/nhan-vien/{id}` - Xóa nhân viên
- `GET /api/nhan-vien/dashboard` - Dashboard nhân sự
- `GET /api/nhan-vien/form-data` - Dữ liệu form (phòng ban, chức vụ)

### Chấm Công

- `POST /api/cham-cong/check-in` - Chấm công
- `POST /api/cham-cong/register-face` - Đăng ký khuôn mặt
- `GET /api/cham-cong/dashboard` - Dashboard chấm công
- `GET /api/cham-cong/access-logs` - Lịch sử truy cập
- `GET /api/cham-cong/export-excel` - Xuất Excel

### Nghỉ Phép

- `GET /api/don-nghi-phep` - Danh sách đơn nghỉ phép
- `POST /api/don-nghi-phep` - Tạo đơn nghỉ phép
- `PATCH /api/don-nghi-phep/{id}/approve` - Phê duyệt đơn

## 🎯 Dashboard Features

### Dashboard Nhân Sự

- 📈 Tổng nhân viên, đang làm việc, đã nghỉ
- 📊 Thống kê theo phòng ban
- 📊 Thống kê theo chức vụ
- 📊 Thống kê theo giới tính
- 📈 Nhân viên mới (tháng/tuần)
- 📊 Tỷ lệ nhân viên đang làm việc

### Dashboard Chấm Công

- 📈 Tổng ngày công, có chấm công, tỷ lệ chấm công
- 📊 Thống kê theo trạng thái (đúng giờ, đi muộn, về sớm, vắng)
- 📊 Thống kê theo phòng ban
- 📊 Thống kê theo ngày trong tuần
- 🏆 Top nhân viên đúng giờ
- 📊 Thống kê theo giờ chấm công
- 📈 Thống kê hôm nay, tuần này, tháng này

## 🔧 Test API

### Test Dashboard Nhân Sự

```bash
curl -X GET "http://localhost:8000/api/nhan-vien/dashboard" \
  -H "Accept: application/json"
```

### Test Dashboard Chấm Công

```bash
curl -X GET "http://localhost:8000/api/cham-cong/dashboard" \
  -H "Accept: application/json"
```

### Test với Parameters

```bash
# Dashboard chấm công với khoảng thời gian
curl -X GET "http://localhost:8000/api/cham-cong/dashboard?from=2025-07-01&to=2025-07-31" \
  -H "Accept: application/json"

# Dashboard chấm công theo phòng ban
curl -X GET "http://localhost:8000/api/cham-cong/dashboard?phong_ban_id=1" \
  -H "Accept: application/json"
```

## 📱 Giao Diện

### Trang Chủ

- Dashboard tổng quan
- Thống kê real-time
- Navigation menu

### Quản Lý Nhân Sự

- Danh sách nhân viên với tìm kiếm
- Form thêm/sửa nhân viên
- Upload ảnh đại diện
- Dashboard thống kê

### Chấm Công

- Giao diện chấm công bằng khuôn mặt
- Đăng ký khuôn mặt
- Dashboard thống kê chi tiết
- Lịch sử chấm công

## 🗄️ Database Schema

### Bảng chính

- `nhan_vien` - Thông tin nhân viên
- `phong_ban` - Phòng ban
- `chuc_vu` - Chức vụ
- `cham_cong` - Dữ liệu chấm công
- `access_logs` - Lịch sử truy cập
- `face_data` - Dữ liệu khuôn mặt
- `don_nghi_phep` - Đơn nghỉ phép

## 🔒 Bảo Mật

- Xác thực khuôn mặt với độ chính xác cao
- Validation dữ liệu đầu vào
- CORS configuration
- File upload security

## 📈 Performance

- Lazy loading cho danh sách lớn
- Pagination cho tất cả danh sách
- Caching cho thống kê
- Optimized queries với eager loading

## 🚀 Deployment

### Production

1. Cấu hình environment variables
2. Chạy `composer install --optimize-autoloader --no-dev`
3. Chạy `npm run build` cho frontend
4. Cấu hình web server (Apache/Nginx)
5. Setup database và chạy migrations

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue hoặc liên hệ team phát triển.

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 2025-01-27
