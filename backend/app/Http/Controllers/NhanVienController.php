<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use Illuminate\Http\Request;

class NhanVienController extends Controller
{
    // Lấy danh sách nhân viên
    public function index(Request $request)
    {
        $query = NhanVien::query();
        if ($request->phong_ban_id) $query->where('phong_ban_id', $request->phong_ban_id);
        return response()->json(['success' => true, 'data' => $query->orderBy('ten')->get()]);
    }

    // Lấy chi tiết nhân viên
    public function show($id)
    {
        $nv = NhanVien::with(['phongBan', 'chucVu'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $nv]);
    }

    // Dashboard tổng hợp nhân viên
    public function dashboard(Request $request)
    {
        $tong_nv = NhanVien::count();
        $dang_lam = NhanVien::where('trang_thai', 1)->count();
        $da_nghi = NhanVien::where('trang_thai', 0)->count();
            return response()->json([
                'success' => true,
            'data' => [
                'tong_nv' => $tong_nv,
                'dang_lam' => $dang_lam,
                'da_nghi' => $da_nghi
            ]
        ]);
    }
}
