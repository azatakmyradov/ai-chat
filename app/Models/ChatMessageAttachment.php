<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessageAttachment extends Model
{
    /** @use HasFactory<\Database\Factories\ChatMessageAttachmentFactory> */
    use HasFactory;

    public function chatMessage(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class);
    }

    public static function getMimeTypes(): array
    {
        return [
            'jpeg' => 'image',
            'png' => 'image',
            'jpg' => 'image',
            'gif' => 'image',
            'webp' => 'image',
            'heic' => 'image',
            'pdf' => 'document',
            'txt' => 'text',
        ];
    }
}
