<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FormSubmissionResource\Pages;
use App\Models\FormSubmission;
use Filament\Actions\ViewAction;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FormSubmissionResource extends Resource
{
    protected static ?string $model = FormSubmission::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-inbox';

    protected static string | \UnitEnum | null $navigationGroup = 'Submissions';

    protected static ?int $navigationSort = 1;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('form_type')
                    ->badge()
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('data.first_name')
                    ->label('First Name')
                    ->searchable(query: function ($query, string $search) {
                        $query->whereRaw("data->>'first_name' ILIKE ?", ["%{$search}%"]);
                    }),
                Tables\Columns\TextColumn::make('data.last_name')
                    ->label('Last Name')
                    ->searchable(query: function ($query, string $search) {
                        $query->whereRaw("data->>'last_name' ILIKE ?", ["%{$search}%"]);
                    }),
                Tables\Columns\TextColumn::make('data.email')
                    ->label('Email')
                    ->searchable(query: function ($query, string $search) {
                        $query->whereRaw("data->>'email' ILIKE ?", ["%{$search}%"]);
                    }),
                Tables\Columns\TextColumn::make('data.phone')
                    ->label('Phone'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M j, Y g:i A T')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('form_type')
                    ->options([
                        'watts-for-workers' => 'Watts for Workers',
                        'texas-tech-compute' => 'Texas Tech Compute',
                        'press-inquiry' => 'Press Inquiry',
                    ]),
            ])
            ->actions([
                ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFormSubmissions::route('/'),
            'view' => Pages\ViewFormSubmission::route('/{record}'),
        ];
    }
}
