<?php

namespace App\Http\Controllers;

use App\Actions\CreateChatMessage;
use App\Enums\Models;
use App\Events\UserMessageSent;
use App\Http\Requests\StoreChatMessageRequest;
use App\Http\Requests\UpdateChatMessageRequest;
use App\Jobs\AIStreamResponse;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChatMessageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Chat $chat, StoreChatMessageRequest $request, CreateChatMessage $createChatMessage)
    {
        try {
            DB::beginTransaction();

            $createChatMessage->handle($chat, $request);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'attachments' => $e->getMessage(),
            ]);
        }

        return redirect()->back();
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
        $chatMessage->delete();

        return redirect()->back();
    }
}
