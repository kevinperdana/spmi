<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'secondary_slug',
        'active_slug_source',
        'layout_type',
        'content',
        'is_published',
        'order',
    ];

    protected $appends = [
        'active_slug',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'order' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documentSections(): HasMany
    {
        return $this->hasMany(PageDocumentSection::class);
    }

    public function questionnaireItems(): HasMany
    {
        return $this->hasMany(QuestionnaireItem::class);
    }

    public function questionnaireFields(): HasMany
    {
        return $this->hasMany(QuestionnaireField::class);
    }

    public function questionnaireSections(): HasMany
    {
        return $this->hasMany(QuestionnaireSection::class);
    }

    public function questionnaireResponses(): HasMany
    {
        return $this->hasMany(QuestionnaireResponse::class);
    }

    public function getActiveSlugAttribute(): string
    {
        if (!empty($this->secondary_slug)) {
            return $this->secondary_slug;
        }

        $generatedSecondarySlug = preg_replace('/[^a-z0-9]/', '', strtolower((string) $this->slug));
        if (!empty($generatedSecondarySlug)) {
            return $generatedSecondarySlug;
        }

        return $this->slug;
    }
}
