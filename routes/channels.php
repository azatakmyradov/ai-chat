<?php

use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{chat}', function (User $user, string $chatId) {
    $chat = Chat::find($chatId);

    return $user->id === $chat?->user_id || $chat->is_public;
});
