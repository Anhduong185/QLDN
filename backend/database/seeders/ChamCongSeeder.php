<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChamCongSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy danh sách nhân viên và ca làm việc
        $nhanViens = DB::connection('mysql_nhansu')->table('nhan_vien')->get();
        $caLamViec = DB::connection('mysql_nhansu')->table('ca_lam_viec')->first();

        if (!$caLamViec) {
            $this->command->error('Không có ca làm việc nào!');
            return;
        }

        $chamCongData = [];

        // Tạo dữ liệu chấm công cho 7 ngày gần đây
        for ($i = 1; $i < 8; $i++) { // Bỏ qua ngày hôm nay
            $ngay = Carbon::now()->subDays($i);
            
            foreach ($nhanViens as $nhanVien) {
                // Kiểm tra xem đã có dữ liệu cho nhân viên này trong ngày này chưa
                $existing = DB::connection('mysql_nhansu')
                    ->table('cham_cong')
                    ->where('nhan_vien_id', $nhanVien->id)
                    ->where('ngay', $ngay->toDateString())
                    ->first();
                
                if ($existing) {
                    continue; // Bỏ qua nếu đã có dữ liệu
                }
                
                // Random trạng thái
                $trangThai = ['co_mat', 'tre', 'som', 'vang_mat'][rand(0, 3)];
                
                // Random giờ vào/ra
                $gioVao = null;
                $gioRa = null;
                
                if ($trangThai !== 'vang_mat') {
                    $gioVao = Carbon::parse('08:00:00')->addMinutes(rand(-30, 60))->format('H:i:s');
                    $gioRa = Carbon::parse('17:00:00')->addMinutes(rand(-60, 30))->format('H:i:s');
                }

                $chamCongData[] = [
                    'nhan_vien_id' => $nhanVien->id,
                    'ca_lam_viec_id' => $caLamViec->id,
                    'ngay' => $ngay->toDateString(),
                    'gio_vao' => $gioVao,
                    'gio_ra' => $gioRa,
                    'trang_thai' => $trangThai,
                    'phut_tre' => $trangThai === 'tre' ? rand(5, 30) : 0,
                    'phut_som' => $trangThai === 'som' ? rand(5, 30) : 0,
                    'gio_lam_thuc_te' => $gioVao && $gioRa ? rand(7, 9) : 0,
                    'gio_tang_ca' => rand(0, 2),
                    'ghi_chu' => 'Dữ liệu test',
                    'created_at' => $ngay,
                    'updated_at' => $ngay,
                ];
            }
        }

        // Insert dữ liệu
        DB::connection('mysql_nhansu')->table('cham_cong')->insert($chamCongData);

        $this->command->info('Đã tạo ' . count($chamCongData) . ' bản ghi chấm công test!');
    }
} 