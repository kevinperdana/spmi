<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionnaireOption extends Model
{
    protected $fillable = [
        'questionnaire_item_id',
        'label',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireItem::class);
    }
}
