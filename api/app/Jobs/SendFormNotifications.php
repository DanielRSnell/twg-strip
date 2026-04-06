<?php

namespace App\Jobs;

use App\Models\FormSubmission;
use App\Support\MailcoachTransactional;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendFormNotifications implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public FormSubmission $submission,
    ) {}

    public function handle(): void
    {
        $this->sendAdminNotification();
        $this->sendUserConfirmation();
    }

    private function sendAdminNotification(): void
    {
        MailcoachTransactional::send(
            templateName: $this->submission->form_type . '-admin',
            toEmail: config('app.admin_email', 'wattstoworkers@thiswayglobal.com'),
            toName: 'Admin',
            replacements: $this->flattenData(),
        );
    }

    private function sendUserConfirmation(): void
    {
        $data = $this->submission->data;
        $email = $data['email'] ?? null;

        if (!$email) {
            return;
        }

        $name = trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));

        MailcoachTransactional::send(
            templateName: $this->submission->form_type . '-confirm',
            toEmail: $email,
            toName: $name,
            replacements: $this->flattenData(),
        );
    }

    private function flattenData(): array
    {
        $flat = [];
        foreach ($this->submission->data as $key => $value) {
            $flat[$key] = is_array($value) ? implode(', ', $value) : (string) $value;
        }

        return $flat;
    }
}
