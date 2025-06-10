<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChatRequest;
use App\Jobs\AIRequestThreadDescription;
use App\Jobs\AIStreamResponse;
use App\Models\Chat;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('chat/index', [
            'chats' => user()->chats()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChatRequest $request)
    {
        $chat = user()->chats()->create([
            'title' => 'New Thread',
        ]);

        $chat->messages()->create([
            'user_id' => user()->id,
            'content' => $request->get('message'),
            'role' => 'user',
        ]);

        AIStreamResponse::dispatch($chat, $request->get('message'));

        return redirect()->route('chat.show', $chat);
    }

    /**
     * Display the specified resource.
     */
    public function show(Chat $chat)
    {
        $chat->load(['messages.user']);

        return inertia('chat/show', [
            'chat' => $chat,
            'chats' => user()->chats()->get(),
            'messages' => $chat->messages()->with('user')->get(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat)
    {
        //
    }
}
