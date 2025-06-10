<?php

use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{chat}', function (User $user, string $chatId) {
    return $user->id === Chat::find($chatId)?->user_id;
});
