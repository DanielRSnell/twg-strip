<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendApplicantEmails;
use App\Models\Applicant;
use App\Models\InterviewEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterviewTrackingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client' => 'required|string|max:100',
            'email' => 'required|email',
            'event' => 'required|string|max:100',
            'timestamp' => 'required|date',
            'data' => 'nullable|array',
        ]);

        InterviewEvent::create([
            'client' => $validated['client'],
            'email' => $validated['email'],
            'event' => $validated['event'],
            'data' => $validated['data'] ?? [],
            'event_at' => $validated['timestamp'],
        ]);

        // Create or update Applicant on key events
        $this->syncApplicant($validated);

        return response()->json(['success' => true], 201);
    }

    private function syncApplicant(array $data): void
    {
        $event = $data['event'];
        $eventData = $data['data'] ?? [];

        // Create applicant on email submission
        if ($event === 'email_submitted') {
            Applicant::firstOrCreate(
                ['client' => $data['client'], 'email' => $data['email']],
                ['status' => 'in_progress'],
            );
        }

        // Update with form answers on completion
        if ($event === 'form_completed') {
            $answers = $eventData['answers'] ?? [];
            $applicant = Applicant::updateOrCreate(
                ['client' => $data['client'], 'email' => $data['email']],
                [
                    'first_name' => $answers['firstName'] ?? null,
                    'last_name' => $answers['lastName'] ?? null,
                    'phone' => $answers['phone'] ?? null,
                    'answers' => $answers,
                    'status' => 'completed',
                    'completed_at' => now(),
                ],
            );

            // Send confirmation emails
            SendApplicantEmails::dispatchSync($applicant);
        }

        // Handle exit
        if ($event === 'funnel_exited') {
            $answers = $eventData['answers'] ?? [];
            Applicant::updateOrCreate(
                ['client' => $data['client'], 'email' => $data['email']],
                [
                    'first_name' => $answers['firstName'] ?? null,
                    'last_name' => $answers['lastName'] ?? null,
                    'answers' => $answers,
                    'status' => 'exited',
                    'exited_at' => now(),
                ],
            );
        }
    }
}
