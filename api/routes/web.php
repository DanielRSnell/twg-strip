<?php

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email-templates/{emailTemplate}/preview', function (EmailTemplate $emailTemplate) {
    // Sample data simulating a real form submission
    $sampleData = [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'email' => 'jane@example.com',
        'phone' => '(555) 123-4567',
        'role_interest' => 'AI Hardware Installer',
        'company' => 'Acme Corp',
        'title' => 'Director of Engineering',
        'urgency' => 'Within 30 days',
        'organization' => 'Tech Daily',
        'inquiry_type' => 'Interview Request',
        'message' => 'I would love to learn more about the program and how to get involved.',
        'note' => 'Available for a call next week.',
    ];

    return response($emailTemplate->render($sampleData))
        ->header('Content-Type', 'text/html');
})->name('email-template.preview');
