<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InterviewEvent extends Model
{
    protected $fillable = [
        'client',
        'email',
        'event',
        'data',
        'event_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'event_at' => 'datetime',
        ];
    }
}
