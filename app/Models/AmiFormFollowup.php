<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmiFormFollowup extends Model
{
    protected $fillable = [
        'ami_form_item_id',
        'type',
        'decision',
        'target_time',
        'responsible',
        'status',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(AmiFormItem::class, 'ami_form_item_id');
    }
}
