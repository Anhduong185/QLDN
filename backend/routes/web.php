<?php

use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\DB;

Route::get('/test-db', function () {
    try {
        $nhansu = DB::connection('mysql_nhansu')->select('SELECT DATABASE() as db');
        $taichinh = DB::connection('mysql_taichinh')->select('SELECT DATABASE() as db');
        $sanpham = DB::connection('mysql_sanpham')->select('SELECT DATABASE() as db');

        return response()->json([
            'nhansu' => $nhansu[0]->db ?? 'fail',
            'taichinh' => $taichinh[0]->db ?? 'fail',
            'sanpham' => $sanpham[0]->db ?? 'fail',
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

Route::get('/test-register', function () {
    try {
        $nhanVien = App\Models\NhanVien::first();
        
        if (!$nhanVien) {
            return response()->json([
                'success' => false,
                'error' => 'Không có nhân viên nào trong database. Hãy chạy seeder trước.'
            ]);
        }
        
        $testData = [
            'nhan_vien_id' => $nhanVien->id, // Đổi từ employee_id
            'face_descriptor' => array_fill(0, 128, 0.5)
        ];
        
        $faceData = App\Models\FaceData::updateOrCreate(
            ['nhan_vien_id' => $testData['nhan_vien_id']],
            ['face_descriptor' => $testData['face_descriptor']]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Test đăng ký thành công',
            'employee' => $nhanVien,
            'data' => $faceData
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});

Route::get('/clear-face-data', function () {
    try {
        $deletedFaces = App\Models\FaceData::count();
        $deletedAttendance = App\Models\ChamCong::count();
        
        App\Models\FaceData::truncate();
        App\Models\ChamCong::truncate();
        
        return response()->json([
            'success' => true,
            'message' => "Đã xóa {$deletedFaces} khuôn mặt và {$deletedAttendance} bản ghi chấm công"
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});


