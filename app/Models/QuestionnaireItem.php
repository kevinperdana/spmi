<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionnaireItem extends Model
{
    protected $fillable = [
        'page_id',
        'section_id',
        'question',
        'description',
        'type',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionnaireOption::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireSection::class);
    }
}
