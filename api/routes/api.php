<?php

use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\InterviewTrackingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public webhook endpoints (replaces N8N / Umbral)
Route::post('/webhook/forms', [FormController::class, 'store']);
Route::post('/webhook/interview-tracking', [InterviewTrackingController::class, 'store']);
