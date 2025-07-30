<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use App\Models\NhanVien;
use App\Models\ChamCong;
use App\Models\DonNghiPhep;

class AiAnalysisController extends Controller
{
    private $aiApiUrl = 'http://localhost:5000';

    /**
     * Dự đoán nguy cơ nghỉ việc cho một nhân viên
     */
    public function predictAttrition(Request $request): JsonResponse
    {
        try {
            $nhanVienId = $request->input('nhan_vien_id');
            
            if (!$nhanVienId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiếu nhan_vien_id'
                ], 400);
            }

            // Lấy dữ liệu nhân viên
            $nhanVien = NhanVien::find($nhanVienId);
            if (!$nhanVien) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy nhân viên'
                ], 404);
            }

            // Tính toán features từ dữ liệu thực tế
            $features = $this->calculateFeatures($nhanVienId);

            // Gọi AI API
            $response = Http::post($this->aiApiUrl . '/predict', $features);

            if ($response->successful()) {
                $result = $response->json();
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'nhan_vien' => $nhanVien,
                        'prediction' => $result['prediction'],
                        'probability' => $result['probability'],
                        'risk_level' => $result['risk_level'],
                        'features' => $features
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi khi gọi AI API: ' . $response->body()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dự đoán hàng loạt cho tất cả nhân viên
     */
    public function predictBatchAttrition(): JsonResponse
    {
        try {
            $nhanViens = NhanVien::all();
            \Log::info('Found ' . count($nhanViens) . ' employees for batch prediction');
            
            $employees = [];

            foreach ($nhanViens as $nhanVien) {
                $features = $this->calculateFeatures($nhanVien->id);
                $features['nhan_vien_id'] = $nhanVien->id;
                $employees[] = $features;
            }

            \Log::info('Prepared ' . count($employees) . ' employee features for AI API');
            \Log::info('Sample employee data: ' . json_encode($employees[0] ?? []));

            // Gọi AI API batch
            $response = Http::post($this->aiApiUrl . '/predict_batch', [
                'employees' => $employees
            ]);

            \Log::info('AI API response status: ' . $response->status());
            \Log::info('AI API response body: ' . $response->body());

            if ($response->successful()) {
                $result = $response->json();
                
                // Kết hợp kết quả với thông tin nhân viên
                $predictions = [];
                foreach ($result['results'] as $prediction) {
                    if (!isset($prediction['error'])) {
                        // Tìm nhân viên theo employee_id từ AI API
                        $employeeId = $prediction['employee_id'] ?? null;
                        $nhanVien = $nhanViens->firstWhere('id', $employeeId);
                        
                        if ($nhanVien) {
                            $predictions[] = [
                                'nhan_vien' => [
                                    'id' => $nhanVien->id,
                                    'ten' => $nhanVien->ten,
                                    'ma_nhan_vien' => $nhanVien->ma_nhan_vien
                                ],
                                'prediction' => $prediction['prediction'],
                                'probability' => $prediction['probability'],
                                'risk_level' => $prediction['risk_level']
                            ];
                        }
                    }
                }

                \Log::info('Generated ' . count($predictions) . ' predictions');

                return response()->json([
                    'success' => true,
                    'data' => [
                        'total_employees' => count($nhanViens),
                        'predictions' => $predictions
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi khi gọi AI API: ' . $response->body()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Batch prediction error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê AI
     */
    public function getAiStats(): JsonResponse
    {
        try {
            // Gọi AI API để lấy thông tin model
            $response = Http::get($this->aiApiUrl . '/model_info');

            if ($response->successful()) {
                $modelInfo = $response->json();
                
                // Thống kê nhân viên
                $totalEmployees = NhanVien::count();
                $activeEmployees = NhanVien::where('trang_thai', 1)->count(); // 1 = active
                $leftEmployees = NhanVien::where('trang_thai', 0)->count(); // 0 = inactive

                return response()->json([
                    'success' => true,
                    'data' => [
                        'model_info' => $modelInfo,
                        'employee_stats' => [
                            'total' => $totalEmployees,
                            'active' => $activeEmployees,
                            'left' => $leftEmployees,
                            'attrition_rate' => $totalEmployees > 0 ? round(($leftEmployees / $totalEmployees) * 100, 2) : 0
                        ]
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi khi gọi AI API'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thu thập dữ liệu real-time cho AI
     */
    public function collectRealTimeData(): JsonResponse
    {
        try {
            $today = now()->toDateString();
            $lastWeek = now()->subWeek()->toDateString();
            
            // Thu thập dữ liệu chấm công tuần này
            $attendanceData = ChamCong::whereBetween('ngay', [$lastWeek, $today])
                ->with('nhanVien')
                ->get()
                ->groupBy('nhan_vien_id')
                ->map(function ($records) {
                    return [
                        'so_ngay_di_lam' => $records->count(),
                        'so_lan_di_muon' => $records->where('phut_tre', '>', 0)->count(),
                        'so_lan_ve_som' => $records->where('phut_som', '>', 0)->count(),
                        'gio_lam_viec_tb' => $records->avg('gio_lam_thuc_te') ?? 8.0,
                        'tong_ngay_nghi_phep' => DonNghiPhep::where('nhan_vien_id', $records->first()->nhan_vien_id)
                            ->where('trang_thai', 'da_duyet')
                            ->whereBetween('ngay_nghi', [now()->subWeek()->toDateString(), now()->toDateString()])
                            ->count(),
                        'so_don_nghi_phep' => DonNghiPhep::where('nhan_vien_id', $records->first()->nhan_vien_id)
                            ->whereBetween('ngay_nghi', [now()->subWeek()->toDateString(), now()->toDateString()])
                            ->count(),
                        'nhan_vien_id' => $records->first()->nhan_vien_id,
                        'ten' => $records->first()->nhanVien->ten ?? 'Unknown'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_employees' => $attendanceData->count(),
                    'attendance_data' => $attendanceData->values(),
                    'collection_date' => now()->toISOString(),
                    'period' => [
                        'from' => $lastWeek,
                        'to' => $today
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi thu thập dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật model AI với dữ liệu mới
     */
    public function updateAiModel(): JsonResponse
    {
        try {
            // 1. Lấy thời điểm cập nhật model gần nhất
            $lastUpdate = $this->getLastModelUpdateTime();
            
            // 2. Lấy dữ liệu mới kể từ lần cập nhật gần nhất
            $newData = $this->collectNewDataSince($lastUpdate);
            
            // 3. Nếu không có dữ liệu mới thì trả về thông báo rõ ràng
            if (empty($newData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có dữ liệu mới để cập nhật model.'
                ], 200);
            }

            // 4. Gọi AI API để cập nhật model
            $response = Http::post($this->aiApiUrl . '/update_model', [
                'new_data' => $newData,
                'update_type' => 'incremental'
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                // 5. Lưu thời điểm cập nhật mới
                $this->saveModelUpdateTime(count($newData), $result['model_version'] ?? null);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Cập nhật model AI thành công',
                    'data' => [
                        'model_accuracy' => $result['new_accuracy'] ?? 'N/A',
                        'samples_added' => count($newData),
                        'update_time' => now()->toISOString(),
                        'model_version' => $result['model_version'] ?? 'N/A'
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi cập nhật model: ' . $response->body()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Phân tích xu hướng và cảnh báo
     */
    public function analyzeTrends(): JsonResponse
    {
        try {
            // Phân tích xu hướng chấm công
            $trends = $this->analyzeAttendanceTrends();
            
            // Phân tích xu hướng nghỉ phép
            $leaveTrends = $this->analyzeLeaveTrends();
            
            // Phát hiện bất thường
            $anomalies = $this->detectAnomalies();

            return response()->json([
                'success' => true,
                'data' => [
                    'attendance_trends' => $trends,
                    'leave_trends' => $leaveTrends,
                    'anomalies' => $anomalies,
                    'analysis_date' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi phân tích: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Phân tích xu hướng chấm công
     */
    private function analyzeAttendanceTrends(): array
    {
        $lastMonth = now()->subMonth();
        $currentMonth = now();
        
        $monthlyData = ChamCong::whereBetween('ngay', [$lastMonth->startOfMonth(), $currentMonth->endOfMonth()])
            ->selectRaw('DATE(ngay) as date, COUNT(*) as total_records, AVG(phut_tre) as avg_late, AVG(phut_som) as avg_early')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total_days' => $monthlyData->count(),
            'avg_late_minutes' => $monthlyData->avg('avg_late'),
            'avg_early_minutes' => $monthlyData->avg('avg_early'),
            'trend_direction' => $this->calculateTrendDirection($monthlyData->pluck('avg_late')),
            'daily_data' => $monthlyData
        ];
    }

    /**
     * Phân tích xu hướng nghỉ phép
     */
    private function analyzeLeaveTrends(): array
    {
        $lastMonth = now()->subMonth();
        $currentMonth = now();
        
        $leaveData = DonNghiPhep::whereBetween('ngay_nghi', [$lastMonth->startOfMonth(), $currentMonth->endOfMonth()])
            ->selectRaw('DATE(ngay_nghi) as date, COUNT(*) as total_leaves')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total_leave_days' => $leaveData->sum('total_leaves'),
            'avg_leaves_per_day' => $leaveData->avg('total_leaves'),
            'trend_direction' => $this->calculateTrendDirection($leaveData->pluck('total_leaves')),
            'daily_data' => $leaveData
        ];
    }

    /**
     * Phát hiện bất thường
     */
    private function detectAnomalies(): array
    {
        $anomalies = [];
        
        // Phát hiện nhân viên có thay đổi đột ngột
        $employees = NhanVien::all();
        
        foreach ($employees as $employee) {
            $recentAttendance = ChamCong::where('nhan_vien_id', $employee->id)
                ->where('ngay', '>=', now()->subWeek())
                ->get();
                
            $previousAttendance = ChamCong::where('nhan_vien_id', $employee->id)
                ->whereBetween('ngay', [now()->subWeeks(2), now()->subWeek()])
                ->get();
            
            if ($recentAttendance->count() > 0 && $previousAttendance->count() > 0) {
                $recentLateRate = $recentAttendance->where('phut_tre', '>', 0)->count() / $recentAttendance->count();
                $previousLateRate = $previousAttendance->where('phut_tre', '>', 0)->count() / $previousAttendance->count();
                
                // Nếu tỷ lệ đi muộn tăng > 50%
                if ($recentLateRate > $previousLateRate * 1.5) {
                    $anomalies[] = [
                        'type' => 'increased_lateness',
                        'employee_id' => $employee->id,
                        'employee_name' => $employee->ten,
                        'severity' => 'medium',
                        'description' => 'Tỷ lệ đi muộn tăng đột ngột',
                        'data' => [
                            'previous_rate' => round($previousLateRate * 100, 2),
                            'current_rate' => round($recentLateRate * 100, 2)
                        ]
                    ];
                }
            }
        }
        
        return $anomalies;
    }

    /**
     * Tính hướng xu hướng
     */
    private function calculateTrendDirection($data): string
    {
        if ($data->count() < 2) return 'stable';
        
        $firstHalf = $data->take(ceil($data->count() / 2))->avg();
        $secondHalf = $data->skip(ceil($data->count() / 2))->avg();
        
        if ($secondHalf > $firstHalf * 1.1) return 'increasing';
        if ($secondHalf < $firstHalf * 0.9) return 'decreasing';
        return 'stable';
    }

    /**
     * Tính toán features cho nhân viên
     */
    private function calculateFeatures(int $nhanVienId): array
    {
        // Tính số ngày đi làm
        $soNgayDiLam = ChamCong::where('nhan_vien_id', $nhanVienId)->count();

        // Tính số lần đi muộn (dựa trên phut_tre > 0)
        $soLanDiMuon = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('phut_tre', '>', 0)
            ->count();

        // Tính số lần về sớm (dựa trên phut_som > 0)
        $soLanVeSom = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('phut_som', '>', 0)
            ->count();

        // Tính giờ làm việc trung bình
        $gioLamViecTb = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->selectRaw('AVG(gio_lam_thuc_te) as avg_hours')
            ->first()->avg_hours ?? 8.0;

        // Tính tổng ngày nghỉ phép (dựa trên don_nghi_phep table)
        $tongNgayNghiPhep = DonNghiPhep::where('nhan_vien_id', $nhanVienId)
            ->where('trang_thai', 'da_duyet')
            ->count(); // Mỗi record là 1 ngày nghỉ

        // Tính số đơn nghỉ phép
        $soDonNghiPhep = DonNghiPhep::where('nhan_vien_id', $nhanVienId)->count();

        // Lấy thông tin nhân viên
        $nhanVien = NhanVien::find($nhanVienId);
        
        // Tính số năm làm việc (dựa trên ngày_sinh)
        $soNamLamViec = $nhanVien && $nhanVien->ngay_sinh ? 
            (now()->diffInDays($nhanVien->ngay_sinh) / 365.25) : 0;

        // Tính tuổi
        $tuoi = $nhanVien && $nhanVien->ngay_sinh ? 
            now()->diffInYears($nhanVien->ngay_sinh) : 25;

        return [
            'so_ngay_di_lam' => $soNgayDiLam,
            'so_lan_di_muon' => $soLanDiMuon,
            'so_lan_ve_som' => $soLanVeSom,
            'gio_lam_viec_tb' => round($gioLamViecTb, 2),
            'tong_ngay_nghi_phep' => $tongNgayNghiPhep,
            'so_don_nghi_phep' => $soDonNghiPhep,
            'so_nam_lam_viec' => round($soNamLamViec, 2),
            'phong_ban_encoded' => $nhanVien ? $nhanVien->phong_ban_id : 0,
            'chuc_vu_encoded' => $nhanVien ? $nhanVien->chuc_vu_id : 0,
            'tuoi' => $tuoi
        ];
    }

    /**
     * Lấy thời điểm cập nhật model gần nhất
     */
    private function getLastModelUpdateTime(): string
    {
        $lastUpdate = \DB::table('ai_model_updates')
            ->orderBy('last_update', 'desc')
            ->value('last_update');
            
        return $lastUpdate ?? '2024-01-01 00:00:00';
    }

    /**
     * Lưu thời điểm cập nhật model
     */
    private function saveModelUpdateTime(int $samplesAdded, ?string $modelVersion = null): void
    {
        \DB::table('ai_model_updates')->insert([
            'last_update' => now(),
            'samples_added' => $samplesAdded,
            'model_version' => $modelVersion,
            'update_notes' => 'Cập nhật tự động từ dữ liệu mới',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Thu thập dữ liệu mới kể từ thời điểm cập nhật gần nhất
     */
    private function collectNewDataSince(string $lastUpdate): array
    {
        $newData = [];
        
        // Lấy các bản ghi chấm công mới
        $newChamCong = ChamCong::where('ngay', '>', $lastUpdate)->get();
        
        // Lấy các đơn nghỉ phép mới
        $newDonNghiPhep = DonNghiPhep::where('ngay_nghi', '>', $lastUpdate)->get();
        
        // Nhóm theo nhân viên và tính toán features mới
        $nhanVienIds = $newChamCong->pluck('nhan_vien_id')->unique()
            ->merge($newDonNghiPhep->pluck('nhan_vien_id')->unique())
            ->unique();
            
        foreach ($nhanVienIds as $nhanVienId) {
            $features = $this->calculateNewFeatures($nhanVienId, $lastUpdate);
            if (!empty($features)) {
                $newData[] = $features;
            }
        }
        
        return $newData;
    }

    /**
     * Tính toán features mới cho một nhân viên kể từ thời điểm cập nhật
     */
    private function calculateNewFeatures(int $nhanVienId, string $lastUpdate): array
    {
        // Lấy dữ liệu chấm công mới
        $newChamCong = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('ngay', '>', $lastUpdate)
            ->get();
            
        // Lấy dữ liệu nghỉ phép mới
        $newDonNghiPhep = DonNghiPhep::where('nhan_vien_id', $nhanVienId)
            ->where('ngay_nghi', '>', $lastUpdate)
            ->get();
            
        // Nếu không có dữ liệu mới thì bỏ qua
        if ($newChamCong->isEmpty() && $newDonNghiPhep->isEmpty()) {
            return [];
        }
        
        // Tính toán features mới
        $features = [
            'nhan_vien_id' => $nhanVienId,
            'so_ngay_di_lam' => $newChamCong->count(),
            'so_lan_di_muon' => $newChamCong->where('phut_tre', '>', 0)->count(),
            'so_lan_ve_som' => $newChamCong->where('phut_som', '>', 0)->count(),
            'gio_lam_viec_tb' => $newChamCong->avg('gio_lam_thuc_te') ?? 8.0,
            'tong_ngay_nghi_phep' => $newDonNghiPhep->where('trang_thai', 'da_duyet')->count(),
            'so_don_nghi_phep' => $newDonNghiPhep->count(),
        ];
        
        // Thêm thông tin nhân viên
        $nhanVien = NhanVien::find($nhanVienId);
        if ($nhanVien && $nhanVien->ngay_sinh) {
            $features['so_nam_lam_viec'] = $this->calculateWorkYears($nhanVien->ngay_sinh);
            $features['phong_ban_encoded'] = $nhanVien->phong_ban_id;
            $features['chuc_vu_encoded'] = $nhanVien->chuc_vu_id;
            $features['tuoi'] = $this->calculateAge($nhanVien->ngay_sinh);
        } else {
            // Giá trị mặc định nếu không có ngày sinh
            $features['so_nam_lam_viec'] = 0;
            $features['phong_ban_encoded'] = $nhanVien->phong_ban_id ?? 0;
            $features['chuc_vu_encoded'] = $nhanVien->chuc_vu_id ?? 0;
            $features['tuoi'] = 25; // Tuổi mặc định
        }
        
        return $features;
    }

    /**
     * Tính số năm làm việc
     */
    private function calculateWorkYears(?string $ngaySinh): int
    {
        if (!$ngaySinh) {
            return 0;
        }
        
        try {
            $birthDate = \Carbon\Carbon::parse($ngaySinh);
            $workStartAge = 22; // Giả sử bắt đầu làm việc từ 22 tuổi
            $currentAge = $birthDate->age;
            return max(0, $currentAge - $workStartAge);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Tính tuổi
     */
    private function calculateAge(?string $ngaySinh): int
    {
        if (!$ngaySinh) {
            return 25; // Tuổi mặc định
        }
        
        try {
            return \Carbon\Carbon::parse($ngaySinh)->age;
        } catch (\Exception $e) {
            return 25; // Tuổi mặc định nếu lỗi
        }
    }
} 