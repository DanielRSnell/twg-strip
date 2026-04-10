<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\InterviewTrackingController;
use Illuminate\Support\Facades\Route;

// Auth endpoints (token-based for headless clients)
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// Public webhook endpoints (replaces N8N / Umbral)
Route::post('/webhook/forms', [FormController::class, 'store']);
Route::post('/webhook/interview-tracking', [InterviewTrackingController::class, 'store']);
