<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendApplicantEmails;
use App\Models\Applicant;
use App\Models\InterviewEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Spatie\Mailcoach\Domain\Audience\Models\EmailList;
use Spatie\Mailcoach\Domain\Audience\Models\Subscriber;

class InterviewTrackingController extends Controller
{
    #[OA\Post(
        path: '/api/webhook/interview-tracking',
        summary: 'Record an interview funnel event',
        tags: ['Webhooks'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['client', 'email', 'event', 'timestamp'],
                properties: [
                    new OA\Property(property: 'client', type: 'string', example: 'watts-to-workers'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
                    new OA\Property(property: 'event', type: 'string', example: 'form_completed', description: 'One of: email_submitted, form_completed, funnel_exited'),
                    new OA\Property(property: 'timestamp', type: 'string', format: 'date-time', example: '2026-04-08T14:25:00Z'),
                    new OA\Property(property: 'data', type: 'object', nullable: true, example: ['answers' => ['firstName' => 'Jane']]),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Event recorded',
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: 'success', type: 'boolean', example: true)],
                ),
            ),
            new OA\Response(response: 422, description: 'Validation failed'),
        ],
    )]
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
        $applicant = $this->syncApplicant($validated);

        // Sync to Mailcoach subscriber list
        if ($applicant) {
            $this->syncToMailcoach($applicant);
        }

        return response()->json(['success' => true], 201);
    }

    private function syncApplicant(array $data): ?Applicant
    {
        $event = $data['event'];
        $eventData = $data['data'] ?? [];

        // Create applicant on email submission
        if ($event === 'email_submitted') {
            return Applicant::firstOrCreate(
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

            return $applicant;
        }

        // Handle exit
        if ($event === 'funnel_exited') {
            $answers = $eventData['answers'] ?? [];

            return Applicant::updateOrCreate(
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

        return null;
    }

    private function syncToMailcoach(Applicant $applicant): void
    {
        try {
            $list = EmailList::where('name', 'Watts to Workers')->first();

            if (! $list) {
                return;
            }

            $subscriber = Subscriber::where('email', $applicant->email)
                ->where('email_list_id', $list->id)
                ->first();

            if (! $subscriber) {
                $subscriber = Subscriber::createWithEmail($applicant->email)
                    ->skipConfirmation()
                    ->subscribeTo($list);
            }

            $subscriber->update([
                'first_name' => $applicant->first_name,
                'last_name' => $applicant->last_name,
            ]);

            $subscriber->addTag($applicant->status ?? 'in_progress');

            if ($applicant->client) {
                $subscriber->addTag($applicant->client);
            }
        } catch (\Throwable) {
            // Don't let Mailcoach sync failures break the tracking flow
        }
    }
}
