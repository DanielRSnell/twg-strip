<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('applicants:detect-abandoned')->everyFiveMinutes();
Schedule::command('applicants:daily-digest')->dailyAt('08:00')->timezone('America/Chicago');
