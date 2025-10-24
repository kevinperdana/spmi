<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LandingPage extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'sections',
        'global_styles',
        'published',
    ];

    protected $casts = [
        'sections' => 'array',
        'global_styles' => 'array',
        'published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($landingPage) {
            if (empty($landingPage->slug)) {
                $landingPage->slug = Str::slug($landingPage->title);
            }
        });

        static::updating(function ($landingPage) {
            if ($landingPage->isDirty('title') && empty($landingPage->slug)) {
                $landingPage->slug = Str::slug($landingPage->title);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
