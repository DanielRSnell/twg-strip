<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EmailTemplateResource\Pages;
use App\Models\EmailTemplate;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class EmailTemplateResource extends Resource
{
    protected static ?string $model = EmailTemplate::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-envelope';

    protected static string | \UnitEnum | null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Email Content';

    protected static ?string $modelLabel = 'Email';

    protected static ?string $pluralModelLabel = 'Emails';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Email Settings')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Email Name')
                            ->disabled()
                            ->helperText('This identifies which email this is.'),
                        Forms\Components\TextInput::make('subject')
                            ->label('Subject Line')
                            ->required()
                            ->maxLength(255)
                            ->helperText('The subject line recipients will see in their inbox.'),
                    ]),
                Section::make('Content Blocks')
                    ->description('Each block maps to a section of the email template (field_1, field_2, etc.). Edit the value to change what appears in the email.')
                    ->schema([
                        Forms\Components\Repeater::make('content')
                            ->label('')
                            ->schema([
                                Forms\Components\Textarea::make('value')
                                    ->label(fn ($get): string => $get('label') ?? 'Content')
                                    ->rows(3),
                                Forms\Components\Hidden::make('label'),
                            ])
                            ->itemLabel(fn (array $state): ?string => $state['label'] ?? null)
                            ->addable(false)
                            ->deletable(false)
                            ->reorderable(false)
                            ->collapsible()
                            ->collapsed(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('slug')
                    ->label('Category')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match (true) {
                        str_contains($state, 'interview') => 'Interview',
                        str_contains($state, 'watts-for-workers') => 'Interest Form',
                        str_contains($state, 'texas-tech') => 'Texas Tech',
                        str_contains($state, 'press') => 'Press',
                        default => 'Other',
                    })
                    ->color(fn (string $state): string => match (true) {
                        str_contains($state, 'interview') => 'primary',
                        str_contains($state, 'watts-for-workers') => 'info',
                        str_contains($state, 'texas-tech') => 'warning',
                        str_contains($state, 'press') => 'gray',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('recipient_type')
                    ->label('To')
                    ->badge()
                    ->state(fn ($record): string => str_ends_with($record->slug, '-admin') ? 'Admin' : 'User')
                    ->color(fn ($state): string => $state === 'Admin' ? 'warning' : 'success'),
                Tables\Columns\TextColumn::make('subject')
                    ->label('Subject Line')
                    ->limit(50),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last Edited')
                    ->since()
                    ->sortable(),
            ])
            ->actions([
                \Filament\Actions\EditAction::make()
                    ->label('Edit Content'),
                \Filament\Actions\Action::make('preview')
                    ->label('Preview')
                    ->icon('heroicon-o-eye')
                    ->url(fn (EmailTemplate $record): string => route('email-template.preview', $record))
                    ->openUrlInNewTab(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEmailTemplates::route('/'),
            'edit' => Pages\EditEmailTemplate::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
