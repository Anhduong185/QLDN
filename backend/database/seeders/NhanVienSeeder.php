<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NhanVienSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mysql_nhansu')->table('nhan_vien')->insert([
            [
                'ma_nhan_vien' => 'NV001',
                'ten' => 'Nguyễn Văn A',
                'email' => 'nva@company.com',
                'so_dien_thoai' => '0123456789',
                'phong_ban_id' => 1,
                'chuc_vu_id' => 3,
                'trang_thai' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_nhan_vien' => 'NV002',
                'ten' => 'Trần Thị B',
                'email' => 'ttb@company.com',
                'so_dien_thoai' => '0987654321',
                'phong_ban_id' => 2,
                'chuc_vu_id' => 3,
                'trang_thai' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}