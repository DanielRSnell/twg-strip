<?php

namespace App\Models;

use Spatie\Mailcoach\Domain\Settings\Models\Mailer;

class MailcoachMailer extends Mailer
{
    public static function registerAllConfigValues(): void
    {
        // Skip cache entirely to prevent Eloquent Collection serialization
        // failures in php artisan serve's forked child processes.
        $mailers = static::getMailerClass()::all()->where('ready_for_use', true);

        $mailers->each(fn (Mailer $mailer) => $mailer->registerConfigValues());
        $defaultMailer = $mailers->where('default', true)->first() ?? $mailers->first();

        config()->set('mailcoach.mailer', $defaultMailer?->configName());
    }
}
