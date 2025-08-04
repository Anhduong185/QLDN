<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\GeminiService;
use App\Services\ChatbotLearningService;
use App\Models\NhanVien;
use App\Models\ChamCong;
use App\Models\DonNghiPhep;
use App\Models\PhongBan;
use App\Models\ChucVu;
use App\Models\AccessLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChatbotController extends Controller
{
    protected $geminiService;
    protected $learningService;

    public function __construct(GeminiService $geminiService, ChatbotLearningService $learningService)
    {
        $this->geminiService = $geminiService;
        $this->learningService = $learningService;
    }

    /**
     * Test endpoint
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Chatbot API is working!',
            'timestamp' => now()
        ]);
    }

    /**
     * Handle chatbot conversation with enhanced context
     */
    public function chatWithGemini(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000',
                'context' => 'nullable|string|max:500'
            ]);

            $message = $request->input('message');
            $context = $request->input('context', 'QLNS System Assistant');

            // Analyze message intent and gather relevant data
            $systemData = $this->analyzeSystemData($message);
            
            // Get learned insights from the learning service
            $learnedInsights = $this->learningService->getLearnedInsights();
            $systemData['learned_insights'] = $learnedInsights;
            
            $systemPrompt = $this->getEnhancedSystemPrompt($systemData);
            
            // Prepare the conversation with enhanced context
            $conversation = [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ];

            // Get response from Gemini
            $response = $this->geminiService->generateResponse($conversation);

            if (!$response['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi khi xử lý câu hỏi: ' . $response['message']
                ], 500);
            }

            // Log conversation for learning
            $this->logConversation($message, $response['response'], $systemData);

            return response()->json([
                'success' => true,
                'response' => $response['response'],
                'model' => $response['model'] ?? 'gemini-pro',
                'context_used' => $systemData['context_type'] ?? 'general'
            ]);

        } catch (\Exception $e) {
            \Log::error('Chatbot error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Analyze message and gather relevant system data
     */
    private function analyzeSystemData(string $message): array
    {
        $message = strtolower($message);
        $data = [
            'context_type' => 'general',
            'employee_count' => 0,
            'attendance_today' => 0,
            'leave_requests' => 0,
            'departments' => [],
            'positions' => [],
            'recent_activities' => []
        ];

        // Check for employee-related queries
        if (strpos($message, 'nhân viên') !== false || strpos($message, 'nhân sự') !== false) {
            $data['context_type'] = 'employee';
            $data['employee_count'] = NhanVien::count();
            $data['departments'] = PhongBan::withCount('nhanViens')->get()->toArray();
            $data['positions'] = ChucVu::withCount('nhanViens')->get()->toArray();
        }

        // Check for attendance-related queries
        if (strpos($message, 'chấm công') !== false || strpos($message, 'giờ làm') !== false || strpos($message, 'attendance') !== false) {
            $data['context_type'] = 'attendance';
            $data['attendance_today'] = ChamCong::whereDate('ngay', today())->count();
            $data['recent_activities'] = AccessLog::with('nhanVien')
                ->latest()
                ->limit(5)
                ->get()
                ->toArray();
        }

        // Check for leave-related queries
        if (strpos($message, 'nghỉ phép') !== false || strpos($message, 'đơn nghỉ') !== false) {
            $data['context_type'] = 'leave';
            $data['leave_requests'] = DonNghiPhep::where('trang_thai', 'pending')->count();
        }

        // Check for statistics queries
        if (strpos($message, 'thống kê') !== false || strpos($message, 'báo cáo') !== false || strpos($message, 'statistics') !== false) {
            $data['context_type'] = 'statistics';
            $data['employee_count'] = NhanVien::count();
            $data['attendance_today'] = ChamCong::whereDate('ngay', today())->count();
            $data['leave_requests'] = DonNghiPhep::where('trang_thai', 'pending')->count();
        }

        return $data;
    }

    /**
     * Get enhanced system prompt with real data
     */
    private function getEnhancedSystemPrompt(array $systemData): string
    {
        $basePrompt = "Bạn là AI Assistant chuyên gia QLNS với khả năng truy cập dữ liệu thực từ hệ thống. Trả lời chính xác, hữu ích và dựa trên dữ liệu thực tế.

HỆ THỐNG QLNS:
- Chấm công: Nhận diện khuôn mặt, ghi giờ vào/ra, theo dõi thời gian làm việc
- Nhân viên: Quản lý thông tin cá nhân, phòng ban, chức vụ, lịch sử công việc
- Nghỉ phép: Đăng ký, duyệt đơn nghỉ, quản lý ngày nghỉ
- Báo cáo: Excel, thống kê, dashboard, phân tích xu hướng
- AI: Dự đoán nghỉ việc, phân tích xu hướng, cảnh báo sớm

DỮ LIỆU THỰC TẾ:";

        // Add real data based on context
        switch ($systemData['context_type']) {
            case 'employee':
                $basePrompt .= "\n- Tổng số nhân viên: {$systemData['employee_count']}";
                if (!empty($systemData['departments'])) {
                    $basePrompt .= "\n- Phòng ban: " . count($systemData['departments']) . " phòng";
                }
                if (!empty($systemData['positions'])) {
                    $basePrompt .= "\n- Chức vụ: " . count($systemData['positions']) . " chức vụ";
                }
                break;

            case 'attendance':
                $basePrompt .= "\n- Chấm công hôm nay: {$systemData['attendance_today']} lượt";
                if (!empty($systemData['recent_activities'])) {
                    $basePrompt .= "\n- Hoạt động gần đây: " . count($systemData['recent_activities']) . " hoạt động";
                }
                break;

            case 'leave':
                $basePrompt .= "\n- Đơn nghỉ phép chờ duyệt: {$systemData['leave_requests']} đơn";
                break;

            case 'statistics':
                $basePrompt .= "\n- Tổng số nhân viên: {$systemData['employee_count']}";
                $basePrompt .= "\n- Chấm công hôm nay: {$systemData['attendance_today']} lượt";
                $basePrompt .= "\n- Đơn nghỉ phép chờ duyệt: {$systemData['leave_requests']} đơn";
                break;
        }

        $basePrompt .= "\n\nTRẢ LỜI:
- Ngắn gọn, chính xác, dựa trên dữ liệu thực
- Tiếng Việt, dễ hiểu
- Hướng dẫn cụ thể từng bước nếu cần
- Nếu không có dữ liệu: 'Dữ liệu chưa có sẵn, vui lòng liên hệ admin'
- Luôn cập nhật thông tin mới nhất từ hệ thống
- Sử dụng insights học được để đưa ra gợi ý thông minh";

        return $basePrompt;
    }

    /**
     * Log conversation for learning purposes
     */
    private function logConversation(string $userMessage, string $botResponse, array $context): void
    {
        try {
            // Store conversation in cache for learning
            $conversationKey = 'chatbot_conversation_' . date('Y-m-d');
            $conversations = cache()->get($conversationKey, []);
            
            $conversations[] = [
                'timestamp' => now(),
                'user_message' => $userMessage,
                'bot_response' => $botResponse,
                'context_type' => $context['context_type'],
                'system_data' => $context
            ];

            // Keep only last 100 conversations
            if (count($conversations) > 100) {
                $conversations = array_slice($conversations, -100);
            }

            cache()->put($conversationKey, $conversations, 86400); // 24 hours
        } catch (\Exception $e) {
            \Log::error('Failed to log conversation: ' . $e->getMessage());
        }
    }

    /**
     * Get conversation history for learning
     */
    public function getConversationHistory(): JsonResponse
    {
        try {
            $conversationKey = 'chatbot_conversation_' . date('Y-m-d');
            $conversations = cache()->get($conversationKey, []);

            return response()->json([
                'success' => true,
                'conversations' => $conversations,
                'total' => count($conversations)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lấy lịch sử hội thoại'
            ], 500);
        }
    }

    /**
     * Update learning data
     */
    public function updateLearningData(): JsonResponse
    {
        try {
            $this->learningService->updateLearningData();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật dữ liệu học thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật dữ liệu học: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get smart suggestions
     */
    public function getSmartSuggestions(): JsonResponse
    {
        try {
            $suggestions = $this->learningService->generateSmartSuggestions();
            
            return response()->json([
                'success' => true,
                'suggestions' => $suggestions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lấy gợi ý thông minh: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system statistics for chatbot
     */
    public function getSystemStats(): JsonResponse
    {
        try {
            $stats = [
                'employees' => [
                    'total' => NhanVien::count(),
                    'active' => NhanVien::where('trang_thai', 'active')->count(),
                    'departments' => PhongBan::count(),
                    'positions' => ChucVu::count()
                ],
                'attendance' => [
                    'today' => ChamCong::whereDate('ngay', today())->count(),
                    'this_week' => ChamCong::whereBetween('ngay', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'recent_logs' => AccessLog::whereDate('thoi_gian', today())->count()
                ],
                'leave' => [
                    'pending' => DonNghiPhep::where('trang_thai', 'pending')->count(),
                    'approved' => DonNghiPhep::where('trang_thai', 'approved')->count(),
                    'rejected' => DonNghiPhep::where('trang_thai', 'rejected')->count()
                ]
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lấy thống kê hệ thống'
            ], 500);
        }
    }

    /**
     * Switch AI model
     */
    public function switchModel(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'model' => 'required|string|in:gemini-1.5-flash,gemini-1.5-pro,gemini-1.5-flash-exp'
            ]);

            $model = $request->input('model');
            $this->geminiService->switchModel($model);

            return response()->json([
                'success' => true,
                'message' => 'Đã chuyển sang model: ' . $model,
                'current_model' => $this->geminiService->getCurrentModel()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi chuyển model: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'models' => $this->geminiService->getAvailableModels(),
                'current_model' => $this->geminiService->getCurrentModel()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lấy danh sách model: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chatbot status
     */
    public function getStatus(): JsonResponse
    {
        try {
            $status = $this->geminiService->testConnection();
            
            return response()->json([
                'success' => true,
                'status' => $status['success'] ? 'online' : 'offline',
                'model' => $this->geminiService->getCurrentModel(),
                'message' => $status['success'] ? 'Chatbot đang hoạt động' : 'Chatbot tạm thời không khả dụng'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Lỗi kiểm tra trạng thái chatbot'
            ], 500);
        }
    }
} 