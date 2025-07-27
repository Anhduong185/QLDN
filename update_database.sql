-- Cập nhật database để thêm các trường mới vào bảng nhan_vien
USE qldn_nhansu;

-- Thêm các trường mới vào bảng nhan_vien
ALTER TABLE nhan_vien 
ADD COLUMN ngay_vao_lam DATE NULL AFTER dia_chi,
ADD COLUMN luong_co_ban DECIMAL(12,2) NULL AFTER ngay_vao_lam,
ADD COLUMN cmnd_cccd VARCHAR(255) NULL AFTER luong_co_ban,
ADD COLUMN noi_sinh VARCHAR(255) NULL AFTER cmnd_cccd,
ADD COLUMN dan_toc VARCHAR(255) NULL AFTER noi_sinh,
ADD COLUMN ton_giao VARCHAR(255) NULL AFTER dan_toc,
ADD COLUMN tinh_trang_hon_nhan VARCHAR(255) NULL AFTER ton_giao;

-- Tạo bảng du_lieu_khuon_mat nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS du_lieu_khuon_mat (
  id bigint unsigned NOT NULL AUTO_INCREMENT,
  nhan_vien_id bigint unsigned NOT NULL,
  du_lieu_khuon_mat json NOT NULL,
  created_at timestamp NULL DEFAULT NULL,
  updated_at timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY du_lieu_khuon_mat_nhan_vien_id_unique (nhan_vien_id),
  CONSTRAINT du_lieu_khuon_mat_nhan_vien_id_foreign FOREIGN KEY (nhan_vien_id) REFERENCES nhan_vien (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cập nhật dữ liệu mẫu cho các trường mới
UPDATE nhan_vien SET 
ngay_vao_lam = '2024-01-01',
luong_co_ban = 15000000.00,
cmnd_cccd = '123456789012',
noi_sinh = 'Hà Nội',
dan_toc = 'Kinh',
ton_giao = 'Không',
tinh_trang_hon_nhan = 'Độc thân'
WHERE id = 1;

UPDATE nhan_vien SET 
ngay_vao_lam = '2024-02-01',
luong_co_ban = 12000000.00,
cmnd_cccd = '987654321098',
noi_sinh = 'TP.HCM',
dan_toc = 'Kinh',
ton_giao = 'Không',
tinh_trang_hon_nhan = 'Đã kết hôn'
WHERE id = 2;

-- Thêm migration record
INSERT INTO migrations (migration, batch) VALUES 
('2025_07_26_211826_add_fields_to_nhan_vien_table', 5),
('2025_07_26_211827_create_du_lieu_khuon_mat_table', 5)
ON DUPLICATE KEY UPDATE batch = 5; 