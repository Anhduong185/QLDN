<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use App\Models\PhongBan;
use App\Models\ChucVu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NhanVienController extends Controller
{
    // Lấy danh sách nhân viên với phân trang và tìm kiếm
    public function index(Request $request)
    {
        try {
            $query = NhanVien::with(['phongBan', 'chucVu']);

            // Tìm kiếm theo tên
            if ($request->has('search') && $request->search) {
                $query->where('ten', 'like', '%' . $request->search . '%')
                      ->orWhere('ma_nhan_vien', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
            }

            // Lọc theo phòng ban
            if ($request->has('phong_ban_id') && $request->phong_ban_id) {
                $query->where('phong_ban_id', $request->phong_ban_id);
            }

            // Lọc theo chức vụ
            if ($request->has('chuc_vu_id') && $request->chuc_vu_id) {
                $query->where('chuc_vu_id', $request->chuc_vu_id);
            }

            // Lọc theo trạng thái
            if ($request->has('trang_thai') && $request->trang_thai !== '') {
                $query->where('trang_thai', $request->trang_thai);
            }

            // Sắp xếp
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Phân trang
            $perPage = $request->get('per_page', 10);
            $nhanVien = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $nhanVien->items(),
                'pagination' => [
                    'current_page' => $nhanVien->currentPage(),
                    'last_page' => $nhanVien->lastPage(),
                    'per_page' => $nhanVien->perPage(),
                    'total' => $nhanVien->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    // Lấy chi tiết nhân viên
    public function show($id)
    {
        try {
            $nhanVien = NhanVien::with(['phongBan', 'chucVu', 'caLamViec'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $nhanVien
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nhân viên hoặc có lỗi xảy ra'
            ], 404);
        }
    }

    // Thêm nhân viên mới
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ma_nhan_vien' => 'required|string|max:20|unique:nhan_vien,ma_nhan_vien',
                'ten' => 'required|string|max:255',
                'email' => 'required|email|unique:nhan_vien,email',
                'so_dien_thoai' => 'required|string|max:15',
                'gioi_tinh' => 'required|in:nam,nu',
                'ngay_sinh' => 'required|date|before:today',
                'dia_chi' => 'required|string|max:500',
                'phong_ban_id' => 'required|exists:phong_ban,id',
                'chuc_vu_id' => 'required|exists:chuc_vu,id',
                'ngay_vao_lam' => 'required|date',
                'luong_co_ban' => 'required|numeric|min:0',
                'cmnd_cccd' => 'nullable|string|max:20',
                'noi_sinh' => 'nullable|string|max:255',
                'dan_toc' => 'nullable|string|max:50',
                'ton_giao' => 'nullable|string|max:100',
                'tinh_trang_hon_nhan' => 'nullable|string|max:50',
                'anh_dai_dien' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ], [
                'ma_nhan_vien.required' => 'Mã nhân viên là bắt buộc',
                'ma_nhan_vien.unique' => 'Mã nhân viên đã tồn tại',
                'ten.required' => 'Tên nhân viên là bắt buộc',
                'email.required' => 'Email là bắt buộc',
                'email.email' => 'Email không đúng định dạng',
                'email.unique' => 'Email đã tồn tại',
                'so_dien_thoai.required' => 'Số điện thoại là bắt buộc',
                'gioi_tinh.required' => 'Giới tính là bắt buộc',
                'ngay_sinh.required' => 'Ngày sinh là bắt buộc',
                'ngay_sinh.before' => 'Ngày sinh phải trước ngày hiện tại',
                'dia_chi.required' => 'Địa chỉ là bắt buộc',
                'phong_ban_id.required' => 'Phòng ban là bắt buộc',
                'phong_ban_id.exists' => 'Phòng ban không tồn tại',
                'chuc_vu_id.required' => 'Chức vụ là bắt buộc',
                'chuc_vu_id.exists' => 'Chức vụ không tồn tại',
                'ngay_vao_lam.required' => 'Ngày vào làm là bắt buộc',
                'luong_co_ban.required' => 'Lương cơ bản là bắt buộc',
                'luong_co_ban.numeric' => 'Lương cơ bản phải là số',
                'anh_dai_dien.image' => 'File phải là hình ảnh',
                'anh_dai_dien.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg',
                'anh_dai_dien.max' => 'Kích thước hình ảnh không được vượt quá 2MB'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['trang_thai'] = $request->get('trang_thai', 1); // Mặc định là đang làm việc

            // Xử lý upload ảnh đại diện
            if ($request->hasFile('anh_dai_dien')) {
                $file = $request->file('anh_dai_dien');
                $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('public/nhan-vien', $fileName);
                $data['anh_dai_dien'] = $filePath;
            }

            $nhanVien = NhanVien::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Thêm nhân viên thành công',
                'data' => $nhanVien->load(['phongBan', 'chucVu'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    // Cập nhật nhân viên
    public function update(Request $request, $id)
    {
        try {
            $nhanVien = NhanVien::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'ma_nhan_vien' => 'required|string|max:20|unique:nhan_vien,ma_nhan_vien,' . $id,
                'ten' => 'required|string|max:255',
                'email' => 'required|email|unique:nhan_vien,email,' . $id,
                'so_dien_thoai' => 'required|string|max:15',
                'gioi_tinh' => 'required|in:nam,nu',
                'ngay_sinh' => 'required|date|before:today',
                'dia_chi' => 'required|string|max:500',
                'phong_ban_id' => 'required|exists:phong_ban,id',
                'chuc_vu_id' => 'required|exists:chuc_vu,id',
                'ngay_vao_lam' => 'required|date',
                'luong_co_ban' => 'required|numeric|min:0',
                'cmnd_cccd' => 'nullable|string|max:20',
                'noi_sinh' => 'nullable|string|max:255',
                'dan_toc' => 'nullable|string|max:50',
                'ton_giao' => 'nullable|string|max:100',
                'tinh_trang_hon_nhan' => 'nullable|string|max:50',
                'anh_dai_dien' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ], [
                'ma_nhan_vien.required' => 'Mã nhân viên là bắt buộc',
                'ma_nhan_vien.unique' => 'Mã nhân viên đã tồn tại',
                'ten.required' => 'Tên nhân viên là bắt buộc',
                'email.required' => 'Email là bắt buộc',
                'email.email' => 'Email không đúng định dạng',
                'email.unique' => 'Email đã tồn tại',
                'so_dien_thoai.required' => 'Số điện thoại là bắt buộc',
                'gioi_tinh.required' => 'Giới tính là bắt buộc',
                'ngay_sinh.required' => 'Ngày sinh là bắt buộc',
                'ngay_sinh.before' => 'Ngày sinh phải trước ngày hiện tại',
                'dia_chi.required' => 'Địa chỉ là bắt buộc',
                'phong_ban_id.required' => 'Phòng ban là bắt buộc',
                'phong_ban_id.exists' => 'Phòng ban không tồn tại',
                'chuc_vu_id.required' => 'Chức vụ là bắt buộc',
                'chuc_vu_id.exists' => 'Chức vụ không tồn tại',
                'ngay_vao_lam.required' => 'Ngày vào làm là bắt buộc',
                'luong_co_ban.required' => 'Lương cơ bản là bắt buộc',
                'luong_co_ban.numeric' => 'Lương cơ bản phải là số',
                'anh_dai_dien.image' => 'File phải là hình ảnh',
                'anh_dai_dien.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg',
                'anh_dai_dien.max' => 'Kích thước hình ảnh không được vượt quá 2MB'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            // Xử lý upload ảnh đại diện mới
            if ($request->hasFile('anh_dai_dien')) {
                // Xóa ảnh cũ nếu có
                if ($nhanVien->anh_dai_dien && Storage::exists($nhanVien->anh_dai_dien)) {
                    Storage::delete($nhanVien->anh_dai_dien);
                }

                $file = $request->file('anh_dai_dien');
                $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('public/nhan-vien', $fileName);
                $data['anh_dai_dien'] = $filePath;
            }

            $nhanVien->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật nhân viên thành công',
                'data' => $nhanVien->load(['phongBan', 'chucVu'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    // Xóa nhân viên
    public function destroy($id)
    {
        try {
            $nhanVien = NhanVien::findOrFail($id);

            // Kiểm tra xem nhân viên có dữ liệu liên quan không
            if ($nhanVien->chamCongs()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa nhân viên vì có dữ liệu chấm công liên quan'
                ], 400);
            }

            // Xóa ảnh đại diện nếu có
            if ($nhanVien->anh_dai_dien && Storage::exists($nhanVien->anh_dai_dien)) {
                Storage::delete($nhanVien->anh_dai_dien);
            }

            $nhanVien->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa nhân viên thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    // Dashboard tổng hợp nhân viên
    public function dashboard(Request $request)
    {
        try {
            $tong_nv = NhanVien::count();
            $dang_lam = NhanVien::where('trang_thai', 1)->count();
            $da_nghi = NhanVien::where('trang_thai', 0)->count();
            
            // Thống kê theo phòng ban
            $theo_phong_ban = NhanVien::selectRaw('phong_ban_id, COUNT(*) as so_luong')
                ->with('phongBan:id,ten')
                ->groupBy('phong_ban_id')
                ->get();

            // Thống kê theo giới tính
            $theo_gioi_tinh = NhanVien::selectRaw('gioi_tinh, COUNT(*) as so_luong')
                ->groupBy('gioi_tinh')
                ->get();

            // Nhân viên mới trong tháng
            $nhan_vien_moi = NhanVien::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'tong_nv' => $tong_nv,
                    'dang_lam' => $dang_lam,
                    'da_nghi' => $da_nghi,
                    'theo_phong_ban' => $theo_phong_ban,
                    'theo_gioi_tinh' => $theo_gioi_tinh,
                    'nhan_vien_moi' => $nhan_vien_moi
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    // Lấy danh sách phòng ban và chức vụ cho form
    public function getFormData()
    {
        try {
            $phongBans = PhongBan::select('id', 'ten')->get();
            $chucVus = ChucVu::select('id', 'ten')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'phong_bans' => $phongBans,
                    'chuc_vus' => $chucVus
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu form: ' . $e->getMessage()
            ], 500);
        }
    }
}
