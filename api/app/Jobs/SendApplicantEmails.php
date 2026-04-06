<?php

namespace App\Jobs;

use App\Models\Applicant;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendApplicantEmails implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Applicant $applicant,
        public string $trigger = 'completed',
    ) {}

    public function handle(): void
    {
        match ($this->trigger) {
            'completed' => $this->sendCompletionEmails(),
            'exited' => $this->sendExitEmail(),
            'abandon_first' => $this->sendAbandonNudge(),
            'abandon_final' => $this->sendAbandonFinal(),
            default => null,
        };
    }

    private function sendCompletionEmails(): void
    {
        // Send confirmation to applicant (use interview-specific template)
        $this->sendTemplateEmail(
            slug: $this->getClientSlug() . '-interview-confirm',
            toEmail: $this->applicant->email,
            toName: $this->applicant->full_name,
        );

        // Send admin notification (use interview-specific template with all answers)
        $this->sendTemplateEmail(
            slug: $this->getClientSlug() . '-interview-admin',
            toEmail: config('app.admin_email', 'wattstoworkers@thiswayglobal.com'),
            toName: 'Admin',
            cc: config('app.admin_cc'),
        );
    }

    private function sendExitEmail(): void
    {
        // Notify admin that someone exited
        $this->sendTemplateEmail(
            slug: $this->getClientSlug() . '-admin',
            toEmail: config('app.admin_email', 'wattstoworkers@thiswayglobal.com'),
            toName: 'Admin',
            subjectOverride: 'Applicant Exited: ' . $this->applicant->full_name,
        );
    }

    private function sendAbandonNudge(): void
    {
        $position = $this->applicant->answers['_last_step'] ?? 'video';
        $slug = match ($position) {
            'form' => $this->getClientSlug() . '-abandon-form',
            default => $this->getClientSlug() . '-abandon-video',
        };

        $this->sendTemplateEmail(
            slug: $slug,
            toEmail: $this->applicant->email,
            toName: $this->applicant->full_name,
            extraData: [
                'cta_url' => config('app.frontend_url') . '/watts-to-workers/interview?email=' . urlencode($this->applicant->email),
            ],
        );
    }

    private function sendAbandonFinal(): void
    {
        $this->sendTemplateEmail(
            slug: $this->getClientSlug() . '-abandon-final',
            toEmail: $this->applicant->email,
            toName: $this->applicant->full_name,
            extraData: [
                'cta_url' => config('app.frontend_url') . '/watts-to-workers/interview?email=' . urlencode($this->applicant->email),
            ],
        );
    }

    private function getClientSlug(): string
    {
        return match ($this->applicant->client) {
            'watts-to-workers' => 'watts-for-workers',
            default => $this->applicant->client,
        };
    }

    private function sendTemplateEmail(
        string $slug,
        string $toEmail,
        string $toName = '',
        string $cc = '',
        string $subjectOverride = '',
        array $extraData = [],
    ): void {
        $template = EmailTemplate::where('slug', $slug)->first();
        if (! $template) {
            return;
        }

        $subject = $subjectOverride ?: $template->subject;
        $submissionData = $this->applicant->answers ?? [];
        $submissionData['first_name'] = $this->applicant->first_name ?: '';
        $submissionData['last_name'] = $this->applicant->last_name ?? '';
        $submissionData['email'] = $this->applicant->email;
        $submissionData['phone'] = $this->applicant->phone ?? '';
        $submissionData = array_merge($submissionData, $extraData);

        try {
            $html = $template->render($submissionData);

            Mail::html($html, function ($message) use ($toEmail, $toName, $subject, $cc) {
                $message->to($toEmail, $toName ?: null)->subject($subject);
                if ($cc) {
                    $message->cc($cc);
                }
            });

            EmailLog::create([
                'to_email' => $toEmail,
                'to_name' => $toName,
                'from_email' => config('mail.from.address'),
                'subject' => $subject,
                'template_slug' => $slug,
                'status' => 'sent',
                'applicant_id' => $this->applicant->id,
            ]);
        } catch (\Exception $e) {
            EmailLog::create([
                'to_email' => $toEmail,
                'to_name' => $toName,
                'from_email' => config('mail.from.address'),
                'subject' => $subject,
                'template_slug' => $slug,
                'status' => 'failed',
                'error' => $e->getMessage(),
                'applicant_id' => $this->applicant->id,
            ]);
        }
    }

    private function sendSimpleEmail(
        string $toEmail,
        string $toName,
        string $subject,
        string $heading,
        string $body,
        string $ctaUrl,
        string $ctaText,
        string $templateSlug,
    ): void {
        try {
            $html = view('emails.simple', compact('heading', 'body', 'ctaUrl', 'ctaText'))->render();

            Mail::html($html, function ($message) use ($toEmail, $toName, $subject) {
                $message->to($toEmail, $toName ?: null)->subject($subject);
            });

            EmailLog::create([
                'to_email' => $toEmail,
                'to_name' => $toName,
                'from_email' => config('mail.from.address'),
                'subject' => $subject,
                'template_slug' => $templateSlug,
                'status' => 'sent',
                'applicant_id' => $this->applicant->id,
            ]);
        } catch (\Exception $e) {
            EmailLog::create([
                'to_email' => $toEmail,
                'to_name' => $toName,
                'from_email' => config('mail.from.address'),
                'subject' => $subject,
                'template_slug' => $templateSlug,
                'status' => 'failed',
                'error' => $e->getMessage(),
                'applicant_id' => $this->applicant->id,
            ]);
        }
    }
}
