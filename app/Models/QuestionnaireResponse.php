<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionnaireResponse extends Model
{
    protected $fillable = [
        'page_id',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function fieldResponses(): HasMany
    {
        return $this->hasMany(QuestionnaireFieldResponse::class);
    }

    public function itemResponses(): HasMany
    {
        return $this->hasMany(QuestionnaireItemResponse::class);
    }
}
