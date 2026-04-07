<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExportResource\Pages;
use Filament\Actions\Exports\Models\Export;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ExportResource extends Resource
{
    protected static ?string $model = Export::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-arrow-down-tray';

    protected static ?string $navigationLabel = 'Exports';

    protected static ?int $navigationSort = 5;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Exported By')
                    ->sortable(),
                Tables\Columns\TextColumn::make('exporter')
                    ->label('Type')
                    ->formatStateUsing(fn (string $state): string => str_replace('App\\Filament\\Resources\\', '', $state))
                    ->badge(),
                Tables\Columns\TextColumn::make('successful_rows')
                    ->label('Rows')
                    ->sortable(),
                Tables\Columns\TextColumn::make('completed_at')
                    ->label('Completed')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->placeholder('Processing...'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Requested')
                    ->dateTime('M j, Y g:i A')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Tables\Actions\Action::make('download')
                    ->label('Download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn (Export $record) => route('export.download', $record))
                    ->visible(fn (Export $record) => $record->completed_at !== null),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListExports::route('/'),
        ];
    }
}
