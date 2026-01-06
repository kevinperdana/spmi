<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PageDocument extends Model
{
    protected $fillable = [
        'section_id',
        'doc_number',
        'title',
        'description',
        'file_label',
        'file_path',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    protected $appends = [
        'file_url',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(PageDocumentSection::class, 'section_id');
    }

    public function getFileUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
