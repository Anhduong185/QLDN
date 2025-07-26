<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CaLamViecSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mysql_nhansu')->table('ca_lam_viec')->insert([
            [
                'ten_ca' => 'Ca Hành Chính',
                'gio_bat_dau' => '08:00:00',
                'gio_ket_thuc' => '17:00:00',
                'phut_tre_cho_phep' => 30,
                'phut_som_cho_phep' => 30,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_ca' => 'Ca Sáng',
                'gio_bat_dau' => '08:00:00',
                'gio_ket_thuc' => '12:00:00',
                'phut_tre_cho_phep' => 15,
                'phut_som_cho_phep' => 15,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ten_ca' => 'Ca Chiều',
                'gio_bat_dau' => '13:00:00',
                'gio_ket_thuc' => '17:00:00',
                'phut_tre_cho_phep' => 15,
                'phut_som_cho_phep' => 15,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}