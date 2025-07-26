<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChucVuSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mysql_nhansu')->table('chuc_vu')->insert([
            ['ten' => 'Giám Đốc', 'mo_ta' => 'Quản lý toàn bộ công ty', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'Trưởng Phòng', 'mo_ta' => 'Quản lý phòng ban', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'Nhân Viên', 'mo_ta' => 'Nhân viên thực hiện', 'created_at' => now(), 'updated_at' => now()],
            ['ten' => 'Thực Tập Sinh', 'mo_ta' => 'Sinh viên thực tập', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}