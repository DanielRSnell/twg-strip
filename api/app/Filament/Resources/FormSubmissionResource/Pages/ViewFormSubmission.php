<?php

namespace App\Filament\Resources\FormSubmissionResource\Pages;

use App\Filament\Resources\FormSubmissionResource;
use Filament\Infolists\Components\KeyValueEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Schema;

class ViewFormSubmission extends ViewRecord
{
    protected static string $resource = FormSubmissionResource::class;

    public function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Submission Details')
                    ->schema([
                        TextEntry::make('form_type')
                            ->badge(),
                        TextEntry::make('created_at')
                            ->dateTime('M j, Y g:i A T'),
                    ])->columns(2),
                Section::make('Form Data')
                    ->schema([
                        KeyValueEntry::make('data'),
                    ]),
            ]);
    }
}
