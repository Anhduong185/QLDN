<?php

use App\Http\Controllers\NhanVienController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API routes cho nhân sự
Route::apiResource('nhan-vien', NhanVienController::class);


