<?php

use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::redirect('/', '/admin');
Route::get('/login', fn () => redirect('/admin/login'))->name('login');

Route::get('/exports/{export}/download', function (Export $export) {
    $path = $export->file_name . '.csv';
    $disk = Storage::disk($export->file_disk);

    if (!$disk->exists($path)) {
        abort(404, 'Export file not found.');
    }

    // For cloud disks, redirect to a temporary URL
    if (in_array($export->file_disk, ['s3', 'r2'])) {
        return redirect($disk->temporaryUrl($path, now()->addHours(1)));
    }

    return $disk->download($path, 'applicants-export-' . $export->id . '.csv');
})->middleware('auth')->name('export.download');
