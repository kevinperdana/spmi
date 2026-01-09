<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmiFormItemResponse extends Model
{
    protected $fillable = [
        'ami_form_item_id',
        'user_id',
        'value_bool',
        'value_number',
        'notes',
    ];

    protected $casts = [
        'value_bool' => 'boolean',
        'value_number' => 'decimal:4',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(AmiFormItem::class, 'ami_form_item_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
