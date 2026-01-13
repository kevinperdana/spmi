<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionnaireField extends Model
{
    protected $fillable = [
        'page_id',
        'type',
        'label',
        'placeholder',
        'input_type',
        'content',
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
        return $this->hasMany(QuestionnaireFieldOption::class);
    }
}
