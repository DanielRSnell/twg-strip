<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ApplicantResource;
use App\Models\Applicant;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class RecentApplicantsWidget extends TableWidget
{
    protected static ?int $sort = 2;

    protected static ?string $heading = 'Recent Applicants';

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Applicant::query()->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('full_name')
                    ->label('Name'),
                Tables\Columns\TextColumn::make('email'),
                Tables\Columns\TextColumn::make('client')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'watts-to-workers' => 'Watts to Workers',
                        'texas-tech' => 'Texas Tech',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'completed' => 'success',
                        'in_progress' => 'info',
                        'abandoned' => 'warning',
                        'exited' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Started')
                    ->since(),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make()
                    ->url(fn (Applicant $record): string => ApplicantResource::getUrl('view', ['record' => $record])),
            ])
            ->paginated(false);
    }
}
