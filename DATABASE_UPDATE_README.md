# Hướng dẫn cập nhật Database

## Tổng quan
Database hiện tại cần được cập nhật để thêm các trường mới vào bảng `nhan_vien` và tạo bảng `du_lieu_khuon_mat` mới.

## Các thay đổi cần thực hiện

### 1. Thêm trường mới vào bảng `nhan_vien`
- `ngay_vao_lam` (DATE) - Ngày vào làm
- `luong_co_ban` (DECIMAL(12,2)) - Lương cơ bản
- `cmnd_cccd` (VARCHAR(255)) - CMND/CCCD
- `noi_sinh` (VARCHAR(255)) - Nơi sinh
- `dan_toc` (VARCHAR(255)) - Dân tộc
- `ton_giao` (VARCHAR(255)) - Tôn giáo
- `tinh_trang_hon_nhan` (VARCHAR(255)) - Tình trạng hôn nhân

### 2. Tạo bảng mới `du_lieu_khuon_mat`
- Bảng lưu trữ dữ liệu khuôn mặt cho nhận diện

## Cách thực hiện

### Phương pháp 1: Sử dụng Laravel Migration
```bash
cd backend
php artisan migrate
```

### Phương pháp 2: Sử dụng SQL trực tiếp
```bash
# Chạy script PowerShell
powershell -ExecutionPolicy Bypass -File run_sql_update.ps1

# Hoặc chạy SQL trực tiếp trong MySQL
mysql -u root -p qldn_nhansu < update_database.sql
```

### Phương pháp 3: Chạy từng lệnh SQL
1. Kết nối vào MySQL
2. Chạy các lệnh trong file `update_database.sql`

## Kiểm tra sau khi cập nhật

### Kiểm tra cấu trúc bảng
```sql
DESCRIBE nhan_vien;
DESCRIBE du_lieu_khuon_mat;
```

### Kiểm tra dữ liệu
```sql
SELECT * FROM nhan_vien LIMIT 5;
SELECT * FROM du_lieu_khuon_mat LIMIT 5;
```

## Lưu ý
- Backup database trước khi cập nhật
- Kiểm tra kết nối database trong file `.env`
- Đảm bảo quyền truy cập database
- Test ứng dụng sau khi cập nhật

## Troubleshooting

### Lỗi thường gặp
1. **Lỗi kết nối database**: Kiểm tra thông tin kết nối trong `.env`
2. **Lỗi quyền truy cập**: Đảm bảo user MySQL có quyền ALTER, CREATE
3. **Lỗi migration**: Xóa cache và chạy lại `php artisan config:clear`

### Rollback nếu cần
```sql
-- Xóa bảng du_lieu_khuon_mat
DROP TABLE IF EXISTS du_lieu_khuon_mat;

-- Xóa các cột mới trong nhan_vien
ALTER TABLE nhan_vien 
DROP COLUMN ngay_vao_lam,
DROP COLUMN luong_co_ban,
DROP COLUMN cmnd_cccd,
DROP COLUMN noi_sinh,
DROP COLUMN dan_toc,
DROP COLUMN ton_giao,
DROP COLUMN tinh_trang_hon_nhan;
``` 