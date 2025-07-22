<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NhanVienController extends Controller
{
    public function index(): JsonResponse
    {
        $nhanViens = NhanVien::with(['phongBan', 'chucVu'])->get();
        return response()->json($nhanViens);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ma_nhan_vien' => 'required|unique:nhan_vien,ma_nhan_vien',
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nhan_vien,email',
            'so_dien_thoai' => 'nullable|string',
            'gioi_tinh' => 'nullable|string',
            'ngay_sinh' => 'nullable|date',
            'dia_chi' => 'nullable|string',
            'phong_ban_id' => 'nullable|exists:phong_ban,id',
            'chuc_vu_id' => 'nullable|exists:chuc_vu,id'
        ]);

        $nhanVien = NhanVien::create($validated);
        return response()->json($nhanVien->load(['phongBan', 'chucVu']), 201);
    }

    public function show($id): JsonResponse
    {
        $nhanVien = NhanVien::with(['phongBan', 'chucVu'])->findOrFail($id);
        return response()->json($nhanVien);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $nhanVien = NhanVien::findOrFail($id);
        
        $validated = $request->validate([
            'ma_nhan_vien' => 'required|unique:nhan_vien,ma_nhan_vien,' . $id,
            'ten' => 'required|string|max:255',
            'email' => 'required|email|unique:nhan_vien,email,' . $id,
            'so_dien_thoai' => 'nullable|string',
            'gioi_tinh' => 'nullable|string',
            'ngay_sinh' => 'nullable|date',
            'dia_chi' => 'nullable|string',
            'phong_ban_id' => 'nullable|exists:phong_ban,id',
            'chuc_vu_id' => 'nullable|exists:chuc_vu,id'
        ]);

        $nhanVien->update($validated);
        return response()->json($nhanVien->load(['phongBan', 'chucVu']));
    }

    public function destroy($id): JsonResponse
    {
        $nhanVien = NhanVien::findOrFail($id);
        $nhanVien->delete();
        return response()->json(['message' => 'Xóa nhân viên thành công']);
    }
}