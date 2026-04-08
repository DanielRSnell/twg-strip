<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('applicants:daily-digest')->dailyAt('08:00')->timezone('America/Chicago');
Schedule::command('exports:cleanup --days=7')->daily();

// Mailcoach scheduled commands
Schedule::command('mailcoach:send-scheduled-campaigns')->everyMinute();
Schedule::command('mailcoach:send-campaign-mails')->everyMinute();
Schedule::command('mailcoach:send-automation-mails')->everyMinute();
Schedule::command('mailcoach:run-automation-triggers')->everyMinute();
Schedule::command('mailcoach:run-automation-actions')->everyMinute();
Schedule::command('mailcoach:calculate-statistics')->everyMinute();
Schedule::command('mailcoach:send-campaign-summary-mail')->hourly();
Schedule::command('mailcoach:cleanup-processed-feedback')->hourly();
Schedule::command('mailcoach:delete-old-unconfirmed-subscribers')->daily();
