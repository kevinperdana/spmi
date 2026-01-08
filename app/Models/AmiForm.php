<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class AmiForm extends Model
{
    protected $fillable = [
        'title',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(AmiFormSection::class);
    }

    public function items(): HasManyThrough
    {
        return $this->hasManyThrough(AmiFormItem::class, AmiFormSection::class, 'ami_form_id', 'section_id');
    }
}
