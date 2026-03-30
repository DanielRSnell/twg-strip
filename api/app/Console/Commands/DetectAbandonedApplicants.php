<?php

namespace App\Console\Commands;

use App\Jobs\SendApplicantEmails;
use App\Models\Applicant;
use App\Models\EmailLog;
use App\Models\InterviewEvent;
use Illuminate\Console\Command;

class DetectAbandonedApplicants extends Command
{
    protected $signature = 'applicants:detect-abandoned';

    protected $description = 'Flag applicants who stopped progressing and send nudge emails';

    public function handle(): void
    {
        $this->detectNewAbandons();
        $this->sendFinalNudges();
    }

    /**
     * Find in_progress applicants whose last event is 30+ minutes old.
     */
    private function detectNewAbandons(): void
    {
        $applicants = Applicant::where('status', 'in_progress')->get();

        foreach ($applicants as $applicant) {
            $lastEvent = InterviewEvent::where('client', $applicant->client)
                ->where('email', $applicant->email)
                ->orderBy('id', 'desc')
                ->first();

            if (! $lastEvent) {
                continue;
            }

            $minutesSinceLastEvent = now()->diffInMinutes($lastEvent->event_at, absolute: true);

            if ($minutesSinceLastEvent < 30) {
                continue;
            }

            // Determine where they stopped
            $lastStep = match ($lastEvent->event) {
                'email_submitted' => 'email',
                'video_started', 'video_progress' => 'video',
                'video_completed', 'form_started', 'form_progress' => 'form',
                default => 'unknown',
            };

            // Store position data from last event
            $positionData = $lastEvent->data ?? [];
            $answers = $applicant->answers ?? [];
            $answers['_last_step'] = $lastStep;
            $answers['_last_event'] = $lastEvent->event;
            $answers['_last_event_data'] = $positionData;

            $applicant->update([
                'status' => 'abandoned',
                'answers' => $answers,
            ]);

            // Send first nudge (only if we haven't already)
            $alreadyNudged = EmailLog::where('applicant_id', $applicant->id)
                ->where('template_slug', 'abandon-nudge-1')
                ->exists();

            if (! $alreadyNudged) {
                SendApplicantEmails::dispatchSync($applicant, 'abandon_first');
                $this->info("Abandon nudge sent to {$applicant->email} (stopped at {$lastStep})");
            }
        }
    }

    /**
     * Send final nudge to abandoned applicants who were nudged 24h+ ago.
     */
    private function sendFinalNudges(): void
    {
        $applicants = Applicant::where('status', 'abandoned')->get();

        foreach ($applicants as $applicant) {
            $firstNudge = EmailLog::where('applicant_id', $applicant->id)
                ->where('template_slug', 'abandon-nudge-1')
                ->where('status', 'sent')
                ->first();

            if (! $firstNudge) {
                continue;
            }

            $alreadySentFinal = EmailLog::where('applicant_id', $applicant->id)
                ->where('template_slug', 'abandon-nudge-final')
                ->exists();

            if ($alreadySentFinal) {
                continue;
            }

            $hoursSinceNudge = now()->diffInHours($firstNudge->created_at, absolute: true);

            if ($hoursSinceNudge >= 24) {
                SendApplicantEmails::dispatchSync($applicant, 'abandon_final');
                $this->info("Final nudge sent to {$applicant->email}");
            }
        }
    }
}
