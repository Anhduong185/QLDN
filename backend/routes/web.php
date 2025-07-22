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
