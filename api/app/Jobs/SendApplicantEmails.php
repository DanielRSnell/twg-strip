<?php

namespace App\Jobs;

use App\Models\Applicant;
use App\Support\MailcoachTransactional;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

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
            default => null,
        };
    }

    private function sendCompletionEmails(): void
    {
        $data = $this->buildReplacements();

        // Send confirmation to applicant
        MailcoachTransactional::send(
            templateName: 'watts-for-workers-interview-confirm',
            toEmail: $this->applicant->email,
            toName: $this->applicant->full_name,
            replacements: $data,
        );

        // Send admin notification
        MailcoachTransactional::send(
            templateName: 'watts-for-workers-interview-admin',
            toEmail: config('app.admin_email', 'wattstoworkers@thiswayglobal.com'),
            toName: 'Admin',
            replacements: $data,
        );
    }

    private function sendExitEmail(): void
    {
        MailcoachTransactional::send(
            templateName: 'watts-for-workers-admin',
            toEmail: config('app.admin_email', 'wattstoworkers@thiswayglobal.com'),
            toName: 'Admin',
            replacements: $this->buildReplacements(),
        );
    }

    private function buildReplacements(): array
    {
        $data = $this->applicant->answers ?? [];
        $data['first_name'] = $this->applicant->first_name ?: '';
        $data['last_name'] = $this->applicant->last_name ?? '';
        $data['email'] = $this->applicant->email;
        $data['phone'] = $this->applicant->phone ?? '';

        return $data;
    }
}
