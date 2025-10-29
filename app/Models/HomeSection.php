<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSection extends Model
{
    protected $fillable = [
        'title',
        'order',
        'layout_type',
        'section_type',
        'background_color',
        'background_config',
        'container_config',
        'content',
        'is_active',
    ];

    protected $casts = [
        'content' => 'array',
        'background_config' => 'array',
        'container_config' => 'array',
        'is_active' => 'boolean',
    ];
}
