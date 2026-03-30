<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->string('client', 100)->index();
            $table->string('email')->index();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->default('in_progress')->index();
            $table->jsonb('answers')->default('{}');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('exited_at')->nullable();
            $table->timestamps();

            $table->unique(['client', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
