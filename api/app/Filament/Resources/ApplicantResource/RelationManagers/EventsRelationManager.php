<?php

namespace App\Filament\Resources\ApplicantResource\RelationManagers;

use App\Models\Applicant;
use App\Models\InterviewEvent;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class EventsRelationManager extends RelationManager
{
    protected static string $relationship = 'events';

    protected static ?string $title = 'Event Timeline';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('event')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'email_submitted' => 'gray',
                        'video_started' => 'info',
                        'video_progress' => 'info',
                        'video_completed' => 'success',
                        'form_started' => 'warning',
                        'form_progress' => 'warning',
                        'form_completed' => 'success',
                        'funnel_completed' => 'success',
                        'funnel_exited' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('event_at')
                    ->label('Time')
                    ->dateTime('M j, Y g:i A T')
                    ->sortable(),
                Tables\Columns\TextColumn::make('data')
                    ->label('Details')
                    ->formatStateUsing(function ($state) {
                        if (empty($state) || ! is_array($state)) {
                            return '--';
                        }
                        // Show key details inline
                        $parts = [];
                        if (isset($state['percentComplete'])) {
                            $parts[] = round($state['percentComplete']) . '% watched';
                        }
                        if (isset($state['questionId'])) {
                            $parts[] = 'Q: ' . $state['questionId'];
                        }
                        if (isset($state['questionIndex']) && isset($state['totalQuestions'])) {
                            $parts[] = ($state['questionIndex'] + 1) . '/' . $state['totalQuestions'];
                        }

                        return $parts ? implode(' | ', $parts) : '--';
                    }),
            ])
            ->defaultSort('event_at', 'asc');
    }
}
