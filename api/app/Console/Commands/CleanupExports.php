<?php

namespace App\Console\Commands;

use Filament\Actions\Exports\Models\Export;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupExports extends Command
{
    protected $signature = 'exports:cleanup {--days=7 : Delete exports older than this many days}';
    protected $description = 'Delete expired export files from storage and database';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $exports = Export::where('created_at', '<', $cutoff)->get();

        $deleted = 0;

        foreach ($exports as $export) {
            $disk = Storage::disk($export->file_disk);
            $dir = "filament_exports/{$export->id}";

            if ($disk->exists($dir)) {
                $disk->deleteDirectory($dir);
            }

            $export->delete();
            $deleted++;
        }

        $this->info("Deleted {$deleted} exports older than {$days} days.");

        return 0;
    }
}
