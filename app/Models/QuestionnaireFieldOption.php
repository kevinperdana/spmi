<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionnaireFieldOption extends Model
{
    protected $fillable = [
        'questionnaire_field_id',
        'label',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function field(): BelongsTo
    {
        return $this->belongsTo(QuestionnaireField::class);
    }
}
