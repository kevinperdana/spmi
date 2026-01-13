<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionnaireFieldResponse extends Model
{
    protected $fillable = [
        'questionnaire_response_id',
        'questionnaire_field_id',
        'value',
    ];

    public function response(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireResponse::class, 'questionnaire_response_id');
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireField::class, 'questionnaire_field_id');
    }
}
