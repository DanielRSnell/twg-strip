<?php

namespace App\Filament\Resources;

use App\Models\Applicant;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;

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
        return 'Your applicant export has completed. ' . number_format($export->successful_rows) . ' rows exported.';
    }
}
