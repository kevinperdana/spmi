<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionnaireItemResponse extends Model
{
    protected $fillable = [
        'questionnaire_response_id',
        'questionnaire_item_id',
        'questionnaire_option_id',
    ];

    public function response(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireResponse::class, 'questionnaire_response_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireItem::class, 'questionnaire_item_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireOption::class, 'questionnaire_option_id');
    }
}
