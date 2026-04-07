<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApplicantResource\Pages;
use App\Models\Applicant;
use Filament\Actions\ExportAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ApplicantResource extends Resource
{
    protected static ?string $model = Applicant::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-users';

    protected static ?int $navigationSort = 0;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('full_name')
                    ->label('Name')
                    ->searchable(['first_name', 'last_name']),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
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
                Tables\Columns\TextColumn::make('phone'),
                Tables\Columns\TextColumn::make('completed_at')
                    ->label('Completed')
                    ->dateTime('M j, Y g:i A T')
                    ->sortable()
                    ->placeholder('--'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Started')
                    ->dateTime('M j, Y g:i A T')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'in_progress' => 'In Progress',
                        'completed' => 'Completed',
                        'abandoned' => 'Abandoned',
                        'exited' => 'Exited',
                    ]),
                Tables\Filters\SelectFilter::make('client')
                    ->options([
                        'watts-to-workers' => 'Watts to Workers',
                        'texas-tech' => 'Texas Tech',
                    ]),
            ])
            ->actions([
                ViewAction::make(),
            ])
            ->headerActions([
                ExportAction::make()
                    ->exporter(ApplicantExporter::class)
                    ->fileDisk('local')
                    ->modifyQueryUsing(fn ($query, array $options) => match ($options['status'] ?? 'all') {
                        'all' => $query,
                        default => $query->where('status', $options['status']),
                    })
                    ->optionsFormSchema(fn () => [
                        \Filament\Forms\Components\Select::make('status')
                            ->label('Filter by status')
                            ->options([
                                'all' => 'All Applicants',
                                'completed' => 'Completed',
                                'in_progress' => 'In Progress',
                                'abandoned' => 'Abandoned',
                                'exited' => 'Exited',
                            ])
                            ->default('all'),
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListApplicants::route('/'),
            'view' => Pages\ViewApplicant::route('/{record}'),
        ];
    }
}
