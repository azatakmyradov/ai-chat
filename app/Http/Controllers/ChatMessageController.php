<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChatMessageRequest;
use App\Http\Requests\UpdateChatMessageRequest;
use App\Jobs\AIStreamResponse;
use App\Models\Chat;
use App\Models\ChatMessage;

class ChatMessageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Chat $chat, StoreChatMessageRequest $request)
    {
        $chat->messages()->create([
            'user_id' => user()->id,
            'content' => $request->get('message'),
            'role' => 'user',
        ]);

        AIStreamResponse::dispatch($chat, $request->get('message'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChatMessageRequest $request, ChatMessage $chatMessage)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChatMessage $chatMessage)
    {
        //
    }
}
