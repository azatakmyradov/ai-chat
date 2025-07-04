<?php

namespace App\Models;

use App\Enums\Models;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\LaravelMarkdown\MarkdownRenderer;
use Throwable;

class ChatMessage extends Model
{
    /** @use HasFactory<\Database\Factories\ChatMessageFactory> */
    use HasFactory, HasUuids;

    protected $casts = [
        'is_failed' => 'boolean',
    ];

    protected function model(): Attribute
    {
        return Attribute::make(
            get: fn(?string $value) => $this->getModel($value)->toArray(),
        );
    }

    protected function getModel(?string $value): Models
    {
        if (!$value) {
            return Models::UNKNOWN;
        }

        try {
            return Models::tryFrom($value);
        } catch (Throwable) {
            return Models::UNKNOWN;
        }
    }

    public function content(): Attribute
    {
        return Attribute::make(
            get: fn(?string $value) => $value ? app(MarkdownRenderer::class)->highlightTheme('github-dark')->toHtml($value) : null,
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
