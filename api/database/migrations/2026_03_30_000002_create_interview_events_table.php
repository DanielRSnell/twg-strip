<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_events', function (Blueprint $table) {
            $table->id();
            $table->string('client', 100)->index();
            $table->string('email')->index();
            $table->string('event', 100)->index();
            $table->jsonb('data')->default('{}');
            $table->timestamp('event_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_events');
    }
};
