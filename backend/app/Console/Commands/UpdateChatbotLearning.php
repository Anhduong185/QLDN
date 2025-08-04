<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ChatbotLearningService;

class UpdateChatbotLearning extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chatbot:update-learning';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update chatbot learning data and patterns';

    /**
     * Execute the console command.
     */
    public function handle(ChatbotLearningService $learningService)
    {
        $this->info('🔄 Bắt đầu cập nhật dữ liệu học cho chatbot...');

        try {
            // Update learning data
            $learningService->updateLearningData();
            
            // Get insights
            $insights = $learningService->getLearnedInsights();
            
            // Get suggestions
            $suggestions = $learningService->generateSmartSuggestions();

            $this->info('✅ Đã cập nhật dữ liệu học thành công!');
            
            if (!empty($insights)) {
                $this->info('📊 Insights học được:');
                foreach ($insights as $key => $value) {
                    $this->line("  - {$key}: {$value}");
                }
            }

            if (!empty($suggestions)) {
                $this->info('💡 Gợi ý thông minh:');
                foreach ($suggestions as $suggestion) {
                    $this->line("  - {$suggestion}");
                }
            }

            $this->info('🎉 Hoàn thành cập nhật dữ liệu học!');

        } catch (\Exception $e) {
            $this->error('❌ Lỗi cập nhật dữ liệu học: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
} 