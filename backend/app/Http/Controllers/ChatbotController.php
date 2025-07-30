<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\GeminiService;

class ChatbotController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
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
     * Handle chatbot conversation with Gemini
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

            // Create system prompt for QLNS context
            $systemPrompt = $this->getSystemPrompt();
            
            // Prepare the conversation
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

            return response()->json([
                'success' => true,
                'response' => $response['response'],
                'model' => $response['model'] ?? 'gemini-pro'
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
     * Get system prompt for QLNS context
     */
    private function getSystemPrompt(): string
    {
        return "Bạn là AI Assistant chuyên gia QLNS. Trả lời ngắn gọn, chính xác.

HỆ THỐNG QLNS:
- Chấm công: Nhận diện khuôn mặt, ghi giờ vào/ra
- Nhân viên: Quản lý thông tin, phòng ban, chức vụ  
- Nghỉ phép: Đăng ký, duyệt đơn nghỉ
- Báo cáo: Excel, thống kê, dashboard
- AI: Dự đoán nghỉ việc, phân tích xu hướng

TRẢ LỜI:
- Ngắn gọn, rõ ràng
- Tiếng Việt
- Hướng dẫn cụ thể từng bước
- Nếu không biết: 'Liên hệ admin'";
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