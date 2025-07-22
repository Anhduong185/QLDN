<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NhanVien;
use Illuminate\Support\Facades\DB;

class NhanVienSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mysql_nhansu')->table('nhan_vien')->insert([
            [
                'ma_nhan_vien' => 'NV001',
                'ten' => 'Nguyễn Văn An',
                'email' => 'an@company.com',
                'so_dien_thoai' => '0901234567',
                'gioi_tinh' => 'Nam',
                'ngay_sinh' => '1990-05-15',
                'dia_chi' => 'Hà Nội',
                'trang_thai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_nhan_vien' => 'NV002',
                'ten' => 'Trần Thị Bình',
                'email' => 'binh@company.com',
                'so_dien_thoai' => '0912345678',
                'gioi_tinh' => 'Nữ',
                'ngay_sinh' => '1992-08-20',
                'dia_chi' => 'TP.HCM',
                'trang_thai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_nhan_vien' => 'NV003',
                'ten' => 'Lê Văn Cường',
                'email' => 'cuong@company.com',
                'so_dien_thoai' => '0923456789',
                'gioi_tinh' => 'Nam',
                'ngay_sinh' => '1988-12-10',
                'dia_chi' => 'Đà Nẵng',
                'trang_thai' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}