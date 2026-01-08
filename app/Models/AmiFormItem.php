<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AmiFormItem extends Model
{
    protected $fillable = [
        'section_id',
        'code',
        'indicator',
        'satuan_unit',
        'target_unit',
        'capaian_unit',
        'persentase_unit',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(AmiFormSection::class, 'section_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(AmiFormItemResponse::class, 'ami_form_item_id');
    }
}
