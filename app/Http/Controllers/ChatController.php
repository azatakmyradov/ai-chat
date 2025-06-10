<?php

namespace App\Http\Controllers;

use App\Enums\Models;
use App\Http\Requests\StoreChatRequest;
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
            'chats' => user()->chats()->latest()->latest('id')->get(),
            'models' => Models::getAvailableModels(),
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

        AIStreamResponse::dispatch($chat, $request->get('message'), Models::from($request->get('model')));

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
            'chats' => user()->chats()->latest()->latest('id')->get(),
            'messages' => $chat->messages()->with('user')->get(),
            'models' => Models::getAvailableModels(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat)
    {
        $chatId = $chat->id;
        $chat->delete();

        // Check if this is the current chat being viewed
        $currentUrl = request()->header('Referer') ?? '';
        $isCurrentChat = str_contains($currentUrl, "/chat/{$chatId}");

        if ($isCurrentChat) {
            // If deleting the current chat, redirect to home
            return redirect()->route('chat.index');
        } else {
            // If deleting from sidebar, redirect back to current page
            return redirect()->back();
        }
    }
}
