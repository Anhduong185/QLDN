<?php

use App\Http\Controllers\NhanVienController;
use App\Http\Controllers\ChamCongController;
use App\Http\Controllers\DonNghiPhepController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API routes cho nhân sự
Route::prefix('nhan-vien')->group(function () {
    Route::get('/', [NhanVienController::class, 'index']);
    Route::post('/', [NhanVienController::class, 'store']);
    Route::get('/{id}', [NhanVienController::class, 'show']);
    Route::put('/{id}', [NhanVienController::class, 'update']);
    Route::delete('/{id}', [NhanVienController::class, 'destroy']);
    Route::get('/dashboard', [NhanVienController::class, 'dashboard']);
    Route::get('/form-data', [NhanVienController::class, 'getFormData']);
});

// API routes cho chấm công
Route::prefix('cham-cong')->group(function () {
    Route::post('/register-face', [ChamCongController::class, 'registerFace']);
    Route::post('/check-in', [ChamCongController::class, 'checkIn']);
    Route::post('/check-out', [ChamCongController::class, 'checkOut']);
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




