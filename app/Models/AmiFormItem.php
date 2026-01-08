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
        'target_value',
        'capaian_unit',
        'capaian_value',
        'persentase_unit',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
        'target_value' => 'float',
        'capaian_value' => 'float',
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
