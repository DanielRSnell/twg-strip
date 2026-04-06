<?php

namespace App\Jobs;

use App\Models\EmailTemplate;
use App\Models\FormSubmission;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

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
        $template = EmailTemplate::where('slug', $this->submission->form_type . '-admin')->first();

        if (! $template) {
            return;
        }

        $html = $template->render($this->flattenData());

        Mail::html($html, function ($message) use ($template) {
            $message->to(config('app.admin_email', 'wattstoworkers@thiswayglobal.com'))
                ->subject($template->subject);
            if ($cc = config('app.admin_cc')) {
                $message->cc($cc);
            }
        });
    }

    private function sendUserConfirmation(): void
    {
        $data = $this->submission->data;
        $email = $data['email'] ?? null;

        if (! $email) {
            return;
        }

        $template = EmailTemplate::where('slug', $this->submission->form_type . '-confirm')->first();

        if (! $template) {
            return;
        }

        $html = $template->render($this->flattenData());

        Mail::html($html, function ($message) use ($email, $template, $data) {
            $name = trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
            $message->to($email, $name ?: null)
                ->subject($template->subject);
        });
    }

    /**
     * Flatten the submission data for template variable substitution.
     */
    private function flattenData(): array
    {
        $flat = [];
        foreach ($this->submission->data as $key => $value) {
            $flat[$key] = is_array($value) ? implode(', ', $value) : (string) $value;
        }

        return $flat;
    }
}
