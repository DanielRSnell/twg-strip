<?php

namespace App\Filament\Resources\EmailTemplateResource\Pages;

use App\Filament\Resources\EmailTemplateResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEmailTemplate extends EditRecord
{
    protected static string $resource = EmailTemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('preview')
                ->label('Preview Email')
                ->icon('heroicon-o-eye')
                ->slideOver()
                ->modalWidth('3xl')
                ->modalHeading('Email Preview')
                ->modalContent(function () {
                    $url = route('email-template.preview', $this->record);

                    return view('filament.email-preview-drawer', ['url' => $url]);
                })
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Close'),
        ];
    }
}
