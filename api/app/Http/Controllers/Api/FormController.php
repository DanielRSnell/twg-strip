<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendFormNotifications;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FormController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_type' => 'required|string|max:100',
            'data' => 'required|array',
        ]);

        $submission = FormSubmission::create($validated);

        SendFormNotifications::dispatch($submission)->onQueue('emails');

        return response()->json([
            'success' => true,
            'id' => $submission->id,
        ], 201);
    }
}
