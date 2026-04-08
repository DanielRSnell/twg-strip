<?php

use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::redirect('/', '/admin');
Route::get('/login', fn () => redirect('/admin/login'))->name('login');

Route::get('/exports/{export}/download', function (Export $export) {
    $disk = Storage::disk($export->file_disk);

    // Filament stores exports as filament_exports/{id}/{filename}.xlsx
    $xlsxPath = "filament_exports/{$export->id}/{$export->file_name}.xlsx";
    $csvPath = "filament_exports/{$export->id}/{$export->file_name}.csv";
    $legacyCsvPath = $export->file_name . '.csv';

    $path = match (true) {
        $disk->exists($xlsxPath) => $xlsxPath,
        $disk->exists($csvPath) => $csvPath,
        $disk->exists($legacyCsvPath) => $legacyCsvPath,
        default => null,
    };

    if (!$path) {
        abort(404, 'Export file not found.');
    }

    // For cloud disks, redirect to a temporary URL
    if (in_array($export->file_disk, ['s3', 'r2'])) {
        return redirect($disk->temporaryUrl($path, now()->addHours(1)));
    }

    return $disk->download($path, basename($path));
})->middleware('auth')->name('export.download');
