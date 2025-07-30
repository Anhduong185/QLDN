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
            return response()->json(['success' => false, 'message' => 'Không nhận diện được khuôn mặt'], 400);
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

            // Thống kê tổng quan
            $tong_ngay_cong = $chamCongData->count();
            $co_cham_cong = $chamCongData->where('gio_vao', '!=', null)->count();
            $khong_cham_cong = $tong_ngay_cong - $co_cham_cong;

            // Thống kê theo trạng thái
            $dung_giờ = $chamCongData->whereIn('trang_thai', ['dung_gio', 'co_mat'])->count();
            $di_muon = $chamCongData->whereIn('trang_thai', ['di_muon', 'muon', 'tre'])->count();
            $ve_som = $chamCongData->whereIn('trang_thai', ['ve_som', 'som'])->count();
            $vang = $chamCongData->whereIn('trang_thai', ['vang', 'nghi'])->count();
            $khac = $chamCongData->whereNotIn('trang_thai', ['dung_gio', 'co_mat', 'di_muon', 'muon', 'tre', 've_som', 'som', 'vang', 'nghi'])->count();

            // Thống kê theo phòng ban
            $theo_phong_ban = $chamCongData->groupBy('nhanVien.phongBan.ten')
                ->map(function($group) {
                    return [
                        'phong_ban' => $group->first()->nhanVien->phongBan->ten ?? 'Không xác định',
                        'tong_ngay' => $group->count(),
                        'dung_gio' => $group->whereIn('trang_thai', ['dung_gio', 'co_mat'])->count(),
                        'di_muon' => $group->whereIn('trang_thai', ['di_muon', 'muon', 'tre'])->count(),
                        've_som' => $group->whereIn('trang_thai', ['ve_som', 'som'])->count(),
                        'vang' => $group->whereIn('trang_thai', ['vang', 'nghi'])->count(),
                    ];
                })->values();

            // Thống kê theo ngày trong tuần
            $theo_ngay_trong_tuan = $chamCongData->groupBy(function($item) {
                return Carbon::parse($item->ngay)->format('l'); // Tên ngày trong tuần
            })->map(function($group) {
                return [
                    'ngay' => $group->first()->ngay,
                    'tong_ngay' => $group->count(),
                    'dung_gio' => $group->whereIn('trang_thai', ['dung_gio', 'co_mat'])->count(),
                    'di_muon' => $group->whereIn('trang_thai', ['di_muon', 'muon', 'tre'])->count(),
                    've_som' => $group->whereIn('trang_thai', ['ve_som', 'som'])->count(),
                    'vang' => $group->whereIn('trang_thai', ['vang', 'nghi'])->count(),
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

            // Thống kê top nhân viên chấm công đúng giờ
            $top_nhan_vien_dung_gio = $chamCongData
                ->groupBy('nhan_vien_id')
                ->map(function($group) {
                    $nhanVien = $group->first()->nhanVien;
                    $dungGio = $group->whereIn('trang_thai', ['dung_gio', 'co_mat'])->count();
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
                        'tong_ngay_cong' => $tong_ngay_cong,
                        'co_cham_cong' => $co_cham_cong,
                        'khong_cham_cong' => $khong_cham_cong,
                        'ty_le_cham_cong' => $tong_ngay_cong > 0 ? round(($co_cham_cong / $tong_ngay_cong) * 100, 2) : 0
                    ],
                    'theo_trang_thai' => [
                        'dung_gio' => $dung_giờ,
                        'di_muon' => $di_muon,
                        've_som' => $ve_som,
                        'vang' => $vang,
                        'khac' => $khac
                    ],
                    'theo_phong_ban' => $theo_phong_ban,
                    'theo_ngay_trong_tuan' => $theo_ngay_trong_tuan,
                    'hom_nay' => [
                        'cham_cong' => $cham_cong_hom_nay,
                        'nhan_vien' => $nhan_vien_hom_nay,
                        'ty_le' => $ty_le_cham_cong_hom_nay
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
        $threshold = 0.6; // hoặc giá trị bạn dùng cho nhận diện
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

    // ====== Các hàm phụ trợ ======
    protected function findNhanVienByFace($inputDescriptor)
    {
        // So sánh descriptor, trả về NhanVien nếu tìm thấy
        // (Bạn có thể dùng Euclidean distance như đã làm)
        $threshold = 0.6;
        $faces = FaceData::with('nhanVien')->get();
        foreach ($faces as $face) {
            $stored = is_string($face->face_descriptor) ? json_decode($face->face_descriptor) : $face->face_descriptor;
            if (!is_array($stored)) continue;
            $distance = $this->calculateEuclideanDistance($inputDescriptor, $stored);
            if ($distance < $threshold) return $face->nhanVien;
        }
        return null;
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
            return 'dung_gio'; // Đến sớm hoặc đúng giờ
        } elseif ($tre > 0 && $tre <= $ca->phut_tre_cho_phep) {
            return 'di_muon'; // Đi muộn trong giới hạn cho phép
        } else {
            return 'di_muon'; // Đi muộn quá giới hạn
        }
    }

    protected function tinhTrangThaiRa($nhanVien, $now, $ca)
    {
        $gioRa = Carbon::parse($now);
        $gioKetThuc = Carbon::parse($ca->gio_ket_thuc);
        $som = $gioRa->diffInMinutes($gioKetThuc, false);
        
        if ($som >= 0) {
            return 'dung_gio'; // Về đúng giờ hoặc muộn
        } elseif (abs($som) <= $ca->phut_som_cho_phep) {
            return 've_som'; // Về sớm trong giới hạn cho phép
        } else {
            return 've_som'; // Về sớm quá giới hạn
        }
    }

    protected function tinhTrangThaiTongHop($trangThaiVao, $trangThaiRa)
    {
        // Logic tính trạng thái tổng hợp dựa trên giờ vào và giờ ra
        if ($trangThaiVao === 'dung_gio' && $trangThaiRa === 'dung_gio') {
            return 'dung_gio'; // Vào đúng giờ và ra đúng giờ
        } elseif ($trangThaiVao === 'di_muon') {
            return 'di_muon'; // Đi muộn (ưu tiên hơn về sớm)
        } elseif ($trangThaiRa === 've_som') {
            return 've_som'; // Về sớm
        } else {
            return 'dung_gio'; // Mặc định
        }
    }
}
