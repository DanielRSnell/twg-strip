<?php

namespace App\Console\Commands;

use App\Models\Applicant;
use App\Models\EmailLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDailyDigest extends Command
{
    protected $signature = 'applicants:daily-digest';

    protected $description = 'Send daily summary of completed and abandoned applicants to admin';

    public function handle(): void
    {
        $yesterday = now()->subDay();

        $completed = Applicant::where('status', 'completed')
            ->where('completed_at', '>=', $yesterday)
            ->get();

        $abandoned = Applicant::where('status', 'abandoned')
            ->where('updated_at', '>=', $yesterday)
            ->get();

        $inProgress = Applicant::where('status', 'in_progress')->count();

        if ($completed->isEmpty() && $abandoned->isEmpty() && $inProgress === 0) {
            $this->info('No activity to report.');

            return;
        }

        $heading = 'Daily Interview Funnel Report';
        $lines = [];
        $lines[] = "Here's your daily summary for " . now()->format('F j, Y') . ':';
        $lines[] = '';
        $lines[] = "Completed yesterday: {$completed->count()}";
        $lines[] = "Abandoned yesterday: {$abandoned->count()}";
        $lines[] = "Currently in progress: {$inProgress}";

        if ($completed->isNotEmpty()) {
            $lines[] = '';
            $lines[] = '--- COMPLETED ---';
            foreach ($completed as $a) {
                $lines[] = "{$a->full_name} ({$a->email}) - {$a->client}";
            }
        }

        if ($abandoned->isNotEmpty()) {
            $lines[] = '';
            $lines[] = '--- ABANDONED ---';
            foreach ($abandoned as $a) {
                $step = $a->answers['_last_step'] ?? 'unknown';
                $lines[] = "{$a->full_name} ({$a->email}) - stopped at {$step}";
            }
        }

        $body = implode("\n", $lines);

        try {
            $html = view('emails.simple', [
                'heading' => $heading,
                'body' => $body,
                'ctaUrl' => '',
                'ctaText' => '',
            ])->render();

            $adminEmail = config('app.admin_email', 'daniel.snell@thiswayglobal.com');
            $adminCc = config('app.admin_cc', 'courtney.gwynn@thiswayglobal.com');

            Mail::html($html, function ($message) use ($adminEmail, $adminCc) {
                $message->to($adminEmail)
                    ->cc($adminCc)
                    ->subject('Daily Interview Funnel Report - ' . now()->format('M j'));
            });

            EmailLog::create([
                'to_email' => $adminEmail,
                'from_email' => config('mail.from.address'),
                'subject' => 'Daily Interview Funnel Report - ' . now()->format('M j'),
                'template_slug' => 'daily-digest',
                'status' => 'sent',
            ]);

            $this->info('Daily digest sent.');
        } catch (\Exception $e) {
            $this->error('Failed to send digest: ' . $e->getMessage());
        }
    }
}
