<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    protected $model = 'gemini-1.5-flash';
    protected $fallbackModel = 'gemini-1.5-pro';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY'));
    }

    /**
     * Generate response from Gemini with enhanced learning
     */
    public function generateResponse(array $conversation): array
    {
        try {
            if (!$this->apiKey) {
                Log::error('GeminiService: API key not configured');
                return [
                    'success' => false,
                    'message' => 'Gemini API key chưa được cấu hình'
                ];
            }

            // Enhance conversation with learning data
            $enhancedConversation = $this->enhanceConversationWithLearning($conversation);
            
            // Check cache for common questions
            $cacheKey = $this->getCacheKey($enhancedConversation);
            $cachedResponse = cache()->get($cacheKey);
            if ($cachedResponse) {
                Log::info('GeminiService: Using cached response');
                return $cachedResponse;
            }

            $url = $this->baseUrl . $this->model . ':generateContent?key=' . $this->apiKey;

            // Convert conversation to Gemini format
            $contents = [];
            foreach ($enhancedConversation as $message) {
                $contents[] = [
                    'role' => $message['role'] === 'system' ? 'user' : $message['role'],
                    'parts' => [
                        ['text' => $message['content']]
                    ]
                ];
            }

            Log::info('GeminiService: Sending request to Gemini API', [
                'model' => $this->model,
                'message_count' => count($contents),
                'enhanced' => count($enhancedConversation) > count($conversation)
            ]);

            $response = Http::timeout(15)->post($url, [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.3,
                    'topK' => 20,
                    'topP' => 0.8,
                    'maxOutputTokens' => 512,
                ],
                'safetySettings' => [
                    [
                        'category' => 'HARM_CATEGORY_HARASSMENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_HATE_SPEECH',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $responseText = $data['candidates'][0]['content']['parts'][0]['text'];
                    Log::info('GeminiService: Successfully generated response', [
                        'model' => $this->model,
                        'response_length' => strlen($responseText)
                    ]);
                    
                    $result = [
                        'success' => true,
                        'response' => $responseText,
                        'model' => $this->model
                    ];

                    // Cache the response for 1 hour
                    cache()->put($cacheKey, $result, 3600);
                    
                    return $result;
                } else {
                    Log::warning('GeminiService: No valid response in API response', [
                        'response_data' => $data
                    ]);
                    // Try fallback model
                    return $this->tryFallbackModel($enhancedConversation);
                }
            } else {
                $errorBody = $response->body();
                Log::error('GeminiService: API request failed', [
                    'status' => $response->status(),
                    'body' => $errorBody,
                    'model' => $this->model
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Lỗi kết nối Gemini API: ' . $response->status() . ' - ' . $errorBody
                ];
            }

        } catch (\Exception $e) {
            Log::error('GeminiService: Exception occurred', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'model' => $this->model
            ]);
            
            return [
                'success' => false,
                'message' => 'Lỗi xử lý: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Enhance conversation with learning data from previous conversations
     */
    private function enhanceConversationWithLearning(array $conversation): array
    {
        try {
            // Get recent conversation history for learning
            $conversationKey = 'chatbot_conversation_' . date('Y-m-d');
            $recentConversations = cache()->get($conversationKey, []);
            
            if (empty($recentConversations)) {
                return $conversation;
            }

            // Extract user message for pattern matching
            $userMessage = '';
            foreach ($conversation as $message) {
                if ($message['role'] === 'user') {
                    $userMessage = strtolower(trim($message['content']));
                    break;
                }
            }

            if (empty($userMessage)) {
                return $conversation;
            }

            // Find similar previous conversations
            $similarConversations = $this->findSimilarConversations($userMessage, $recentConversations);
            
            if (!empty($similarConversations)) {
                // Add learning context to system message
                $learningContext = $this->buildLearningContext($similarConversations);
                
                // Enhance the system message
                foreach ($conversation as &$message) {
                    if ($message['role'] === 'system') {
                        $message['content'] .= "\n\nHỌC TỪ LỊCH SỬ HỘI THOẠI:\n" . $learningContext;
                        break;
                    }
                }
            }

            return $conversation;
        } catch (\Exception $e) {
            Log::error('GeminiService: Error enhancing conversation with learning: ' . $e->getMessage());
            return $conversation;
        }
    }

    /**
     * Find similar conversations based on user message
     */
    private function findSimilarConversations(string $userMessage, array $recentConversations): array
    {
        $similarConversations = [];
        $keywords = $this->extractKeywords($userMessage);

        foreach ($recentConversations as $conversation) {
            $conversationMessage = strtolower(trim($conversation['user_message']));
            $conversationKeywords = $this->extractKeywords($conversationMessage);
            
            // Calculate similarity score
            $similarityScore = $this->calculateSimilarity($keywords, $conversationKeywords);
            
            if ($similarityScore > 0.3) { // 30% similarity threshold
                $similarConversations[] = [
                    'conversation' => $conversation,
                    'similarity' => $similarityScore
                ];
            }
        }

        // Sort by similarity and return top 3
        usort($similarConversations, function($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });

        return array_slice($similarConversations, 0, 3);
    }

    /**
     * Extract keywords from message
     */
    private function extractKeywords(string $message): array
    {
        // Remove common words and extract meaningful keywords
        $commonWords = ['là', 'của', 'và', 'hoặc', 'từ', 'đến', 'trong', 'ngoài', 'trên', 'dưới', 'với', 'cho', 'bởi', 'tại', 'về', 'như', 'thì', 'mà', 'nếu', 'khi', 'để', 'vì', 'sau', 'trước', 'giữa', 'bên', 'cạnh', 'gần', 'xa', 'lớn', 'nhỏ', 'cao', 'thấp', 'nhanh', 'chậm', 'tốt', 'xấu', 'mới', 'cũ', 'đúng', 'sai', 'có', 'không', 'đã', 'sẽ', 'đang', 'vẫn', 'còn', 'hết', 'thêm', 'bớt', 'tăng', 'giảm', 'thay', 'đổi', 'sửa', 'xóa', 'tạo', 'thêm', 'lấy', 'gửi', 'nhận', 'xem', 'tìm', 'kiểm', 'tra', 'báo', 'cáo', 'thống', 'kê', 'phân', 'tích', 'dự', 'đoán', 'cảnh', 'báo', 'hướng', 'dẫn', 'giải', 'thích', 'mô', 'tả', 'liệt', 'kê', 'so', 'sánh', 'đánh', 'giá', 'nhận', 'xét', 'góp', 'ý', 'phản', 'hồi', 'yêu', 'cầu', 'đề', 'xuất', 'kiến', 'nghị', 'thắc', 'mắc', 'câu', 'hỏi', 'trả', 'lời', 'giải', 'đáp', 'hỗ', 'trợ', 'giúp', 'đỡ', 'tư', 'vấn', 'tư', 'vấn', 'tư', 'vấn'];
        
        $words = preg_split('/\s+/', $message);
        $keywords = [];
        
        foreach ($words as $word) {
            $word = trim($word);
            if (strlen($word) > 2 && !in_array($word, $commonWords)) {
                $keywords[] = $word;
            }
        }
        
        return array_unique($keywords);
    }

    /**
     * Calculate similarity between two keyword sets
     */
    private function calculateSimilarity(array $keywords1, array $keywords2): float
    {
        if (empty($keywords1) || empty($keywords2)) {
            return 0.0;
        }

        $intersection = array_intersect($keywords1, $keywords2);
        $union = array_unique(array_merge($keywords1, $keywords2));
        
        return count($intersection) / count($union);
    }

    /**
     * Build learning context from similar conversations
     */
    private function buildLearningContext(array $similarConversations): string
    {
        $context = "Dựa trên các cuộc hội thoại tương tự trước đây:\n";
        
        foreach ($similarConversations as $index => $item) {
            $conversation = $item['conversation'];
            $context .= ($index + 1) . ". Câu hỏi: " . $conversation['user_message'] . "\n";
            $context .= "   Trả lời: " . substr($conversation['bot_response'], 0, 200) . "...\n";
            $context .= "   Độ tương tự: " . round($item['similarity'] * 100, 1) . "%\n\n";
        }
        
        $context .= "Hãy sử dụng thông tin này để cải thiện câu trả lời hiện tại.";
        
        return $context;
    }

    /**
     * Try fallback model if primary model fails
     */
    private function tryFallbackModel(array $conversation): array
    {
        try {
            $originalModel = $this->model;
            $this->model = $this->fallbackModel;
            
            $result = $this->generateResponse($conversation);
            
            $this->model = $originalModel;
            
            if ($result['success']) {
                $result['model'] = $this->fallbackModel;
                $result['response'] = $result['response'] . "\n\n*Sử dụng model dự phòng*";
            }
            
            return $result;
        } catch (\Exception $e) {
            $this->model = $originalModel;
            return [
                'success' => false,
                'message' => 'Cả hai model đều không khả dụng'
            ];
        }
    }

    /**
     * Test connection to Gemini API
     */
    public function testConnection(): array
    {
        try {
            if (!$this->apiKey) {
                return [
                    'success' => false,
                    'message' => 'API key chưa được cấu hình'
                ];
            }

            $url = $this->baseUrl . $this->model . ':generateContent?key=' . $this->apiKey;
            
            $response = Http::timeout(10)->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => 'Hello']
                        ]
                    ]
                ]
            ]);

            return [
                'success' => $response->successful(),
                'message' => $response->successful() ? 'Kết nối thành công' : 'Lỗi kết nối'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Lỗi kiểm tra kết nối: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Switch model dynamically
     */
    public function switchModel(string $model): void
    {
        $availableModels = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash-exp'
        ];

        if (in_array($model, $availableModels)) {
            $this->model = $model;
            Log::info('Switched to model: ' . $model);
        } else {
            Log::warning('Invalid model: ' . $model);
        }
    }

    /**
     * Get current model
     */
    public function getCurrentModel(): string
    {
        return $this->model;
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return [
            'gemini-1.5-flash' => 'Gemini 1.5 Flash (Fast)',
            'gemini-1.5-pro' => 'Gemini 1.5 Pro (Advanced)',
            'gemini-1.5-flash-exp' => 'Gemini 1.5 Flash Experimental'
        ];
    }

    /**
     * Generate cache key for conversation
     */
    private function getCacheKey(array $conversation): string
    {
        $userMessage = '';
        foreach ($conversation as $message) {
            if ($message['role'] === 'user') {
                $userMessage = $message['content'];
                break;
            }
        }
        
        return 'chatbot_' . md5(strtolower(trim($userMessage)));
    }
} 