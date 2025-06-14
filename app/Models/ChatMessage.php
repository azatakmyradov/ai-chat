<?php

namespace App\Models;

use App\Enums\Models;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatMessage extends Model
{
    /** @use HasFactory<\Database\Factories\ChatMessageFactory> */
    use HasFactory, HasUuids;

    protected function model(): Attribute
    {
        return Attribute::make(
            get: fn(?string $value) => $value ? Models::from($value)->toArray() : null,
        );
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ChatMessageAttachment::class);
    }
}
