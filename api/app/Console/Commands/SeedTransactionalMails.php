<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Mailcoach\Domain\Template\Models\Template;
use Spatie\Mailcoach\Domain\TransactionalMail\Models\TransactionalMail;

class SeedTransactionalMails extends Command
{
    protected $signature = 'mailcoach:seed-transactional-mails';
    protected $description = 'Create transactional mail templates in Mailcoach for all confirmation emails';

    public function handle(): int
    {
        $template = Template::where('name', 'ThisWay Global')->first();

        $mails = [
            [
                'name' => 'watts-for-workers-interview-confirm',
                'subject' => 'Interview Complete - Thank You!',
                'type' => 'html',
                'body' => $this->interviewConfirmHtml(),
            ],
            [
                'name' => 'texas-tech-compute-confirm',
                'subject' => 'We Received Your Inquiry',
                'type' => 'html',
                'body' => $this->texasTechConfirmHtml(),
            ],
            [
                'name' => 'press-inquiry-confirm',
                'subject' => 'Press Inquiry Received',
                'type' => 'html',
                'body' => $this->pressConfirmHtml(),
            ],
            [
                'name' => 'watts-for-workers-confirm',
                'subject' => 'Thanks for Your Interest!',
                'type' => 'html',
                'body' => $this->interestConfirmHtml(),
            ],
            // Admin notifications
            [
                'name' => 'watts-for-workers-interview-admin',
                'subject' => 'Interview Completed: New Applicant',
                'type' => 'html',
                'body' => $this->interviewAdminHtml(),
            ],
            [
                'name' => 'watts-for-workers-admin',
                'subject' => 'New Watts for Workers Application',
                'type' => 'html',
                'body' => $this->interestAdminHtml(),
            ],
            [
                'name' => 'texas-tech-compute-admin',
                'subject' => 'New Texas Tech Compute Inquiry',
                'type' => 'html',
                'body' => $this->formAdminHtml('Texas Tech Compute'),
            ],
            [
                'name' => 'press-inquiry-admin',
                'subject' => 'New Press Inquiry',
                'type' => 'html',
                'body' => $this->formAdminHtml('Press Inquiry'),
            ],
        ];

        foreach ($mails as $mail) {
            $transactional = TransactionalMail::updateOrCreate(
                ['name' => $mail['name']],
                [
                    'type' => $mail['type'],
                    'store_mail' => true,
                ],
            );

            $contentItem = $transactional->contentItem;
            $contentItem->subject = $mail['subject'];
            $contentItem->html = $mail['body'];
            $contentItem->template_id = $template?->id;
            $contentItem->save();

            $this->info("Created/updated: {$mail['name']}");
        }

        return 0;
    }

    private function interviewConfirmHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>Hi {{ first_name }},</p>

    <p>Thank you for completing your Watts to Workers interview! We've received all your information and our team is reviewing your application.</p>

    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px; letter-spacing: 0.05em;">WHAT'S NEXT</div>
        <div style="font-size: 15px; color: #18181b;">Our team will review your application and reach out with next steps. Keep an eye on your inbox.</div>
    </div>

    <p style="color: #71717a; font-size: 13px;">Questions? Reach out to wattstoworkers@thiswayglobal.com.</p>
</div>
HTML;
    }

    private function texasTechConfirmHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>Hi {{ first_name }},</p>

    <p>Thank you for your inquiry about Texas Tech Compute solutions. We've received your submission and a member of our team will be in touch shortly.</p>

    <p style="color: #71717a; font-size: 13px;">If you have any immediate questions, please reply to this email.</p>
</div>
HTML;
    }

    private function pressConfirmHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>Hi {{ first_name }},</p>

    <p>Thank you for your press inquiry. Our communications team has received your message and will respond as soon as possible.</p>

    <p style="color: #71717a; font-size: 13px;">For urgent inquiries, please reach out directly to our team.</p>
</div>
HTML;
    }

    private function interestConfirmHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>Hi {{ first_name }},</p>

    <p>Thanks for your interest in the Watts to Workers program! We're excited to have you.</p>

    <p>To take the next step, complete your interview when you're ready:</p>

    <p style="margin: 24px 0;">
        <a href="https://thiswayglobal.com/watts-to-workers/interview" style="display: inline-block; background-color: #18181b; color: #fafafa; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; padding: 12px 24px;">
            Start Your Interview
        </a>
    </p>

    <p style="color: #71717a; font-size: 13px;">Questions? Reach out to wattstoworkers@thiswayglobal.com.</p>
</div>
HTML;
    }

    private function interviewAdminHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>A new applicant has completed the Watts to Workers interview.</p>

    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">NAME</div>
        <div style="font-size: 16px; font-weight: 600;">{{ first_name }} {{ last_name }}</div>
    </div>
    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">EMAIL</div>
        <div style="font-size: 16px; font-weight: 600;">{{ email }}</div>
    </div>
    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">PHONE</div>
        <div style="font-size: 16px; font-weight: 600;">{{ phone }}</div>
    </div>
</div>
HTML;
    }

    private function interestAdminHtml(): string
    {
        return <<<'HTML'
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>A new candidate has expressed interest in Watts to Workers.</p>

    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">EMAIL</div>
        <div style="font-size: 16px; font-weight: 600;">{{ email }}</div>
    </div>
</div>
HTML;
    }

    private function formAdminHtml(string $formName): string
    {
        return <<<HTML
<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #18181b;">
    <p>A new {$formName} inquiry has been submitted.</p>

    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 16px 0;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">NAME</div>
        <div style="font-size: 16px; font-weight: 600;">{{ first_name }} {{ last_name }}</div>
    </div>
    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 16px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #71717a; margin-bottom: 4px;">EMAIL</div>
        <div style="font-size: 16px; font-weight: 600;">{{ email }}</div>
    </div>
</div>
HTML;
    }
}
