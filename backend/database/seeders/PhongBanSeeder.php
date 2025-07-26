<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PhongBanSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mysql_nhansu')->table('phong_ban')->insert([
            ['ten' => 'Phòng Nhân Sự', 'mo_ta' => 'Quản lý nhân sự', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'Phòng Kế Toán', 'mo_ta' => 'Quản lý tài chính', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'Phòng IT', 'mo_ta' => 'Công nghệ thông tin', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'Phòng Marketing', 'mo_ta' => 'Tiếp thị', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}