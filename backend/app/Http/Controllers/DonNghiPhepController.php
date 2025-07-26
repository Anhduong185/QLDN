<?php

namespace App\Http\Controllers;

use App\Models\DonNghiPhep;
use Illuminate\Http\Request;

class DonNghiPhepController extends Controller
{
    // Gửi đơn nghỉ phép
    public function store(Request $request)
    {
        $don = DonNghiPhep::create([
            'nhan_vien_id' => $request->nhan_vien_id,
            'ngay_nghi' => $request->ngay_nghi,
            'loai_nghi' => $request->loai_nghi,
            'thoi_gian_bat_dau' => $request->thoi_gian_bat_dau,
            'thoi_gian_ket_thuc' => $request->thoi_gian_ket_thuc,
            'ly_do' => $request->ly_do,
            'trang_thai' => 'cho_duyet'
        ]);
        return response()->json(['success' => true, 'data' => $don]);
    }

    // Duyệt đơn
    public function approve($id)
    {
        $don = DonNghiPhep::findOrFail($id);
        $don->update(['trang_thai' => 'da_duyet']);
        return response()->json(['success' => true, 'data' => $don]);
    }

    // Lấy danh sách đơn
    public function index(Request $request)
    {
        $query = DonNghiPhep::with('nhanVien');
        if ($request->nhan_vien_id) $query->where('nhan_vien_id', $request->nhan_vien_id);
        return response()->json(['success' => true, 'data' => $query->orderBy('ngay_nghi', 'desc')->get()]);
    }
} 