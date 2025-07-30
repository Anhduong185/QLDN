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
     * Generate response from Gemini
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

            // Check cache for common questions
            $cacheKey = $this->getCacheKey($conversation);
            $cachedResponse = cache()->get($cacheKey);
            if ($cachedResponse) {
                Log::info('GeminiService: Using cached response');
                return $cachedResponse;
            }

            $url = $this->baseUrl . $this->model . ':generateContent?key=' . $this->apiKey;

            // Convert conversation to Gemini format
            $contents = [];
            foreach ($conversation as $message) {
                $contents[] = [
                    'role' => $message['role'] === 'system' ? 'user' : $message['role'],
                    'parts' => [
                        ['text' => $message['content']]
                    ]
                ];
            }

            Log::info('GeminiService: Sending request to Gemini API', [
                'model' => $this->model,
                'message_count' => count($contents)
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
                    return $this->tryFallbackModel($conversation);
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