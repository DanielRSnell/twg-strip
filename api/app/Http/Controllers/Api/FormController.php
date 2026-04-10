<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendFormNotifications;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Webhooks', description: 'Public webhook endpoints')]
class FormController extends Controller
{
    #[OA\Post(
        path: '/api/webhook/forms',
        summary: 'Submit a form from the headless site',
        tags: ['Webhooks'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['form_type', 'data'],
                properties: [
                    new OA\Property(property: 'form_type', type: 'string', example: 'contact'),
                    new OA\Property(property: 'data', type: 'object', example: ['name' => 'Jane', 'email' => 'jane@example.com']),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Form submission accepted',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'id', type: 'integer', example: 42),
                    ],
                ),
            ),
            new OA\Response(response: 422, description: 'Validation failed'),
        ],
    )]
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
