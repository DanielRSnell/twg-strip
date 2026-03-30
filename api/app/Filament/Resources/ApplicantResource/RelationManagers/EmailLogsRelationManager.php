<?php

namespace App\Filament\Resources\ApplicantResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class EmailLogsRelationManager extends RelationManager
{
    protected static string $relationship = 'emailLogs';

    protected static ?string $title = 'Email History';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('subject')
                    ->limit(50),
                Tables\Columns\TextColumn::make('to_email')
                    ->label('To'),
                Tables\Columns\TextColumn::make('template_slug')
                    ->label('Template')
                    ->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'sent' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Sent At')
                    ->dateTime('M j, Y g:i A T')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
