<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin');
Route::get('/login', fn () => redirect('/admin/login'))->name('login');
