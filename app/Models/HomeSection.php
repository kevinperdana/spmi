<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSection extends Model
{
    protected $fillable = [
        'order',
        'layout_type',
        'section_type',
        'background_color',
        'background_config',
        'content',
        'is_active',
    ];

    protected $casts = [
        'content' => 'array',
        'background_config' => 'array',
        'is_active' => 'boolean',
    ];
}
