<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AmiFormSection extends Model
{
    protected $fillable = [
        'ami_form_id',
        'title',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(AmiForm::class, 'ami_form_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AmiFormItem::class, 'section_id');
    }
}
