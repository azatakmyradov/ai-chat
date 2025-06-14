<?php

namespace App\Actions;

use App\Enums\Models;
use App\Events\UserMessageSent;
use App\Jobs\AIStreamResponse;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use Illuminate\Http\Request;

class CreateChatMessage
{
    public function handle(Chat $chat, Request $request): ChatMessage
    {
        $message = $chat->messages()->create([
            'user_id' => user()->id,
            'content' => $request->get('message'),
            'role' => 'user',
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $attachment) {
                $path = $attachment->store('attachments');
                ChatMessageAttachment::create([
                    'chat_message_id' => $message->id,
                    'file_name' => $attachment->getClientOriginalName(),
                    'file_path' => $path,
                    'type' => ChatMessageAttachment::getMimeTypes()[$attachment->getClientOriginalExtension()],
                ]);
            }
        }

        UserMessageSent::broadcast($chat, $message->load('attachments'));
        AIStreamResponse::dispatch($chat, Models::from($request->get('model')));

        return $message;
    }
}
