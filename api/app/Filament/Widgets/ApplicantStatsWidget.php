<?php

namespace App\Filament\Widgets;

use App\Models\Applicant;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ApplicantStatsWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $thisWeek = now()->startOfWeek();

        return [
            Stat::make('New This Week', Applicant::where('created_at', '>=', $thisWeek)->count())
                ->description('Applicants who started the funnel')
                ->icon('heroicon-o-user-plus')
                ->color('info'),

            Stat::make('Completed (All Time)', Applicant::where('status', 'completed')->count())
                ->description(Applicant::where('status', 'completed')->where('completed_at', '>=', $thisWeek)->count() . ' this week')
                ->icon('heroicon-o-check-circle')
                ->color('success'),

            Stat::make('Abandoned (All Time)', Applicant::where('status', 'abandoned')->count())
                ->description(Applicant::where('status', 'abandoned')->where('updated_at', '>=', $thisWeek)->count() . ' this week')
                ->icon('heroicon-o-exclamation-triangle')
                ->color('warning'),

            Stat::make('In Progress', Applicant::where('status', 'in_progress')->count())
                ->description('Currently in the funnel')
                ->icon('heroicon-o-arrow-path')
                ->color('gray'),
        ];
    }
}
