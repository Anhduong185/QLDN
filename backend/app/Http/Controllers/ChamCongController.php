<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use App\Models\FaceData;
use App\Models\ChamCong;
use App\Models\AccessLog;
use App\Models\DonNghiPhep;
use App\Models\CaLamViec;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ChamCongExport;

class ChamCongController extends Controller
{
    // 1. Chấm công (check-in/check-out)
    public function checkIn(Request $request)
    {
        $inputDescriptor = $request->face_descriptor;
        $nhanVien = $this->findNhanVienByFace($inputDescriptor);
        if (!$nhanVien) {
            return response()->json([
                'success' => false, 
                'message' => 'Không nhận diện được khuôn mặt. Vui lòng đăng ký khuôn mặt trước khi chấm công.'
            ], 400);
        }

        $ca = $nhanVien->caLamViec ?? CaLamViec::first();
        if (!$ca) {
            return response()->json(['success' => false, 'message' => 'Không xác định được ca làm việc'], 400);
        }

        $today = now()->toDateString();
        $now = now();

        // 1. Ghi AccessLog mỗi lần quét, so le vào/ra
        $lastLog = AccessLog::where('nhan_vien_id', $nhanVien->id)
            ->orderBy('thoi_gian', 'desc')
            ->first();

        if (!$lastLog || $lastLog->loai_su_kien === 'ra') {
            $eventType = 'vao';
        } else {
            $eventType = 'ra';
        }

        if (
            (!$lastLog || $lastLog->loai_su_kien !== $eventType) &&
            (!$lastLog || $now->diffInSeconds(Carbon::parse($lastLog->thoi_gian)) > 2)
        ) {
            AccessLog::create([
                'nhan_vien_id' => $nhanVien->id,
                'thoi_gian' => $now,
                'loai_su_kien' => $eventType,
                'vi_tri' => $request->input('vi_tri'),
                'ghi_chu' => $request->input('device_info')
            ]);
        }

        // 2. Xử lý bảng chấm công
        $chamCong = ChamCong::where('nhan_vien_id', $nhanVien->id)
            ->where('ngay', $today)
            ->where('ca_lam_viec_id', $ca->id)
            ->first();

        if (!$chamCong && $eventType === 'vao') {
            // Lần đầu tiên: ghi giờ vào
            $chamCong = ChamCong::create([
                'nhan_vien_id' => $nhanVien->id,
                'ca_lam_viec_id' => $ca->id,
                'ngay' => $today,
                'gio_vao' => $now->format('H:i:s'),
                'trang_thai' => $this->tinhTrangThaiVao($nhanVien, $now, $ca),
                'ghi_chu' => 'Chấm công vào bằng khuôn mặt'
            ]);
        } else if ($chamCong && $eventType === 'ra') {
            // Cập nhật giờ ra và tính trạng thái tổng hợp
            $trangThaiVao = $this->tinhTrangThaiVao($nhanVien, Carbon::parse($chamCong->gio_vao), $ca);
            $trangThaiRa = $this->tinhTrangThaiRa($nhanVien, $now, $ca);
            
            // Tính trạng thái tổng hợp
            $trangThaiTongHop = $this->tinhTrangThaiTongHop($trangThaiVao, $trangThaiRa);
            
            $chamCong->update([
                'gio_ra' => $now->format('H:i:s'),
                'trang_thai' => $trangThaiTongHop,
                'ghi_chu' => trim(($chamCong->ghi_chu ?? '') . ' | Chấm công ra bằng khuôn mặt')
            ]);
        }

        return response()->json(['success' => true, 'data' => $chamCong, 'nhan_vien' => $nhanVien]);
    }

    // 2. Lấy access log
    public function accessLogs(Request $request)
    {
        $query = AccessLog::with('nhanVien');
        if ($request->nhan_vien_id) $query->where('nhan_vien_id', $request->nhan_vien_id);
        if ($request->from && $request->to) $query->whereBetween('thoi_gian', [$request->from, $request->to]);
        return response()->json(['success' => true, 'data' => $query->orderBy('thoi_gian', 'desc')->get()]);
    }

    // 3. Dashboard tổng hợp chấm công
    public function dashboard(Request $request)
    {
        try {
            $from = $request->input('from', now()->startOfMonth()->toDateString());
            $to = $request->input('to', now()->endOfMonth()->toDateString());
            $phongBanId = $request->input('phong_ban_id');

            // Query cơ bản
            $query = ChamCong::with(['nhanVien.phongBan', 'caLamViec']);
            if ($from && $to) {
                $query->whereBetween('ngay', [$from, $to]);
            }
            if ($phongBanId) {
                $query->whereHas('nhanVien', fn($q) => $q->where('phong_ban_id', $phongBanId));
            }

            $chamCongData = $query->get();

            // Thống kê tổng quan - Tính theo số nhân viên và ngày làm việc
            $tong_nhan_vien = NhanVien::where('trang_thai', 1)->count();
            $so_ngay_lam_viec = Carbon::parse($from)->diffInDays(Carbon::parse($to)) + 1;
            $tong_ngay_cong_ly_thuyet = $tong_nhan_vien * $so_ngay_lam_viec;
            
            // Thống kê thực tế từ dữ liệu chấm công
            $tong_ngay_cong_thuc_te = $chamCongData->count();
            $co_cham_cong = $chamCongData->whereNotNull('gio_vao')->count();
            $khong_cham_cong = $tong_ngay_cong_ly_thuyet - $co_cham_cong;

            // Thống kê theo trạng thái
            $co_mat = $chamCongData->where('trang_thai', 'co_mat')->count();
            $tre = $chamCongData->where('trang_thai', 'tre')->count();
            $som = $chamCongData->where('trang_thai', 'som')->count();
            $vang_mat = $chamCongData->where('trang_thai', 'vang_mat')->count();
            $khac = $chamCongData->whereNotIn('trang_thai', ['co_mat', 'tre', 'som', 'vang_mat'])->count();

            // Thống kê theo phòng ban
            $theo_phong_ban = $chamCongData->groupBy('nhanVien.phongBan.ten')
                ->map(function($group) {
                    return [
                        'phong_ban' => $group->first()->nhanVien->phongBan->ten ?? 'Không xác định',
                        'tong_ngay' => $group->count(),
                        'co_mat' => $group->where('trang_thai', 'co_mat')->count(),
                        'tre' => $group->where('trang_thai', 'tre')->count(),
                        'som' => $group->where('trang_thai', 'som')->count(),
                        'vang_mat' => $group->where('trang_thai', 'vang_mat')->count(),
                    ];
                })->values();

            // Thống kê theo ngày trong tuần
            $theo_ngay_trong_tuan = $chamCongData->groupBy(function($item) {
                return Carbon::parse($item->ngay)->format('l'); // Tên ngày trong tuần
            })->map(function($group) {
                return [
                    'ngay' => $group->first()->ngay,
                    'tong_ngay' => $group->count(),
                                            'co_mat' => $group->where('trang_thai', 'co_mat')->count(),
                        'tre' => $group->where('trang_thai', 'tre')->count(),
                        'som' => $group->where('trang_thai', 'som')->count(),
                        'vang_mat' => $group->where('trang_thai', 'vang_mat')->count(),
                ];
            })->values();

            // Thống kê hôm nay
            $hom_nay = now()->toDateString();
            $cham_cong_hom_nay = ChamCong::where('ngay', $hom_nay)->count();
            $nhan_vien_hom_nay = NhanVien::where('trang_thai', 1)->count();
            $ty_le_cham_cong_hom_nay = $nhan_vien_hom_nay > 0 ? round(($cham_cong_hom_nay / $nhan_vien_hom_nay) * 100, 2) : 0;

            // Thống kê tuần này
            $tuan_nay = [
                now()->startOfWeek()->toDateString(),
                now()->endOfWeek()->toDateString()
            ];
            $cham_cong_tuan_nay = ChamCong::whereBetween('ngay', $tuan_nay)->count();

            // Thống kê tháng này
            $thang_nay = [
                now()->startOfMonth()->toDateString(),
                now()->endOfMonth()->toDateString()
            ];
            $cham_cong_thang_nay = ChamCong::whereBetween('ngay', $thang_nay)->count();

            // Thống kê vắng mặt hôm nay
            $vang_mat_hom_nay = ChamCong::where('ngay', $hom_nay)
                ->where('trang_thai', 'vang_mat')
                ->count();

            // Thống kê top nhân viên chấm công đúng giờ
            $top_nhan_vien_dung_gio = $chamCongData
                ->groupBy('nhan_vien_id')
                ->map(function($group) {
                    $nhanVien = $group->first()->nhanVien;
                    $dungGio = $group->where('trang_thai', 'co_mat')->count();
                    $tongNgay = $group->count();
                    return [
                        'nhan_vien_id' => $nhanVien->id,
                        'ten' => $nhanVien->ten,
                        'phong_ban' => $nhanVien->phongBan->ten ?? 'Không xác định',
                        'dung_gio' => $dungGio,
                        'tong_ngay' => $tongNgay,
                        'ty_le' => $tongNgay > 0 ? round(($dungGio / $tongNgay) * 100, 2) : 0
                    ];
                })
                ->sortByDesc('ty_le')
                ->take(5)
                ->values();

            // Thống kê theo giờ chấm công
            $theo_gio_cham_cong = $chamCongData
                ->groupBy(function($item) {
                    return Carbon::parse($item->gio_vao)->format('H:00');
                })
                ->map(function($group) {
                    return [
                        'gio' => $group->first()->gio_vao ? Carbon::parse($group->first()->gio_vao)->format('H:00') : 'Không xác định',
                        'so_luong' => $group->count()
                    ];
                })
                ->sortBy('gio')
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'tong_quan' => [
                        'tong_ngay_cong' => $tong_ngay_cong_thuc_te,
                        'co_cham_cong' => $co_cham_cong,
                        'khong_cham_cong' => $khong_cham_cong,
                        'ty_le_cham_cong' => $tong_ngay_cong_ly_thuyet > 0 ? round(($co_cham_cong / $tong_ngay_cong_ly_thuyet) * 100, 2) : 0,
                        'tong_nhan_vien' => $tong_nhan_vien,
                        'so_ngay_lam_viec' => $so_ngay_lam_viec
                    ],
                    'theo_trang_thai' => [
                        'co_mat' => $co_mat,
                        'tre' => $tre,
                        'som' => $som,
                        'vang_mat' => $vang_mat,
                        'khac' => $khac
                    ],
                    'theo_phong_ban' => $theo_phong_ban,
                    'theo_ngay_trong_tuan' => $theo_ngay_trong_tuan,
                    'hom_nay' => [
                        'cham_cong' => $cham_cong_hom_nay,
                        'nhan_vien' => $nhan_vien_hom_nay,
                        'ty_le' => $ty_le_cham_cong_hom_nay,
                        'vang_mat' => $vang_mat_hom_nay
                    ],
                    'tuan_nay' => $cham_cong_tuan_nay,
                    'thang_nay' => $cham_cong_thang_nay,
                    'top_nhan_vien_dung_gio' => $top_nhan_vien_dung_gio,
                    'theo_gio_cham_cong' => $theo_gio_cham_cong,
                    'khoang_thoi_gian' => [
                        'tu' => $from,
                        'den' => $to
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu dashboard chấm công: ' . $e->getMessage()
            ], 500);
        }
    }

    // 4. Xuất Excel
    public function exportExcel(Request $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');
        $phongBanId = $request->input('phong_ban_id');
            $query = ChamCong::with('nhanVien');
        if ($from && $to) $query->whereBetween('ngay', [$from, $to]);
        if ($phongBanId) $query->whereHas('nhanVien', fn($q) => $q->where('phong_ban_id', $phongBanId));
        $data = $query->get();
        return Excel::download(new ChamCongExport($data), 'cham_cong.xlsx');
    }

    // 5. Chuẩn bị mở rộng AI: API xuất dữ liệu thô
    public function exportRawData(Request $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');
        $logs = AccessLog::whereBetween('thoi_gian', [$from, $to])->get();
        $chamCong = ChamCong::whereBetween('ngay', [$from, $to])->get();
        return response()->json(['access_logs' => $logs, 'cham_cong' => $chamCong]);
    }

    public function registerFace(Request $request)
    {
        $nhanVienId = $request->input('nhan_vien_id');
        $faceDescriptor = $request->input('face_descriptor');

        if (!$nhanVienId || !$faceDescriptor) {
            return response()->json(['success' => false, 'message' => 'Thiếu thông tin nhân viên hoặc descriptor'], 400);
        }

        // Kiểm tra descriptor đã tồn tại cho nhân viên khác chưa
        $allFaces = \App\Models\FaceData::where('nhan_vien_id', '!=', $nhanVienId)->get();
        $threshold = 0.45; // Giảm threshold để tránh trùng lặp
        foreach ($allFaces as $face) {
            $stored = is_string($face->face_descriptor) ? json_decode($face->face_descriptor) : $face->face_descriptor;
            if (!is_array($stored)) continue;
            $distance = $this->calculateEuclideanDistance($faceDescriptor, $stored);
            if ($distance < $threshold) {
                return response()->json([
                    'success' => false,
                    'message' => 'Khuôn mặt này đã được đăng ký cho nhân viên khác!'
                ], 400);
            }
        }

        // Lưu hoặc cập nhật dữ liệu khuôn mặt
        $faceData = \App\Models\FaceData::updateOrCreate(
            ['nhan_vien_id' => $nhanVienId],
            ['face_descriptor' => json_encode($faceDescriptor)]
        );

        return response()->json(['success' => true, 'message' => 'Đăng ký khuôn mặt thành công!', 'data' => $faceData]);
    }

    public function getRegistrationStatus($nhanVienId)
    {
        $faceData = \App\Models\FaceData::where('nhan_vien_id', $nhanVienId)->first();
        if ($faceData) {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_face_data' => true,
                    'registered_at' => $faceData->updated_at ?? $faceData->created_at
                ]
            ]);
        } else {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_face_data' => false
                ]
            ]);
        }
    }

    // API để kiểm tra khuôn mặt và trả về thông tin nhân viên
    public function identifyFace(Request $request)
    {
        try {
            $inputDescriptor = $request->face_descriptor;
            $result = $this->findNhanVienByFaceWithConfidence($inputDescriptor);
            
            if ($result['nhanVien']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'nhan_vien' => [
                            'id' => $result['nhanVien']->id,
                            'ten' => $result['nhanVien']->ten,
                            'ma_nhan_vien' => $result['nhanVien']->ma_nhan_vien,
                            'email' => $result['nhanVien']->email,
                            'phong_ban' => $result['nhanVien']->phongBan->ten ?? 'Không xác định'
                        ],
                        'identified' => true,
                        'confidence' => $result['confidence'],
                        'distance' => $result['distance']
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'identified' => false,
                        'message' => 'Không nhận diện được khuôn mặt'
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi nhận diện khuôn mặt: ' . $e->getMessage()
            ], 500);
        }
    }

    // Hàm mới để nhận diện với độ tin cậy
    protected function findNhanVienByFaceWithConfidence($inputDescriptor)
    {
        $threshold = 0.45;
        $faces = FaceData::with('nhanVien')->get();
        
        $bestMatch = null;
        $bestDistance = PHP_FLOAT_MAX;
        
        foreach ($faces as $face) {
            $stored = is_string($face->face_descriptor) ? json_decode($face->face_descriptor) : $face->face_descriptor;
            if (!is_array($stored)) continue;
            
            $distance = $this->calculateEuclideanDistance($inputDescriptor, $stored);
            
            if ($distance < $threshold && $distance < $bestDistance) {
                $bestMatch = $face->nhanVien;
                $bestDistance = $distance;
            }
        }
        
        if ($bestMatch) {
            // Tính độ tin cậy (confidence) dựa trên khoảng cách
            $confidence = max(0, 100 - ($bestDistance / $threshold) * 100);
            return [
                'nhanVien' => $bestMatch,
                'distance' => $bestDistance,
                'confidence' => round($confidence, 2)
            ];
        }
        
        return [
            'nhanVien' => null,
            'distance' => null,
            'confidence' => 0
        ];
    }

    // Check-out riêng biệt (nếu cần)
    public function checkOut(Request $request)
    {
        $inputDescriptor = $request->face_descriptor;
        $nhanVien = $this->findNhanVienByFace($inputDescriptor);
        if (!$nhanVien) {
            return response()->json(['success' => false, 'message' => 'Không nhận diện được khuôn mặt'], 400);
        }

        $ca = $nhanVien->caLamViec ?? CaLamViec::first();
        if (!$ca) {
            return response()->json(['success' => false, 'message' => 'Không xác định được ca làm việc'], 400);
        }

        $today = now()->toDateString();
        $now = now();

        // Ghi AccessLog
        AccessLog::create([
            'nhan_vien_id' => $nhanVien->id,
            'thoi_gian' => $now,
            'loai_su_kien' => 'ra',
            'vi_tri' => $request->input('vi_tri'),
            'ghi_chu' => $request->input('device_info')
        ]);

        // Cập nhật chấm công
        $chamCong = ChamCong::where('nhan_vien_id', $nhanVien->id)
            ->where('ngay', $today)
            ->where('ca_lam_viec_id', $ca->id)
            ->first();

        if ($chamCong) {
            $chamCong->update([
                'gio_ra' => $now->format('H:i:s'),
                'trang_thai' => $this->tinhTrangThaiRa($nhanVien, $now, $ca),
                'ghi_chu' => trim(($chamCong->ghi_chu ?? '') . ' | Chấm công ra bằng khuôn mặt')
            ]);
        }

        return response()->json(['success' => true, 'data' => $chamCong, 'nhan_vien' => $nhanVien]);
    }

    // Lấy lịch sử chấm công của nhân viên
    public function getAttendanceHistory($employeeId)
    {
        $chamCongs = ChamCong::where('nhan_vien_id', $employeeId)
            ->with(['nhanVien', 'caLamViec'])
            ->orderBy('ngay', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $chamCongs]);
    }

    // Lấy tất cả chấm công
    public function getAllAttendance(Request $request)
    {
        $query = ChamCong::with(['nhanVien', 'caLamViec']);
        
        if ($request->from) $query->where('ngay', '>=', $request->from);
        if ($request->to) $query->where('ngay', '<=', $request->to);
        if ($request->nhan_vien_id) $query->where('nhan_vien_id', $request->nhan_vien_id);
        
        $chamCongs = $query->orderBy('ngay', 'desc')->get();
        
        return response()->json(['success' => true, 'data' => $chamCongs]);
    }

    // Lấy chấm công hôm nay
    public function getTodayAttendance()
    {
        $today = now()->toDateString();
        $chamCongs = ChamCong::where('ngay', $today)
            ->with(['nhanVien', 'caLamViec'])
            ->orderBy('gio_vao', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $chamCongs]);
    }

    // Lấy chấm công hôm nay của nhân viên cụ thể
    public function getEmployeeTodayAttendance($employeeId)
    {
        $today = now()->toDateString();
        $chamCong = ChamCong::where('nhan_vien_id', $employeeId)
            ->where('ngay', $today)
            ->with(['nhanVien', 'caLamViec'])
            ->first();

        return response()->json(['success' => true, 'data' => $chamCong]);
    }

    // ====== Các hàm phụ trợ ======
    protected function findNhanVienByFace($inputDescriptor)
    {
        // So sánh descriptor, trả về NhanVien nếu tìm thấy
        $threshold = 0.45; // Giảm threshold để tăng độ chính xác
        $faces = FaceData::with('nhanVien')->get();
        
        $bestMatch = null;
        $bestDistance = PHP_FLOAT_MAX;
        
        foreach ($faces as $face) {
            $stored = is_string($face->face_descriptor) ? json_decode($face->face_descriptor) : $face->face_descriptor;
            if (!is_array($stored)) continue;
            
            $distance = $this->calculateEuclideanDistance($inputDescriptor, $stored);
            
            // Ghi log để debug
            \Log::info("Face recognition - Employee: {$face->nhanVien->ten}, Distance: {$distance}, Threshold: {$threshold}");
            
            // Chỉ nhận diện nếu khoảng cách đủ gần
            if ($distance < $threshold && $distance < $bestDistance) {
                $bestMatch = $face->nhanVien;
                $bestDistance = $distance;
            }
        }
        
        if ($bestMatch) {
            \Log::info("Face recognition successful - Employee: {$bestMatch->ten}, Distance: {$bestDistance}");
        } else {
            \Log::warning("Face recognition failed - No match found below threshold: {$threshold}");
        }
        
        return $bestMatch;
    }

    protected function calculateEuclideanDistance($desc1, $desc2)
    {
        if (!is_array($desc1) || !is_array($desc2) || count($desc1) !== count($desc2)) return PHP_FLOAT_MAX;
        $sum = 0;
        for ($i = 0; $i < count($desc1); $i++) {
            $sum += pow($desc1[$i] - $desc2[$i], 2);
        }
        return sqrt($sum);
    }

    // ====== Các hàm phụ trợ sửa lại ======
    protected function determineEventType($nhanVienId, $ca)
    {
        $today = now()->toDateString();
        $chamCong = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('ngay', $today)
            ->where('ca_lam_viec_id', $ca->id)
            ->first();
        if (!$chamCong || !$chamCong->gio_vao) return 'vao';
        if ($chamCong && !$chamCong->gio_ra) return 'ra';
        return 'vao';
    }

    protected function tinhTrangThaiVao($nhanVien, $now, $ca)
    {
        $gioVao = Carbon::parse($now);
        $gioBatDau = Carbon::parse($ca->gio_bat_dau);
        $tre = $gioVao->diffInMinutes($gioBatDau, false);
        
        if ($tre <= 0) {
            return 'co_mat'; // Đến sớm hoặc đúng giờ
        } else {
            return 'tre'; // Đi muộn
        }
    }

    protected function tinhTrangThaiRa($nhanVien, $now, $ca)
    {
        $gioRa = Carbon::parse($now);
        $gioKetThuc = Carbon::parse($ca->gio_ket_thuc);
        $som = $gioRa->diffInMinutes($gioKetThuc, false);
        
        if ($som >= 0) {
            return 'co_mat'; // Về đúng giờ hoặc muộn
        } else {
            return 'som'; // Về sớm
        }
    }

    protected function tinhTrangThaiTongHop($trangThaiVao, $trangThaiRa)
    {
        // Logic tính trạng thái tổng hợp dựa trên giờ vào và giờ ra
        if ($trangThaiVao === 'co_mat' && $trangThaiRa === 'co_mat') {
            return 'co_mat'; // Vào đúng giờ và ra đúng giờ
        } elseif ($trangThaiVao === 'tre') {
            return 'tre'; // Đi muộn (ưu tiên hơn về sớm)
        } elseif ($trangThaiRa === 'som') {
            return 'som'; // Về sớm
        } else {
            return 'co_mat'; // Mặc định
        }
    }
}
