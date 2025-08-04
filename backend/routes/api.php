<?php

use App\Http\Controllers\NhanVienController;
use App\Http\Controllers\ChamCongController;
use App\Http\Controllers\DonNghiPhepController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ExcelImportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API routes cho nhân sự
Route::prefix('nhan-vien')->group(function () {
    Route::get('/', [NhanVienController::class, 'index']);
    Route::post('/', [NhanVienController::class, 'store']);
    Route::get('/dashboard', [NhanVienController::class, 'dashboard']);
    Route::get('/form-data', [NhanVienController::class, 'getFormData']);
    Route::get('/{id}', [NhanVienController::class, 'show']);
    Route::put('/{id}', [NhanVienController::class, 'update']);
    Route::delete('/{id}', [NhanVienController::class, 'destroy']);
});

// Excel Import Routes
Route::post('/excel-import/nhan-vien', [ExcelImportController::class, 'importWithAI']);
Route::get('/excel-import/template', [ExcelImportController::class, 'getTemplate']);
Route::get('/excel-import/download-template', [ExcelImportController::class, 'downloadTemplate']);
Route::get('/excel-import/download-csv-template', [ExcelImportController::class, 'downloadCsvTemplate']);

// API routes cho chấm công
Route::prefix('cham-cong')->group(function () {
    Route::post('/register-face', [ChamCongController::class, 'registerFace']);
    Route::post('/check-in', [ChamCongController::class, 'checkIn']);
    Route::post('/check-out', [ChamCongController::class, 'checkOut']);
    Route::post('/identify-face', [ChamCongController::class, 'identifyFace']);
    Route::get('/history/{employeeId}', [ChamCongController::class, 'getAttendanceHistory']);
    Route::get('/all', [ChamCongController::class, 'getAllAttendance']);
    Route::get('/today', [ChamCongController::class, 'getTodayAttendance']);
    Route::get('/employee/{employeeId}/today', [ChamCongController::class, 'getEmployeeTodayAttendance']);
    Route::get('/registration-status/{employeeId}', [ChamCongController::class, 'getRegistrationStatus']);
    // Bổ sung các API mới
    Route::get('/access-logs', [ChamCongController::class, 'accessLogs']);
    Route::get('/dashboard', [ChamCongController::class, 'dashboard']);
    Route::get('/export-excel', [ChamCongController::class, 'exportExcel']);
    Route::get('/export-raw-data', [ChamCongController::class, 'exportRawData']);
});

// API routes cho nghỉ phép
Route::prefix('don-nghi-phep')->group(function () {
    Route::post('/', [DonNghiPhepController::class, 'store']);
    Route::patch('/{id}/approve', [DonNghiPhepController::class, 'approve']);
    Route::get('/', [DonNghiPhepController::class, 'index']);
});

// AI Analysis Routes
Route::prefix('ai-analysis')->group(function () {
    Route::post('/predict-attrition', [App\Http\Controllers\AiAnalysisController::class, 'predictAttrition']);
    Route::get('/predict-batch-attrition', [App\Http\Controllers\AiAnalysisController::class, 'predictBatchAttrition']);
    Route::get('/stats', [App\Http\Controllers\AiAnalysisController::class, 'getAiStats']);
    
    // Real-time AI features
    Route::get('/collect-data', [App\Http\Controllers\AiAnalysisController::class, 'collectRealTimeData']);
    Route::post('/update-model', [App\Http\Controllers\AiAnalysisController::class, 'updateAiModel']);
    Route::get('/analyze-trends', [App\Http\Controllers\AiAnalysisController::class, 'analyzeTrends']);
});

// Statistics Routes
Route::prefix('statistics')->group(function () {
    Route::get('/basic-stats', [App\Http\Controllers\StatisticsController::class, 'getBasicStats']);
    Route::get('/attendance-stats', [App\Http\Controllers\StatisticsController::class, 'getAttendanceStats']);
    Route::get('/leave-stats', [App\Http\Controllers\StatisticsController::class, 'getLeaveStats']);
    Route::get('/advanced-ai-stats', [App\Http\Controllers\StatisticsController::class, 'getAdvancedAIStats']);
});

// Chatbot Routes
Route::prefix('chatbot')->group(function () {
    Route::get('/test', [ChatbotController::class, 'test']);
    Route::post('/gemini', [ChatbotController::class, 'chatWithGemini']);
    Route::get('/status', [ChatbotController::class, 'getStatus']);
    Route::post('/switch-model', [ChatbotController::class, 'switchModel']);
    Route::get('/models', [ChatbotController::class, 'getAvailableModels']);
    Route::get('/history', [ChatbotController::class, 'getConversationHistory']);
    Route::get('/stats', [ChatbotController::class, 'getSystemStats']);
    Route::post('/update-learning', [ChatbotController::class, 'updateLearningData']);
    Route::get('/suggestions', [ChatbotController::class, 'getSmartSuggestions']);
});



