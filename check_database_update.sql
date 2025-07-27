-- Script kiểm tra cấu trúc database sau khi cập nhật
USE qldn_nhansu;

-- Kiểm tra cấu trúc bảng nhan_vien
DESCRIBE nhan_vien;

-- Kiểm tra bảng du_lieu_khuon_mat có tồn tại không
SHOW TABLES LIKE 'du_lieu_khuon_mat';

-- Kiểm tra dữ liệu mẫu
SELECT id, ma_nhan_vien, ten, ngay_vao_lam, luong_co_ban, cmnd_cccd, noi_sinh, dan_toc, ton_giao, tinh_trang_hon_nhan 
FROM nhan_vien 
LIMIT 5;

-- Kiểm tra migration records
SELECT * FROM migrations WHERE migration LIKE '%2025_07_26%' ORDER BY id DESC; 