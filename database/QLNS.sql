-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping database structure for qldn_nhansu
CREATE DATABASE IF NOT EXISTS `qldn_nhansu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `qldn_nhansu`;

-- Dumping structure for table qldn_nhansu.access_logs
CREATE TABLE IF NOT EXISTS `access_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` bigint unsigned NOT NULL,
  `thoi_gian` timestamp NOT NULL,
  `loai_su_kien` enum('vao','ra') COLLATE utf8mb4_unicode_ci NOT NULL,
  `vi_tri` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `access_logs_nhan_vien_id_foreign` (`nhan_vien_id`),
  CONSTRAINT `access_logs_nhan_vien_id_foreign` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.access_logs: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.ai_model_updates
CREATE TABLE IF NOT EXISTS `ai_model_updates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `last_update` timestamp NOT NULL,
  `samples_added` int NOT NULL DEFAULT '0',
  `model_version` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `update_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.ai_model_updates: ~1 rows (approximately)
REPLACE INTO `ai_model_updates` (`id`, `last_update`, `samples_added`, `model_version`, `update_notes`, `created_at`, `updated_at`) VALUES
	(1, '2025-07-26 12:21:14', 1, '2', 'Cập nhật tự động từ dữ liệu mới', '2025-07-26 12:21:14', '2025-07-26 12:21:14');

-- Dumping structure for table qldn_nhansu.ca_lam_viec
CREATE TABLE IF NOT EXISTS `ca_lam_viec` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ten_ca` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gio_bat_dau` time NOT NULL,
  `gio_ket_thuc` time NOT NULL,
  `phut_tre_cho_phep` int NOT NULL DEFAULT '15',
  `phut_som_cho_phep` int NOT NULL DEFAULT '15',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.ca_lam_viec: ~3 rows (approximately)
REPLACE INTO `ca_lam_viec` (`id`, `ten_ca`, `gio_bat_dau`, `gio_ket_thuc`, `phut_tre_cho_phep`, `phut_som_cho_phep`, `active`, `created_at`, `updated_at`) VALUES
	(1, 'Ca Hành Chính', '08:00:00', '17:00:00', 30, 30, 1, '2025-07-23 17:04:16', '2025-07-23 17:04:16'),
	(2, 'Ca Sáng', '08:00:00', '12:00:00', 15, 15, 1, '2025-07-23 17:04:16', '2025-07-23 17:04:16'),
	(3, 'Ca Chiều', '13:00:00', '17:00:00', 15, 15, 1, '2025-07-23 17:04:16', '2025-07-23 17:04:16');

-- Dumping structure for table qldn_nhansu.cham_cong
CREATE TABLE IF NOT EXISTS `cham_cong` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` bigint unsigned NOT NULL,
  `ca_lam_viec_id` bigint unsigned DEFAULT NULL,
  `ngay` date NOT NULL,
  `gio_vao` time DEFAULT NULL,
  `gio_ra` time DEFAULT NULL,
  `trang_thai` enum('co_mat','vang_mat','tre','som') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'co_mat',
  `phut_tre` int NOT NULL DEFAULT '0',
  `phut_som` int NOT NULL DEFAULT '0',
  `gio_lam_thuc_te` decimal(4,2) NOT NULL DEFAULT '0.00',
  `gio_tang_ca` decimal(4,2) NOT NULL DEFAULT '0.00',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cham_cong_nhan_vien_id_ngay_unique` (`nhan_vien_id`,`ngay`),
  KEY `cham_cong_ca_lam_viec_id_foreign` (`ca_lam_viec_id`),
  CONSTRAINT `cham_cong_ca_lam_viec_id_foreign` FOREIGN KEY (`ca_lam_viec_id`) REFERENCES `ca_lam_viec` (`id`),
  CONSTRAINT `cham_cong_nhan_vien_id_foreign` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.cham_cong: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.chuc_vu
CREATE TABLE IF NOT EXISTS `chuc_vu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.chuc_vu: ~4 rows (approximately)
REPLACE INTO `chuc_vu` (`id`, `ten`, `mo_ta`, `created_at`, `updated_at`) VALUES
	(1, 'Giám Đốc', 'Quản lý toàn bộ công ty', '2025-07-23 17:04:15', '2025-07-23 17:04:15'),
	(2, 'Trưởng Phòng', 'Quản lý phòng ban', '2025-07-23 17:04:15', '2025-07-23 17:04:15'),
	(3, 'Nhân Viên', 'Nhân viên thực hiện', '2025-07-23 17:04:15', '2025-07-23 17:04:15'),
	(4, 'Thực Tập Sinh', 'Sinh viên thực tập', '2025-07-23 17:04:15', '2025-07-23 17:04:15');

-- Dumping structure for table qldn_nhansu.don_nghi_phep
CREATE TABLE IF NOT EXISTS `don_nghi_phep` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` bigint unsigned NOT NULL,
  `ngay_nghi` date NOT NULL,
  `loai_nghi` enum('ca_ngay','nua_ngay','theo_gio') COLLATE utf8mb4_unicode_ci NOT NULL,
  `thoi_gian_bat_dau` time DEFAULT NULL,
  `thoi_gian_ket_thuc` time DEFAULT NULL,
  `ly_do` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cho_duyet',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `don_nghi_phep_nhan_vien_id_foreign` (`nhan_vien_id`),
  CONSTRAINT `don_nghi_phep_nhan_vien_id_foreign` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.don_nghi_phep: ~1 rows (approximately)
REPLACE INTO `don_nghi_phep` (`id`, `nhan_vien_id`, `ngay_nghi`, `loai_nghi`, `thoi_gian_bat_dau`, `thoi_gian_ket_thuc`, `ly_do`, `trang_thai`, `created_at`, `updated_at`) VALUES
	(1, 1, '2025-07-26', 'ca_ngay', '08:00:00', '17:00:00', 'nghỉ phép', 'da_duyet', '2025-07-25 15:08:14', '2025-07-25 15:16:00');

-- Dumping structure for table qldn_nhansu.face_data
CREATE TABLE IF NOT EXISTS `face_data` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` bigint unsigned NOT NULL,
  `face_descriptor` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `face_data_nhan_vien_id_unique` (`nhan_vien_id`),
  CONSTRAINT `face_data_nhan_vien_id_foreign` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.face_data: ~1 rows (approximately)
REPLACE INTO `face_data` (`id`, `nhan_vien_id`, `face_descriptor`, `created_at`, `updated_at`) VALUES
	(3, 1, '"[-0.14381809532642365,0.08798973262310028,-0.007680714130401611,-0.11763159185647964,-0.09746211022138596,-0.082323357462883,-0.03147052973508835,-0.11237973719835281,0.14776447415351868,-0.07312624901533127,0.319862425327301,-0.08746138960123062,-0.2117408961057663,-0.16570447385311127,0.0426013320684433,0.18066199123859406,-0.12861625850200653,-0.12866835296154022,-0.05012203007936478,-0.0732957124710083,0.0050484295934438705,-0.06833767890930176,0.0039428891614079475,0.13620170950889587,-0.09727112948894501,-0.3382534682750702,-0.13430224359035492,-0.15482833981513977,0.027450010180473328,-0.07496155798435211,-0.09165523946285248,0.02171913906931877,-0.17518700659275055,-0.12916338443756104,0.02593662030994892,0.09653373062610626,-0.01605038158595562,-0.020049497485160828,0.16745388507843018,-0.037339985370635986,-0.14859125018119812,-0.026637524366378784,0.016002396121621132,0.25692492723464966,0.17622917890548706,0.026770614087581635,0.050409168004989624,-0.0493953675031662,0.08324158936738968,-0.12948496639728546,0.07262314856052399,0.09373459219932556,0.12939877808094025,0.054132238030433655,-0.007149551063776016,-0.11150190979242325,-0.025136645883321762,0.1540473848581314,-0.2160506397485733,-0.012515327893197536,0.029835529625415802,-0.07352297753095627,-0.11169123649597168,-0.09328528493642807,0.3333456516265869,0.15779922902584076,-0.15025998651981354,-0.1687518060207367,0.2129475176334381,-0.10846932232379913,-0.023711932823061943,0.060870543122291565,-0.19261373579502106,-0.15323323011398315,-0.27454325556755066,0.13274553418159485,0.37982943654060364,0.09716366976499557,-0.19814340770244598,0.016304846853017807,-0.11517570912837982,-0.01730593666434288,0.02181253209710121,0.0534520223736763,-0.020235780626535416,0.043379612267017365,-0.07517866790294647,0.015556837432086468,0.14540119469165802,-0.0790080577135086,0.011533315293490887,0.20650868117809296,-0.02366044372320175,0.09108065068721771,0.04871673509478569,0.032179396599531174,-0.05426188185811043,-0.005938076414167881,-0.1135227307677269,-0.004803544841706753,0.04067513719201088,-0.06465199589729309,0.021742140874266624,0.08357618004083633,-0.13810859620571136,0.0987391397356987,0.026136081665754318,0.017280660569667816,-0.05558481439948082,0.047252945601940155,-0.06420139968395233,-0.15822605788707733,0.14056943356990814,-0.24281883239746094,0.18544568121433258,0.16833074390888214,0.0730600580573082,0.12837257981300354,0.049058254808187485,0.06612195819616318,0.004113479517400265,-0.05506366491317749,-0.15241792798042297,0.02067994885146618,0.12319876253604889,-0.023058298975229263,0.06076323240995407,0.033040616661310196]"', '2025-07-25 15:33:32', '2025-07-25 15:33:32');

-- Dumping structure for table qldn_nhansu.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.migrations: ~17 rows (approximately)
REPLACE INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2014_10_12_000000_create_users_table', 1),
	(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
	(3, '2019_08_19_000000_create_failed_jobs_table', 1),
	(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(5, '2024_01_01_000000_create_nhan_vien_table', 1),
	(6, '2024_01_01_000002_create_face_data_table', 1),
	(7, '2024_01_02_000001_create_ca_lam_viec_table', 1),
	(8, '2024_01_02_000002_create_ngay_nghi_table', 1),
	(9, '2024_01_02_000004_create_cham_cong_table_new', 1),
	(10, '2025_07_22_150717_create_phong_ban_table', 1),
	(11, '2025_07_22_150718_create_chuc_vu_table', 1),
	(12, '2025_07_22_150719_create_tai_khoan_table', 1),
	(13, '2025_07_22_150720_create_du_lieu_khuon_mat_table', 1),
	(14, '2024_01_02_000004_create_cham_cong_table', 2),
	(15, '2024_01_03_000001_create_access_logs_table', 3),
	(16, '2024_01_03_000002_create_don_nghi_phep_table', 3),
	(17, '2025_07_26_000000_create_ai_model_updates_table', 4);

-- Dumping structure for table qldn_nhansu.ngay_nghi
CREATE TABLE IF NOT EXISTS `ngay_nghi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ten_ngay_nghi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_bat_dau` date NOT NULL,
  `ngay_ket_thuc` date NOT NULL,
  `loai` enum('le','tet','phep','khac') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'khac',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.ngay_nghi: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.nhan_vien
CREATE TABLE IF NOT EXISTS `nhan_vien` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gioi_tinh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_vao_lam` date DEFAULT NULL,
  `luong_co_ban` decimal(12,2) DEFAULT NULL,
  `cmnd_cccd` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noi_sinh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dan_toc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ton_giao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tinh_trang_hon_nhan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phong_ban_id` bigint unsigned DEFAULT NULL,
  `chuc_vu_id` bigint unsigned DEFAULT NULL,
  `anh_dai_dien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `ca_lam_viec_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nhan_vien_ma_nhan_vien_unique` (`ma_nhan_vien`),
  UNIQUE KEY `nhan_vien_email_unique` (`email`),
  KEY `fk_nhanvien_calamviec` (`ca_lam_viec_id`),
  CONSTRAINT `fk_nhanvien_calamviec` FOREIGN KEY (`ca_lam_viec_id`) REFERENCES `ca_lam_viec` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.nhan_vien: ~2 rows (approximately)
REPLACE INTO `nhan_vien` (`id`, `ma_nhan_vien`, `ten`, `email`, `so_dien_thoai`, `gioi_tinh`, `ngay_sinh`, `dia_chi`, `phong_ban_id`, `chuc_vu_id`, `anh_dai_dien`, `trang_thai`, `created_at`, `updated_at`, `ca_lam_viec_id`) VALUES
	(1, 'NV001', 'Nguyễn Văn A', 'nva@company.com', '0123456789', NULL, NULL, NULL, 1, 3, NULL, 1, '2025-07-23 17:20:21', '2025-07-23 17:20:21', NULL),
	(2, 'NV002', 'Trần Thị B', 'ttb@company.com', '0987654321', NULL, NULL, NULL, 2, 3, NULL, 1, '2025-07-23 17:20:21', '2025-07-23 17:20:21', NULL);

-- Dumping structure for table qldn_nhansu.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.personal_access_tokens: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.phong_ban
CREATE TABLE IF NOT EXISTS `phong_ban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.phong_ban: ~4 rows (approximately)
REPLACE INTO `phong_ban` (`id`, `ten`, `mo_ta`, `created_at`, `updated_at`) VALUES
	(1, 'Phòng Nhân Sự', 'Quản lý nhân sự', '2025-07-23 17:04:15', '2025-07-23 17:04:15'),
	(2, 'Phòng Kế Toán', 'Quản lý tài chính', '2025-07-23 17:04:15', '2025-07-23 17:04:15'),
	(3, 'Phòng IT', 'Công nghệ thông tin', '2025-07-23 17:04:15', '2025-07-23 17:04:15'),
	(4, 'Phòng Marketing', 'Tiếp thị', '2025-07-23 17:04:15', '2025-07-23 17:04:15');

-- Dumping structure for table qldn_nhansu.du_lieu_khuon_mat
CREATE TABLE IF NOT EXISTS `du_lieu_khuon_mat` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` bigint unsigned NOT NULL,
  `du_lieu_khuon_mat` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `du_lieu_khuon_mat_nhan_vien_id_unique` (`nhan_vien_id`),
  CONSTRAINT `du_lieu_khuon_mat_nhan_vien_id_foreign` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping structure for table qldn_nhansu.tai_khoan
CREATE TABLE IF NOT EXISTS `tai_khoan` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` bigint unsigned NOT NULL,
  `ten_dang_nhap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mat_khau` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quyen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tai_khoan_ten_dang_nhap_unique` (`ten_dang_nhap`),
  KEY `tai_khoan_nhan_vien_id_foreign` (`nhan_vien_id`),
  CONSTRAINT `tai_khoan_nhan_vien_id_foreign` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.tai_khoan: ~0 rows (approximately)

-- Dumping structure for table qldn_nhansu.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table qldn_nhansu.users: ~0 rows (approximately)
-- Data exporting was unselected.

-- Data exporting was unselected.

-- Data exporting was unselected.

-- Data exporting was unselected.

-- Data exporting was unselected.

-- Data exporting was unselected.

-- Data exporting was unselected.

-- Data exporting was unselected.
