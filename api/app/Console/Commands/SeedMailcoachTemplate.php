<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Mailcoach\Domain\Template\Models\Template;

class SeedMailcoachTemplate extends Command
{
    protected $signature = 'mailcoach:seed-template';
    protected $description = 'Create the ThisWay Global branded email template in Mailcoach';

    public function handle(): int
    {
        $html = <<<'HTML'
<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 0 16px 32px; }
    .logo-section { text-align: center; padding: 32px 16px 0; }
    .logo-section img { width: 140px; height: auto; }
    .card { background-color: #ffffff; border-radius: 12px; padding: 40px 32px 32px; margin-top: 16px; }
    .heading { font-size: 22px; font-weight: 700; color: #18181b; margin: 0 0 4px; }
    .subheading { font-size: 14px; color: #71717a; margin: 0 0 24px; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 0 0 24px; }
    .body-text { font-size: 15px; line-height: 1.6; color: #18181b; margin: 0 0 16px; }
    .btn { display: inline-block; background-color: #18181b; color: #fafafa !important; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; padding: 12px 24px; margin: 8px 0; }
    .btn:hover { background-color: #27272a; }
    .info-box { background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 0 0 16px; }
    .info-label { font-size: 11px; text-transform: uppercase; color: #71717a; margin: 0 0 4px; letter-spacing: 0.05em; }
    .info-value { font-size: 16px; font-weight: 600; color: #18181b; margin: 0; }
    .footer { text-align: center; padding: 24px 32px; font-size: 12px; color: #a1a1aa; }
    .footer a { color: #a1a1aa; text-decoration: underline; }
    @media only screen and (max-width: 600px) {
      .card { padding: 24px 20px 24px; }
      .wrapper { padding: 0 8px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo-section">
      <img src="https://thiswayglobal.com/images/logo.png" alt="ThisWay Global" />
    </div>

    <div class="card">
      <h1 class="heading">[[[heading:text]]]</h1>
      <p class="subheading">[[[subheading:text]]]</p>
      <hr class="divider" />

      [[[content]]]
    </div>

    <div class="footer">
      <p>ThisWay Global &middot; Austin, TX</p>
      <p><a href="::unsubscribeUrl::">Unsubscribe</a> · <a href="::webviewUrl::">View in browser</a></p>
    </div>
  </div>
</body>
</html>
HTML;

        Template::updateOrCreate(
            ['name' => 'ThisWay Global'],
            ['html' => $html],
        );

        $this->info('ThisWay Global template created/updated in Mailcoach.');

        return 0;
    }
}
