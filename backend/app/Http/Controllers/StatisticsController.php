<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\NhanVien;
use App\Models\ChamCong;
use App\Models\DonNghiPhep;
use App\Models\PhongBan;
use App\Models\ChucVu;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class StatisticsController extends Controller
{
    /**
     * Thống kê tổng quan nhân sự
     */
    public function getBasicStats(): JsonResponse
    {
        try {
            $totalEmployees = NhanVien::count();
            $activeEmployees = NhanVien::where('trang_thai', 1)->count();
            $leftEmployees = NhanVien::where('trang_thai', 0)->count();
            
            // Thống kê theo giới tính
            $genderStats = NhanVien::selectRaw('gioi_tinh, COUNT(*) as count')
                ->groupBy('gioi_tinh')
                ->get();
                
            // Thống kê theo phòng ban
            $departmentStats = NhanVien::join('phong_ban', 'nhan_vien.phong_ban_id', '=', 'phong_ban.id')
                ->selectRaw('phong_ban.ten as department_name, COUNT(*) as count')
                ->groupBy('phong_ban.id', 'phong_ban.ten')
                ->get();
                
            // Thống kê theo chức vụ
            $positionStats = NhanVien::join('chuc_vu', 'nhan_vien.chuc_vu_id', '=', 'chuc_vu.id')
                ->selectRaw('chuc_vu.ten as position_name, COUNT(*) as count')
                ->groupBy('chuc_vu.id', 'chuc_vu.ten')
                ->get();
                
            // Phân bố độ tuổi
            $ageStats = NhanVien::whereNotNull('ngay_sinh')
                ->get()
                ->groupBy(function($employee) {
                    $age = Carbon::parse($employee->ngay_sinh)->age;
                    if ($age < 25) return '18-24';
                    elseif ($age < 35) return '25-34';
                    elseif ($age < 45) return '35-44';
                    else return '45+';
                })
                ->map(function($group) {
                    return $group->count();
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_employees' => $totalEmployees,
                    'active_employees' => $activeEmployees,
                    'left_employees' => $leftEmployees,
                    'attrition_rate' => $totalEmployees > 0 ? round(($leftEmployees / $totalEmployees) * 100, 2) : 0,
                    'gender_distribution' => $genderStats,
                    'department_distribution' => $departmentStats,
                    'position_distribution' => $positionStats,
                    'age_distribution' => $ageStats,
                    'updated_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê hiệu suất chấm công
     */
    public function getAttendanceStats(): JsonResponse
    {
        try {
            $currentMonth = now()->startOfMonth();
            $lastMonth = now()->subMonth()->startOfMonth();
            
            // Thống kê chấm công tháng hiện tại
            $currentMonthStats = ChamCong::whereBetween('ngay', [$currentMonth, now()])
                ->selectRaw('
                    COUNT(*) as total_records,
                    AVG(phut_tre) as avg_late_minutes,
                    AVG(phut_som) as avg_early_minutes,
                    AVG(gio_lam_thuc_te) as avg_work_hours,
                    SUM(gio_tang_ca) as total_overtime_hours
                ')
                ->first();
                
            // Thống kê chấm công tháng trước
            $lastMonthStats = ChamCong::whereBetween('ngay', [$lastMonth, $currentMonth])
                ->selectRaw('
                    COUNT(*) as total_records,
                    AVG(phut_tre) as avg_late_minutes,
                    AVG(phut_som) as avg_early_minutes,
                    AVG(gio_lam_thuc_te) as avg_work_hours,
                    SUM(gio_tang_ca) as total_overtime_hours
                ')
                ->first();
                
            // Top 5 nhân viên đi muộn nhiều nhất
            $topLateEmployees = ChamCong::join('nhan_vien', 'cham_cong.nhan_vien_id', '=', 'nhan_vien.id')
                ->whereBetween('ngay', [$currentMonth, now()])
                ->where('phut_tre', '>', 0)
                ->selectRaw('nhan_vien.ten, COUNT(*) as late_count, AVG(phut_tre) as avg_late_minutes')
                ->groupBy('nhan_vien.id', 'nhan_vien.ten')
                ->orderBy('late_count', 'desc')
                ->limit(5)
                ->get();
                
            // Thống kê theo phòng ban
            $departmentAttendance = ChamCong::join('nhan_vien', 'cham_cong.nhan_vien_id', '=', 'nhan_vien.id')
                ->join('phong_ban', 'nhan_vien.phong_ban_id', '=', 'phong_ban.id')
                ->whereBetween('ngay', [$currentMonth, now()])
                ->selectRaw('
                    phong_ban.ten as department_name,
                    COUNT(*) as total_records,
                    AVG(phut_tre) as avg_late_minutes,
                    AVG(gio_lam_thuc_te) as avg_work_hours
                ')
                ->groupBy('phong_ban.id', 'phong_ban.ten')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'current_month' => $currentMonthStats,
                    'last_month' => $lastMonthStats,
                    'top_late_employees' => $topLateEmployees,
                    'department_attendance' => $departmentAttendance,
                    'updated_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê nghỉ phép
     */
    public function getLeaveStats(): JsonResponse
    {
        try {
            $currentMonth = now()->startOfMonth();
            $lastMonth = now()->subMonth()->startOfMonth();
            
            // Thống kê nghỉ phép tháng hiện tại
            $currentMonthLeaves = DonNghiPhep::whereBetween('ngay_nghi', [$currentMonth, now()])
                ->selectRaw('
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN trang_thai = "da_duyet" THEN 1 END) as approved_requests,
                    COUNT(CASE WHEN trang_thai = "tu_choi" THEN 1 END) as rejected_requests,
                    COUNT(CASE WHEN trang_thai = "cho_duyet" THEN 1 END) as pending_requests
                ')
                ->first();
                
            // Thống kê theo loại nghỉ
            $leaveByType = DonNghiPhep::whereBetween('ngay_nghi', [$currentMonth, now()])
                ->selectRaw('loai_nghi, COUNT(*) as count')
                ->groupBy('loai_nghi')
                ->get();
                
            // Top 5 nhân viên nghỉ nhiều nhất
            $topLeaveEmployees = DonNghiPhep::join('nhan_vien', 'don_nghi_phep.nhan_vien_id', '=', 'nhan_vien.id')
                ->whereBetween('ngay_nghi', [$currentMonth, now()])
                ->selectRaw('nhan_vien.ten, COUNT(*) as leave_count')
                ->groupBy('nhan_vien.id', 'nhan_vien.ten')
                ->orderBy('leave_count', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'current_month_leaves' => $currentMonthLeaves,
                    'leave_by_type' => $leaveByType,
                    'top_leave_employees' => $topLeaveEmployees,
                    'updated_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thống kê AI nâng cao - Phân tích xu hướng
     */
    public function getAdvancedAIStats(): JsonResponse
    {
        try {
            // Phân tích xu hướng chấm công 6 tháng gần nhất
            $attendanceTrend = ChamCong::where('ngay', '>=', now()->subMonths(6))
                ->selectRaw('
                    DATE_FORMAT(ngay, "%Y-%m") as month,
                    COUNT(*) as total_records,
                    AVG(phut_tre) as avg_late_minutes,
                    AVG(phut_som) as avg_early_minutes,
                    AVG(gio_lam_thuc_te) as avg_work_hours
                ')
                ->groupBy('month')
                ->orderBy('month')
                ->get();
                
            // Phân tích xu hướng nghỉ phép 6 tháng gần nhất
            $leaveTrend = DonNghiPhep::where('ngay_nghi', '>=', now()->subMonths(6))
                ->selectRaw('
                    DATE_FORMAT(ngay_nghi, "%Y-%m") as month,
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN trang_thai = "da_duyet" THEN 1 END) as approved_requests
                ')
                ->groupBy('month')
                ->orderBy('month')
                ->get();
                
            // Dự báo nghỉ việc (dựa trên AI model)
            $attritionPrediction = $this->getAttritionPrediction();
            
            // Phân tích rủi ro nhân sự
            $riskAnalysis = $this->getRiskAnalysis();

            return response()->json([
                'success' => true,
                'data' => [
                    'attendance_trend' => $attendanceTrend,
                    'leave_trend' => $leaveTrend,
                    'attrition_prediction' => $attritionPrediction,
                    'risk_analysis' => $riskAnalysis,
                    'updated_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dự báo nghỉ việc
     */
    private function getAttritionPrediction(): array
    {
        try {
            // Lấy dữ liệu nhân viên và tính features
            $employees = NhanVien::where('trang_thai', 1)->get();
            $employeeFeatures = [];
            
            foreach ($employees as $employee) {
                // Tính features giống như trong AiAnalysisController
                $features = $this->calculateEmployeeFeatures($employee->id);
                $features['nhan_vien_id'] = $employee->id;
                $employeeFeatures[] = $features;
            }
            
            // Gọi AI API để lấy dự đoán thực tế
            $response = Http::post('http://localhost:5000/predict_batch', [
                'employees' => $employeeFeatures
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['results'])) {
                    $predictions = [];
                    
                    foreach ($data['results'] as $prediction) {
                        if (!isset($prediction['error'])) {
                            // Chuyển đổi xác suất thành điểm rủi ro (0-100)
                            $riskScore = round($prediction['probability'] * 100);
                            $riskLevel = $prediction['risk_level'] === 'Cao' ? 'high' : 
                                       ($prediction['risk_level'] === 'Trung bình' ? 'medium' : 'low');
                            
                            // Lấy thông tin nhân viên
                            $employee = NhanVien::find($prediction['employee_id']);
                            if ($employee) {
                                $predictions[] = [
                                    'employee_id' => $employee->id,
                                    'employee_name' => $employee->ten,
                                    'risk_score' => $riskScore,
                                    'risk_level' => $riskLevel,
                                    'prediction_date' => now()->toISOString()
                                ];
                            }
                        }
                    }
                    
                    return [
                        'total_employees' => count($predictions),
                        'high_risk_count' => collect($predictions)->where('risk_level', 'high')->count(),
                        'medium_risk_count' => collect($predictions)->where('risk_level', 'medium')->count(),
                        'low_risk_count' => collect($predictions)->where('risk_level', 'low')->count(),
                        'predictions' => $predictions
                    ];
                }
            }
            
            // Fallback: trả về dữ liệu rỗng nếu không gọi được AI API
            return [
                'total_employees' => 0,
                'high_risk_count' => 0,
                'medium_risk_count' => 0,
                'low_risk_count' => 0,
                'predictions' => []
            ];
            
        } catch (\Exception $e) {
            \Log::error('Error getting AI predictions: ' . $e->getMessage());
            return [
                'total_employees' => 0,
                'high_risk_count' => 0,
                'medium_risk_count' => 0,
                'low_risk_count' => 0,
                'predictions' => []
            ];
        }
    }
    
    /**
     * Tính features cho nhân viên (copy từ AiAnalysisController)
     */
    private function calculateEmployeeFeatures(int $nhanVienId): array
    {
        // Tính số ngày đi làm
        $soNgayDiLam = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('trang_thai', 'co_mat')
            ->count();
            
        // Tính số lần đi muộn
        $soLanDiMuon = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('phut_tre', '>', 0)
            ->count();
            
        // Tính số lần về sớm
        $soLanVeSom = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->where('phut_som', '>', 0)
            ->count();
            
        // Tính giờ làm việc trung bình
        $gioLamViecTB = ChamCong::where('nhan_vien_id', $nhanVienId)
            ->whereNotNull('gio_lam_thuc_te')
            ->avg('gio_lam_thuc_te') ?? 8.0;
            
        // Tính tổng ngày nghỉ phép
        $tongNgayNghiPhep = DonNghiPhep::where('nhan_vien_id', $nhanVienId)
            ->where('trang_thai', 'da_duyet')
            ->count();
            
        // Tính số đơn nghỉ phép
        $soDonNghiPhep = DonNghiPhep::where('nhan_vien_id', $nhanVienId)->count();
        
        // Lấy thông tin nhân viên
        $nhanVien = NhanVien::find($nhanVienId);
        $soNamLamViec = $this->calculateWorkYears($nhanVien->ngay_sinh ?? null);
        $tuoi = $this->calculateAge($nhanVien->ngay_sinh ?? null);
        
        return [
            'so_ngay_di_lam' => $soNgayDiLam,
            'so_lan_di_muon' => $soLanDiMuon,
            'so_lan_ve_som' => $soLanVeSom,
            'gio_lam_viec_tb' => round($gioLamViecTB, 2),
            'tong_ngay_nghi_phep' => $tongNgayNghiPhep,
            'so_don_nghi_phep' => $soDonNghiPhep,
            'so_nam_lam_viec' => $soNamLamViec,
            'phong_ban_encoded' => 0, // Giá trị mặc định
            'chuc_vu_encoded' => 0,   // Giá trị mặc định
            'tuoi' => $tuoi
        ];
    }
    
    /**
     * Tính số năm làm việc
     */
    private function calculateWorkYears(?string $ngaySinh): int
    {
        if (!$ngaySinh) return 0;
        
        try {
            $birthDate = Carbon::parse($ngaySinh);
            $now = Carbon::now();
            return $now->diffInYears($birthDate);
        } catch (\Exception $e) {
            return 0;
        }
    }
    
    /**
     * Tính tuổi
     */
    private function calculateAge(?string $ngaySinh): int
    {
        if (!$ngaySinh) return 25;
        
        try {
            $birthDate = Carbon::parse($ngaySinh);
            $now = Carbon::now();
            return $now->diffInYears($birthDate);
        } catch (\Exception $e) {
            return 25;
        }
    }

    /**
     * Phân tích rủi ro nhân sự
     */
    private function getRiskAnalysis(): array
    {
        $currentMonth = now()->startOfMonth();
        
        // Nhân viên đi muộn nhiều (>5 lần/tháng)
        $lateRisk = ChamCong::whereBetween('ngay', [$currentMonth, now()])
            ->where('phut_tre', '>', 0)
            ->selectRaw('nhan_vien_id, COUNT(*) as late_count')
            ->groupBy('nhan_vien_id')
            ->having('late_count', '>', 5)
            ->count();
            
        // Nhân viên nghỉ phép nhiều (>3 lần/tháng)
        $leaveRisk = DonNghiPhep::whereBetween('ngay_nghi', [$currentMonth, now()])
            ->selectRaw('nhan_vien_id, COUNT(*) as leave_count')
            ->groupBy('nhan_vien_id')
            ->having('leave_count', '>', 3)
            ->count();
            
        // Nhân viên làm việc ít giờ (<6 giờ/ngày trung bình)
        $workHourRisk = ChamCong::whereBetween('ngay', [$currentMonth, now()])
            ->selectRaw('nhan_vien_id, AVG(gio_lam_thuc_te) as avg_hours')
            ->groupBy('nhan_vien_id')
            ->having('avg_hours', '<', 6)
            ->count();

        return [
            'late_risk_count' => $lateRisk,
            'leave_risk_count' => $leaveRisk,
            'work_hour_risk_count' => $workHourRisk,
            'total_risk_employees' => $lateRisk + $leaveRisk + $workHourRisk,
            'analysis_date' => now()->toISOString()
        ];
    }
} 