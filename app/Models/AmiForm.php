<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmiForm extends Model
{
    protected $fillable = [
        'title',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];
}
