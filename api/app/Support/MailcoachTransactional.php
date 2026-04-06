<?php

namespace App\Support;

use Illuminate\Support\Facades\Mail;
use Spatie\Mailcoach\Domain\TransactionalMail\Mails\TransactionalMail;
use Spatie\Mailcoach\Domain\TransactionalMail\Models\TransactionalMail as TransactionalMailModel;

class MailcoachTransactional
{
    /**
     * Send a transactional email via Mailcoach.
     * Sends via Mailcoach transactional mail with open/click tracking.
     */
    public static function send(
        string $templateName,
        string $toEmail,
        string $toName = '',
        array $replacements = [],
        string $cc = '',
    ): void {
        $template = TransactionalMailModel::where('name', $templateName)->first();

        if (!$template) {
            return;
        }

        $subject = $template->contentItem->subject ?? $templateName;

        // Render Twig replacements in the subject
        foreach ($replacements as $key => $value) {
            $subject = str_replace("{{ {$key} }}", (string) $value, $subject);
        }

        $to = $toName ? [['email' => $toEmail, 'name' => $toName]] : [['email' => $toEmail, 'name' => '']];

        Mail::send(new TransactionalMail(
            uuid: (string) \Illuminate\Support\Str::uuid(),
            mailName: $templateName,
            subject: $subject,
            from: [config('mail.from.address'), config('mail.from.name')],
            to: $to,
            cc: $cc ? [['email' => $cc, 'name' => '']] : [],
            replacements: $replacements,
            store: true,
        ));
    }
}
