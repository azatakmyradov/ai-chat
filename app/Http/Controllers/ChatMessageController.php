<?php

namespace App\Http\Controllers;

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
    public function store(Chat $chat, StoreChatMessageRequest $request)
    {
        try {
            DB::beginTransaction();

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

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'attachments' => $e->getMessage(),
            ]);
        }

        UserMessageSent::broadcast($chat, $request->get('message'))->toOthers();
        AIStreamResponse::dispatch($chat, Models::from($request->get('model')));
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
