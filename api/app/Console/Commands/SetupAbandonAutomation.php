<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Mailcoach\Domain\Audience\Models\EmailList;
use Spatie\Mailcoach\Domain\Automation\Enums\AutomationStatus;
use Spatie\Mailcoach\Domain\Automation\Models\Automation;
use Spatie\Mailcoach\Domain\Automation\Models\AutomationMail;
use Spatie\Mailcoach\Domain\Automation\Models\Trigger;
use Spatie\Mailcoach\Domain\Automation\Support\Actions\AddTagsAction;
use Spatie\Mailcoach\Domain\Automation\Support\Actions\ConditionAction;
use Spatie\Mailcoach\Domain\Automation\Support\Actions\HaltAction;
use Spatie\Mailcoach\Domain\Automation\Support\Actions\SendAutomationMailAction;
use Spatie\Mailcoach\Domain\Automation\Support\Actions\WaitAction;
use Spatie\Mailcoach\Domain\Automation\Support\Conditions\HasTagCondition;
use Spatie\Mailcoach\Domain\Automation\Support\Triggers\TagAddedTrigger;
use Spatie\Mailcoach\Domain\Template\Models\Template;

class SetupAbandonAutomation extends Command
{
    protected $signature = 'mailcoach:setup-abandon-automation';
    protected $description = 'Create the abandon nudge automation in Mailcoach';

    public function handle(): int
    {
        $list = EmailList::where('name', 'Watts to Workers')->first();

        if (!$list) {
            $this->error('Email list "Watts to Workers" not found. Run mailcoach:sync-applicants first.');
            return 1;
        }

        $template = Template::where('name', 'ThisWay Global')->first();

        // Create automation mail: First Nudge
        $firstNudge = $this->createAutomationMail(
            'Abandon Nudge - First',
            "Don't miss your opportunity",
            $this->getFirstNudgeHtml(),
            $template,
        );

        // Create automation mail: Final Nudge
        $finalNudge = $this->createAutomationMail(
            'Abandon Nudge - Final',
            'Last chance to complete your application',
            $this->getFinalNudgeHtml(),
            $template,
        );

        // Create the automation
        $automation = Automation::updateOrCreate(
            ['name' => 'Abandon Nudge Sequence'],
            [
                'email_list_id' => $list->id,
                'status' => AutomationStatus::Paused,
                'repeat_enabled' => false,
            ],
        );

        // Set trigger: when subscriber gets tagged "in_progress"
        Trigger::updateOrCreate(
            ['automation_id' => $automation->id],
            ['trigger' => new TagAddedTrigger('in_progress')],
        );

        // Build the action chain
        $actions = [
            // Step 1: Wait 30 minutes
            WaitAction::make(['length' => 30, 'unit' => 'minutes']),

            // Step 2: Check if they completed (has "completed" tag)
            ConditionAction::make([
                'length' => 0,
                'unit' => 'minutes',
                'condition' => HasTagCondition::class,
                'conditionData' => ['tag' => 'completed'],
                // YES (completed) -> halt, no need to nudge
                'yesActions' => [
                    [
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'class' => HaltAction::class,
                        'data' => [],
                    ],
                ],
                // NO (not completed) -> send first nudge
                'noActions' => [
                    [
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'class' => SendAutomationMailAction::class,
                        'data' => ['automation_mail_id' => $firstNudge->id],
                    ],
                ],
            ]),

            // Step 3: Wait 24 hours
            WaitAction::make(['length' => 24, 'unit' => 'hours']),

            // Step 4: Check again if completed
            ConditionAction::make([
                'length' => 0,
                'unit' => 'minutes',
                'condition' => HasTagCondition::class,
                'conditionData' => ['tag' => 'completed'],
                'yesActions' => [
                    [
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'class' => HaltAction::class,
                        'data' => [],
                    ],
                ],
                'noActions' => [
                    [
                        'uuid' => (string) \Illuminate\Support\Str::uuid(),
                        'class' => SendAutomationMailAction::class,
                        'data' => ['automation_mail_id' => $finalNudge->id],
                    ],
                ],
            ]),

            // Step 5: Tag as abandoned
            AddTagsAction::make(['tags' => 'abandoned']),
        ];

        // Clear existing actions and store new ones
        $automation->actions()->delete();
        foreach ($actions as $order => $action) {
            $action->store($action->uuid, $automation, $order);
        }

        $this->info('Abandon automation created with ' . count($actions) . ' steps.');
        $this->info('Status: PAUSED. Start it from the Mailcoach UI when ready.');
        $this->info("First nudge mail: {$firstNudge->name} (ID: {$firstNudge->id})");
        $this->info("Final nudge mail: {$finalNudge->name} (ID: {$finalNudge->id})");

        return 0;
    }

    private function createAutomationMail(string $name, string $subject, string $html, ?Template $template): AutomationMail
    {
        $mail = AutomationMail::updateOrCreate(
            ['name' => $name],
        );

        $contentItem = $mail->contentItem;
        $contentItem->html = $html;
        $contentItem->subject = $subject;
        $contentItem->template_id = $template?->id;
        $contentItem->save();

        return $mail;
    }

    private function getFirstNudgeHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>Hi there,</p>

    <p>We noticed you started your Watts to Workers application but didn't finish. No worries, your spot is still waiting for you.</p>

    <p>It only takes a few minutes to complete, and you'll be one step closer to joining the team.</p>

    <p style="margin: 24px 0;">
        <a href="https://thiswayglobal.com/watts-to-workers/interview" style="display: inline-block; background-color: #18181b; color: #fafafa; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; padding: 12px 24px;">
            Complete Your Application
        </a>
    </p>

    <p style="color: #71717a; font-size: 13px;">If you have any questions, reply to this email or reach out to wattstoworkers@thiswayglobal.com.</p>
</div>
HTML;
    }

    private function getFinalNudgeHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>Hi there,</p>

    <p>This is a final reminder that your Watts to Workers application is still incomplete. We'd hate for you to miss out on this opportunity.</p>

    <p>Spots are filling up, and completing your application only takes a few minutes.</p>

    <p style="margin: 24px 0;">
        <a href="https://thiswayglobal.com/watts-to-workers/interview" style="display: inline-block; background-color: #18181b; color: #fafafa; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; padding: 12px 24px;">
            Finish Your Application Now
        </a>
    </p>

    <p style="color: #71717a; font-size: 13px;">If you're no longer interested, no action is needed. We won't send any more reminders.</p>
</div>
HTML;
    }
}
