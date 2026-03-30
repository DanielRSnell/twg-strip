<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Applicant extends Model
{
    protected $fillable = [
        'client',
        'email',
        'first_name',
        'last_name',
        'phone',
        'status',
        'answers',
        'completed_at',
        'exited_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'completed_at' => 'datetime',
            'exited_at' => 'datetime',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(InterviewEvent::class, 'email', 'email');
    }

    public function scopedEvents()
    {
        return InterviewEvent::where('email', $this->email)
            ->where('client', $this->client)
            ->orderBy('event_at', 'asc')
            ->get();
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? '')) ?: $this->email;
    }
}
