<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'slug' => 'watts-for-workers-admin',
                'name' => 'Watts for Workers - Admin Notification',
                'subject' => 'New Watts for Workers Application',
                'content' => [
                    ['label' => 'Heading', 'value' => 'New Applicant Interest'],
                    ['label' => 'Intro Text', 'value' => 'A new candidate has expressed interest in Watts to Workers.'],
                ],
            ],
            [
                'slug' => 'watts-for-workers-confirm',
                'name' => 'Watts for Workers - Applicant Confirmation',
                'subject' => 'Thank You for Your Interest in Watts to Workers',
                'content' => [
                    ['label' => 'Heading', 'value' => 'Application Received'],
                    ['label' => 'Subheading', 'value' => 'Thank you for your interest in Watts to Workers.'],
                    ['label' => 'Greeting', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Body', 'value' => 'Thank you for submitting your application to the Watts to Workers accelerated training program. We have received your information and our team will review it shortly.'],
                    ['label' => 'Closing', 'value' => "If you have any questions, please reach out to us at WattstoWorkers@thiswayglobal.com.\n\nBest regards,\nThe ThisWay Global Team"],
                ],
            ],
            [
                'slug' => 'watts-for-workers-interview-admin',
                'name' => 'Watts to Workers Interview - Admin Notification',
                'subject' => 'Interview Completed: New Watts to Workers Applicant',
                'content' => [
                    ['label' => 'Heading', 'value' => 'Interview Completed'],
                    ['label' => 'Intro Text', 'value' => 'A new applicant has completed the Watts to Workers interview funnel.'],
                ],
            ],
            [
                'slug' => 'watts-for-workers-interview-confirm',
                'name' => 'Watts to Workers Interview - Applicant Confirmation',
                'subject' => 'Interview Complete - Watts to Workers',
                'content' => [
                    ['label' => 'Heading', 'value' => "You're All Set!"],
                    ['label' => 'Subheading', 'value' => 'Thank you for completing the Watts to Workers interview.'],
                    ['label' => 'Greeting', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Body', 'value' => 'Thank you for taking the time to complete the initial interview for the Watts to Workers accelerated training program. We have received your responses and our team will review them shortly.'],
                    ['label' => 'Next Steps', 'value' => 'We will follow up via email with next steps. If you have any questions in the meantime, please reach out to us at WattstoWorkers@thiswayglobal.com.'],
                    ['label' => 'Sign Off', 'value' => 'Best regards,<br>The ThisWay Global Team'],
                ],
            ],
            [
                'slug' => 'watts-for-workers-abandon-video',
                'name' => 'Watts to Workers - Abandon (Video Step)',
                'subject' => "Don't forget to finish your interview video",
                'content' => [
                    ['label' => 'Heading', 'value' => 'Continue Your Interview'],
                    ['label' => 'Greeting (use {{ $first_name }} for name, or write a generic greeting)', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Fallback Greeting (shown if name is unknown)', 'value' => 'Hi there,'],
                    ['label' => 'Body', 'value' => "You started the interview process but haven't finished watching the video yet. Pick up right where you left off."],
                    ['label' => 'Button Text', 'value' => 'Continue Interview'],
                ],
            ],
            [
                'slug' => 'watts-for-workers-abandon-form',
                'name' => 'Watts to Workers - Abandon (Questions Step)',
                'subject' => "You're almost done with your interview",
                'content' => [
                    ['label' => 'Heading', 'value' => 'Continue Your Interview'],
                    ['label' => 'Greeting (use {{ $first_name }} for name, or write a generic greeting)', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Fallback Greeting (shown if name is unknown)', 'value' => 'Hi there,'],
                    ['label' => 'Body', 'value' => "You're so close to completing your interview. Just a few more questions to go."],
                    ['label' => 'Button Text', 'value' => 'Continue Interview'],
                ],
            ],
            [
                'slug' => 'watts-for-workers-abandon-final',
                'name' => 'Watts to Workers - Abandon (Final Nudge)',
                'subject' => "We'd hate for you to miss out",
                'content' => [
                    ['label' => 'Heading', 'value' => 'Last Chance'],
                    ['label' => 'Greeting (use {{ $first_name }} for name, or write a generic greeting)', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Fallback Greeting (shown if name is unknown)', 'value' => 'Hi there,'],
                    ['label' => 'Body', 'value' => "We noticed you haven't finished your interview for the Watts to Workers program. This is a great opportunity and we'd love for you to complete the process.\n\nYour progress has been saved, so you can pick up exactly where you left off."],
                    ['label' => 'Button Text', 'value' => 'Finish My Interview'],
                ],
            ],
            [
                'slug' => 'texas-tech-compute-admin',
                'name' => 'Texas Tech Compute - Admin Notification',
                'subject' => 'New Texas Tech Compute Inquiry',
                'content' => [
                    ['label' => 'Heading', 'value' => 'New Compute Inquiry'],
                    ['label' => 'Intro Text', 'value' => 'A new inquiry has been submitted for Texas Tech computing power.'],
                ],
            ],
            [
                'slug' => 'texas-tech-compute-confirm',
                'name' => 'Texas Tech Compute - Confirmation',
                'subject' => 'Thank You for Your Interest in Texas Tech Compute',
                'content' => [
                    ['label' => 'Heading', 'value' => 'Inquiry Received'],
                    ['label' => 'Subheading', 'value' => 'Thank you for your interest in Texas Tech computing power.'],
                    ['label' => 'Greeting', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Body', 'value' => 'Thank you for reaching out about Texas Tech computing resources. We have received your inquiry and our team is reviewing the details. Someone from ThisWay Global will be in touch with you shortly.'],
                    ['label' => 'Closing', 'value' => "Best regards,\nThe ThisWay Global Team"],
                ],
            ],
            [
                'slug' => 'press-inquiry-admin',
                'name' => 'Press Inquiry - Admin Notification',
                'subject' => 'New Press Inquiry',
                'content' => [
                    ['label' => 'Heading', 'value' => 'New Press Inquiry'],
                    ['label' => 'Intro Text', 'value' => 'A journalist or media contact has submitted an inquiry.'],
                ],
            ],
            [
                'slug' => 'press-inquiry-confirm',
                'name' => 'Press Inquiry - Confirmation',
                'subject' => 'Thank You for Your Press Inquiry',
                'content' => [
                    ['label' => 'Heading', 'value' => 'Inquiry Received'],
                    ['label' => 'Subheading', 'value' => 'Thank you for reaching out to ThisWay Global.'],
                    ['label' => 'Greeting', 'value' => 'Hi {{ $first_name }},'],
                    ['label' => 'Body', 'value' => 'Thank you for your press inquiry. We have received your request and our communications team is reviewing the details. Someone from ThisWay Global will be in touch with you shortly.'],
                    ['label' => 'Closing', 'value' => "Best regards,\nThe ThisWay Global Team"],
                ],
            ],
        ];

        $mjmlBase = base_path('../infra/forms/emails');

        foreach ($templates as $template) {
            $mjmlFile = $mjmlBase . '/' . $template['slug'] . '.mjml';
            $mjmlContent = file_exists($mjmlFile)
                ? file_get_contents($mjmlFile)
                : '<mjml><mj-body><mj-section><mj-column><mj-text>Template placeholder</mj-text></mj-column></mj-section></mj-body></mjml>';

            $record = EmailTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                [
                    'name' => $template['name'],
                    'subject' => $template['subject'],
                    'content' => $template['content'],
                    'mjml_content' => $mjmlContent,
                ],
            );

            try {
                $record->compileMjml();
            } catch (\Exception $e) {
                $this->command?->warn("Could not compile {$template['slug']}: " . $e->getMessage());
            }
        }
    }
}
