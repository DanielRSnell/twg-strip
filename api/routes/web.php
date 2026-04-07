<?php

use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::redirect('/', '/admin');
Route::get('/login', fn () => redirect('/admin/login'))->name('login');

Route::get('/exports/{export}/download', function (Export $export) {
    $path = $export->file_name . '.csv';

    if (!Storage::disk($export->file_disk)->exists($path)) {
        abort(404, 'Export file not found.');
    }

    return Storage::disk($export->file_disk)->download($path, 'applicants-export-' . $export->id . '.csv');
})->middleware('auth')->name('export.download');
