<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->string('to_email');
            $table->string('to_name')->nullable();
            $table->string('from_email');
            $table->string('subject');
            $table->string('template_slug')->nullable();
            $table->string('status')->default('sent');
            $table->text('error')->nullable();
            $table->foreignId('applicant_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('to_email');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
