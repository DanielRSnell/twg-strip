<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;

class EmailCampaignsWidget extends Widget
{
    protected string $view = 'filament.widgets.email-campaigns-widget';

    protected int|string|array $columnSpan = 'full';

    public static function getSort(): int
    {
        return -1;
    }
}
