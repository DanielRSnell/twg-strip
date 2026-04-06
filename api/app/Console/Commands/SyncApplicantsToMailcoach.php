<?php

namespace App\Console\Commands;

use App\Models\Applicant;
use Illuminate\Console\Command;
use Spatie\Mailcoach\Domain\Audience\Models\EmailList;
use Spatie\Mailcoach\Domain\Audience\Models\Subscriber;

class SyncApplicantsToMailcoach extends Command
{
    protected $signature = 'mailcoach:sync-applicants {--list=Watts to Workers : The email list name}';
    protected $description = 'Sync applicants from Filament to Mailcoach subscribers with tags';

    public function handle(): int
    {
        $listName = $this->option('list');

        $list = EmailList::firstOrCreate(
            ['name' => $listName],
            [
                'requires_confirmation' => false,
                'default_from_email' => config('mail.from.address'),
                'default_from_name' => config('mail.from.name'),
            ],
        );

        $applicants = Applicant::all();
        $synced = 0;
        $skipped = 0;

        foreach ($applicants as $applicant) {
            if (!$applicant->email || !filter_var($applicant->email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            try {
                $subscriber = Subscriber::where('email', $applicant->email)
                    ->where('email_list_id', $list->id)
                    ->first();

                if (!$subscriber) {
                    $subscriber = Subscriber::createWithEmail($applicant->email)
                        ->skipConfirmation()
                        ->subscribeTo($list);
                }

                $subscriber->update([
                    'first_name' => $applicant->first_name,
                    'last_name' => $applicant->last_name,
                ]);

                // Tag by status
                $subscriber->addTag($applicant->status ?? 'unknown');

                // Tag by client
                if ($applicant->client) {
                    $subscriber->addTag($applicant->client);
                }

                $synced++;
            } catch (\Throwable $e) {
                $this->warn("Skipped {$applicant->email}: {$e->getMessage()}");
                $skipped++;
            }
        }

        $this->info("Synced {$synced} applicants to '{$listName}' list. Skipped: {$skipped}");

        return 0;
    }
}
