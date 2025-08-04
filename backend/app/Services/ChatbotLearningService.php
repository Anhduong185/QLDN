<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\NhanVien;
use App\Models\ChamCong;
use App\Models\DonNghiPhep;
use App\Models\AccessLog;
use Carbon\Carbon;

class ChatbotLearningService
{
    /**
     * Analyze system patterns and learn from data
     */
    public function analyzeSystemPatterns(): array
    {
        try {
            $patterns = [
                'employee_patterns' => $this->analyzeEmployeePatterns(),
                'attendance_patterns' => $this->analyzeAttendancePatterns(),
                'leave_patterns' => $this->analyzeLeavePatterns(),
                'system_usage_patterns' => $this->analyzeSystemUsagePatterns()
            ];

            // Cache the patterns for 1 hour
            Cache::put('chatbot_system_patterns', $patterns, 3600);

            return $patterns;
        } catch (\Exception $e) {
            Log::error('ChatbotLearningService: Error analyzing patterns: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Analyze employee-related patterns
     */
    private function analyzeEmployeePatterns(): array
    {
        $patterns = [];

        try {
            // Department distribution
            $departmentStats = NhanVien::with('phongBan')
                ->selectRaw('phong_ban_id, COUNT(*) as count')
                ->groupBy('phong_ban_id')
                ->get();

            $patterns['department_distribution'] = $departmentStats->map(function ($item) {
                return [
                    'department' => $item->phongBan->ten ?? 'Không xác định',
                    'count' => $item->count
                ];
            })->toArray();

            // Position distribution
            $positionStats = NhanVien::with('chucVu')
                ->selectRaw('chuc_vu_id, COUNT(*) as count')
                ->groupBy('chuc_vu_id')
                ->get();

            $patterns['position_distribution'] = $positionStats->map(function ($item) {
                return [
                    'position' => $item->chucVu->ten ?? 'Không xác định',
                    'count' => $item->count
                ];
            })->toArray();

            // Status distribution
            $statusStats = NhanVien::selectRaw('trang_thai, COUNT(*) as count')
                ->groupBy('trang_thai')
                ->get();

            $patterns['status_distribution'] = $statusStats->toArray();

        } catch (\Exception $e) {
            Log::error('ChatbotLearningService: Error analyzing employee patterns: ' . $e->getMessage());
        }

        return $patterns;
    }

    /**
     * Analyze attendance patterns
     */
    private function analyzeAttendancePatterns(): array
    {
        $patterns = [];

        try {
            // Daily attendance trends (last 7 days)
            $dailyStats = ChamCong::selectRaw('DATE(ngay) as date, COUNT(*) as count')
                ->whereBetween('ngay', [now()->subDays(7), now()])
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $patterns['daily_trends'] = $dailyStats->toArray();

            // Time-based patterns
            $timeStats = AccessLog::selectRaw('HOUR(thoi_gian) as hour, COUNT(*) as count')
                ->whereDate('thoi_gian', today())
                ->groupBy('hour')
                ->orderBy('hour')
                ->get();

            $patterns['hourly_patterns'] = $timeStats->toArray();

            // Check-in vs Check-out patterns
            $eventStats = AccessLog::selectRaw('loai_su_kien, COUNT(*) as count')
                ->whereDate('thoi_gian', today())
                ->groupBy('loai_su_kien')
                ->get();

            $patterns['event_distribution'] = $eventStats->toArray();

        } catch (\Exception $e) {
            Log::error('ChatbotLearningService: Error analyzing attendance patterns: ' . $e->getMessage());
        }

        return $patterns;
    }

    /**
     * Analyze leave request patterns
     */
    private function analyzeLeavePatterns(): array
    {
        $patterns = [];

        try {
            // Status distribution
            $statusStats = DonNghiPhep::selectRaw('trang_thai, COUNT(*) as count')
                ->groupBy('trang_thai')
                ->get();

            $patterns['status_distribution'] = $statusStats->toArray();

            // Monthly trends
            $monthlyStats = DonNghiPhep::selectRaw('MONTH(ngay_bat_dau) as month, COUNT(*) as count')
                ->whereYear('ngay_bat_dau', now()->year)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $patterns['monthly_trends'] = $monthlyStats->toArray();

            // Duration patterns
            $durationStats = DonNghiPhep::selectRaw('
                CASE 
                    WHEN DATEDIFF(ngay_ket_thuc, ngay_bat_dau) <= 1 THEN "1 ngày"
                    WHEN DATEDIFF(ngay_ket_thuc, ngay_bat_dau) <= 3 THEN "2-3 ngày"
                    WHEN DATEDIFF(ngay_ket_thuc, ngay_bat_dau) <= 7 THEN "4-7 ngày"
                    ELSE "Trên 7 ngày"
                END as duration_category,
                COUNT(*) as count
            ')
            ->groupBy('duration_category')
            ->get();

            $patterns['duration_distribution'] = $durationStats->toArray();

        } catch (\Exception $e) {
            Log::error('ChatbotLearningService: Error analyzing leave patterns: ' . $e->getMessage());
        }

        return $patterns;
    }

    /**
     * Analyze system usage patterns
     */
    private function analyzeSystemUsagePatterns(): array
    {
        $patterns = [];

        try {
            // Recent activity patterns
            $recentActivity = AccessLog::with('nhanVien')
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($log) {
                    return [
                        'employee' => $log->nhanVien->ten ?? 'Không xác định',
                        'event' => $log->loai_su_kien,
                        'time' => is_string($log->thoi_gian) ? $log->thoi_gian : $log->thoi_gian->format('H:i'),
                        'location' => $log->vi_tri
                    ];
                });

            $patterns['recent_activities'] = $recentActivity->toArray();

            // Peak usage times
            $peakTimes = AccessLog::selectRaw('HOUR(thoi_gian) as hour, COUNT(*) as count')
                ->whereBetween('thoi_gian', [now()->subDays(7), now()])
                ->groupBy('hour')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get();

            $patterns['peak_usage_times'] = $peakTimes->toArray();

        } catch (\Exception $e) {
            Log::error('ChatbotLearningService: Error analyzing system usage patterns: ' . $e->getMessage());
        }

        return $patterns;
    }

    /**
     * Get learned insights for chatbot responses
     */
    public function getLearnedInsights(): array
    {
        $patterns = Cache::get('chatbot_system_patterns');
        
        if (!$patterns) {
            $patterns = $this->analyzeSystemPatterns();
        }

        $insights = [];

        // Employee insights
        if (isset($patterns['employee_patterns'])) {
            $empPatterns = $patterns['employee_patterns'];
            
            if (isset($empPatterns['department_distribution'])) {
                $largestDept = collect($empPatterns['department_distribution'])
                    ->sortByDesc('count')
                    ->first();
                
                if ($largestDept) {
                    $insights['largest_department'] = $largestDept['department'];
                    $insights['largest_dept_count'] = $largestDept['count'];
                }
            }

            if (isset($empPatterns['status_distribution'])) {
                $activeCount = collect($empPatterns['status_distribution'])
                    ->where('trang_thai', 'active')
                    ->first()['count'] ?? 0;
                
                $insights['active_employees'] = $activeCount;
            }
        }

        // Attendance insights
        if (isset($patterns['attendance_patterns'])) {
            $attPatterns = $patterns['attendance_patterns'];
            
            if (isset($attPatterns['daily_trends'])) {
                $todayCount = collect($attPatterns['daily_trends'])
                    ->where('date', today()->toDateString())
                    ->first()['count'] ?? 0;
                
                $insights['today_attendance'] = $todayCount;
            }

            if (isset($attPatterns['hourly_patterns'])) {
                $peakHour = collect($attPatterns['hourly_patterns'])
                    ->sortByDesc('count')
                    ->first();
                
                if ($peakHour) {
                    $insights['peak_hour'] = $peakHour['hour'];
                    $insights['peak_hour_count'] = $peakHour['count'];
                }
            }
        }

        // Leave insights
        if (isset($patterns['leave_patterns'])) {
            $leavePatterns = $patterns['leave_patterns'];
            
            if (isset($leavePatterns['status_distribution'])) {
                $pendingCount = collect($leavePatterns['status_distribution'])
                    ->where('trang_thai', 'pending')
                    ->first()['count'] ?? 0;
                
                $insights['pending_leaves'] = $pendingCount;
            }
        }

        return $insights;
    }

    /**
     * Generate smart suggestions based on patterns
     */
    public function generateSmartSuggestions(): array
    {
        $insights = $this->getLearnedInsights();
        $suggestions = [];

        // Attendance suggestions
        if (isset($insights['today_attendance'])) {
            if ($insights['today_attendance'] < 10) {
                $suggestions[] = "Hôm nay có ít nhân viên chấm công ({$insights['today_attendance']} lượt). Có thể cần kiểm tra hệ thống.";
            } elseif ($insights['today_attendance'] > 50) {
                $suggestions[] = "Hôm nay có nhiều nhân viên chấm công ({$insights['today_attendance']} lượt). Hệ thống hoạt động tốt.";
            }
        }

        // Leave suggestions
        if (isset($insights['pending_leaves']) && $insights['pending_leaves'] > 5) {
            $suggestions[] = "Có {$insights['pending_leaves']} đơn nghỉ phép chờ duyệt. Cần xử lý sớm.";
        }

        // Department suggestions
        if (isset($insights['largest_department'])) {
            $suggestions[] = "Phòng ban lớn nhất: {$insights['largest_department']} với {$insights['largest_dept_count']} nhân viên.";
        }

        return $suggestions;
    }

    /**
     * Update learning data
     */
    public function updateLearningData(): void
    {
        try {
            // Analyze new patterns
            $this->analyzeSystemPatterns();
            
            // Clear old conversation cache (keep only last 7 days)
            $oldKeys = [];
            for ($i = 7; $i < 30; $i++) {
                $oldKeys[] = 'chatbot_conversation_' . now()->subDays($i)->format('Y-m-d');
            }
            
            foreach ($oldKeys as $key) {
                Cache::forget($key);
            }

            Log::info('ChatbotLearningService: Learning data updated successfully');
        } catch (\Exception $e) {
            Log::error('ChatbotLearningService: Error updating learning data: ' . $e->getMessage());
        }
    }
} 