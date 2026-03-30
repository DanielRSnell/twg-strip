<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InterviewEventResource\Pages;
use App\Models\InterviewEvent;
use Filament\Actions\ViewAction;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InterviewEventResource extends Resource
{
    protected static ?string $model = InterviewEvent::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-signal';

    protected static string | \UnitEnum | null $navigationGroup = 'Submissions';

    protected static ?int $navigationSort = 2;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('client')
                    ->badge()
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('event')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'funnel_completed' => 'success',
                        'funnel_exited' => 'danger',
                        'video_completed' => 'info',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('event_at')
                    ->dateTime('M j, Y g:i A T')
                    ->sortable(),
            ])
            ->defaultSort('event_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('client')
                    ->options([
                        'watts-to-workers' => 'Watts to Workers',
                        'texas-tech' => 'Texas Tech',
                    ]),
                Tables\Filters\SelectFilter::make('event')
                    ->options([
                        'email_submitted' => 'Email Submitted',
                        'video_started' => 'Video Started',
                        'video_completed' => 'Video Completed',
                        'form_started' => 'Form Started',
                        'form_completed' => 'Form Completed',
                        'funnel_completed' => 'Funnel Completed',
                        'funnel_exited' => 'Funnel Exited',
                    ]),
            ])
            ->actions([
                ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInterviewEvents::route('/'),
        ];
    }
}
