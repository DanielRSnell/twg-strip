<?php

namespace App\Filament\Resources;

use App\Models\Applicant;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ApplicantExporter extends Exporter
{
    protected static ?string $model = Applicant::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('first_name')->label('First Name'),
            ExportColumn::make('last_name')->label('Last Name'),
            ExportColumn::make('email'),
            ExportColumn::make('phone'),
            ExportColumn::make('client'),
            ExportColumn::make('status'),
            ExportColumn::make('answers.stillInterested')->label('Still Interested'),
            ExportColumn::make('answers.textMessageConsent')->label('Text Consent'),
            ExportColumn::make('answers.availableSessions')->label('Available Sessions'),
            ExportColumn::make('answers.currentLocation')->label('Location'),
            ExportColumn::make('answers.willingToRelocate')->label('Willing to Relocate'),
            ExportColumn::make('answers.referral')->label('Referral'),
            ExportColumn::make('completed_at')->label('Completed At'),
            ExportColumn::make('created_at')->label('Started At'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        // Email the export download link to the requesting user
        try {
            $user = $export->user;
            $xlsxPath = "filament_exports/{$export->id}/{$export->file_name}.xlsx";
            $csvPath = "filament_exports/{$export->id}/{$export->file_name}.csv";
            $filePath = Storage::disk($export->file_disk)->exists($xlsxPath) ? $xlsxPath : $csvPath;

            if ($user && Storage::disk($export->file_disk)->exists($filePath)) {
                $url = Storage::disk($export->file_disk)->temporaryUrl($filePath, now()->addHours(24));

                Mail::raw(
                    "Your applicant export is ready with " . number_format($export->successful_rows) . " rows.\n\nDownload: {$url}\n\nThis link expires in 24 hours.",
                    function ($message) use ($user, $export) {
                        $message->to($user->email)
                            ->subject('Applicant Export Ready - ' . number_format($export->successful_rows) . ' rows');
                    }
                );
            }
        } catch (\Throwable) {
            // Don't block the notification if email fails
        }

        return 'Your applicant export has completed. ' . number_format($export->successful_rows) . ' rows exported. A download link has been emailed to you.';
    }
}
