<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use Illuminate\Support\Facades\Cache;

class BranchOffChatController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Chat $chat, ChatMessage $message)
    {
        $newChat = $chat->replicate();
        $newChat->branch_chat_id = $chat->id;
        $newChat->save();

        $chat->messages()->where('id', '<=', $message->id)->each(function (ChatMessage $message) use ($newChat) {
            $newMessage = $message->replicate();
            $newMessage->chat_id = $newChat->id;
            $newMessage->save();

            $message->attachments()->each(function (ChatMessageAttachment $attachment) use ($newMessage) {
                $newAttachment = $attachment->replicate();
                $newAttachment->chat_message_id = $newMessage->id;
                $newAttachment->save();
            });
        });

        Cache::forget('chat.' . $chat->id);
        Cache::forget('chat.' . $newChat->id);
        Cache::forget('chats.' . user()->id);

        return redirect()->route('chat.show', $newChat);
    }
}
