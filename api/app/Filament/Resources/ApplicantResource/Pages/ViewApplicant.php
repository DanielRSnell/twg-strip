<?php

namespace App\Filament\Resources\ApplicantResource\Pages;

use App\Filament\Resources\ApplicantResource;
use App\Models\Applicant;
use App\Models\EmailLog;
use App\Models\InterviewEvent;
use Filament\Infolists\Components\KeyValueEntry;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class ViewApplicant extends ViewRecord
{
    protected static string $resource = ApplicantResource::class;

    protected \Filament\Support\Enums\Width | string | null $maxContentWidth = 'full';

    public function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Applicant Info')
                    ->schema([
                        TextEntry::make('full_name')->label('Name'),
                        TextEntry::make('email'),
                        TextEntry::make('phone')->placeholder('--'),
                        TextEntry::make('client')
                            ->badge()
                            ->formatStateUsing(fn (string $state): string => match ($state) {
                                'watts-to-workers' => 'Watts to Workers',
                                'texas-tech' => 'Texas Tech',
                                default => $state,
                            }),
                        TextEntry::make('status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'completed' => 'success',
                                'in_progress' => 'info',
                                'abandoned' => 'warning',
                                'exited' => 'danger',
                                default => 'gray',
                            }),
                        TextEntry::make('created_at')->label('Started')->dateTime('M j, Y g:i A T'),
                        TextEntry::make('completed_at')->label('Completed')->dateTime('M j, Y g:i A T')->placeholder('--'),
                    ])->columns(3),

                Section::make('Interview Answers')
                    ->schema([
                        KeyValueEntry::make('display_answers')
                            ->label('')
                            ->state(function (Applicant $record): array {
                                $answers = $record->answers ?? [];
                                $display = [];
                                $labels = [
                                    'firstName' => 'First Name',
                                    'lastName' => 'Last Name',
                                    'phone' => 'Phone',
                                    'stillInterested' => 'Still Interested',
                                    'textMessageConsent' => 'Text Consent',
                                    'availableSessions' => 'Available Sessions',
                                    'currentLocation' => 'Location',
                                    'willingToRelocate' => 'Willing to Relocate',
                                    'referral' => 'Referral',
                                ];
                                foreach ($labels as $key => $label) {
                                    if (isset($answers[$key])) {
                                        $display[$label] = $answers[$key];
                                    }
                                }

                                return $display;
                            }),
                    ])
                    ->visible(fn (Applicant $record): bool => ! empty(array_intersect_key($record->answers ?? [], array_flip(['firstName', 'lastName', 'phone', 'stillInterested'])))),

                Section::make('Abandon Position')
                    ->schema([
                        TextEntry::make('answers._last_step')
                            ->label('Last Step')
                            ->badge()
                            ->formatStateUsing(fn (?string $state): string => match ($state) {
                                'email' => 'Email Entry',
                                'video' => 'Watching Video',
                                'form' => 'Answering Questions',
                                default => $state ?? 'Unknown',
                            }),
                        TextEntry::make('answers._last_event')
                            ->label('Last Event'),
                    ])->columns(2)
                    ->visible(fn (Applicant $record): bool => in_array($record->status, ['abandoned'])),
            ]);
    }

    public function getRelationManagers(): array
    {
        return [
            ApplicantResource\RelationManagers\EventsRelationManager::class,
            ApplicantResource\RelationManagers\EmailLogsRelationManager::class,
        ];
    }
}
