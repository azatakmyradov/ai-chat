<?php

namespace App\Http\Controllers;

use App\Actions\CreateChatMessage;
use App\Enums\Models;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;
use App\Models\Chat;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Chat::class);
    }

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
    public function store(StoreChatRequest $request, CreateChatMessage $createChatMessage)
    {
        try {
            DB::beginTransaction();

            $createChatMessage->handle(
                $chat = user()->chats()->create([
                    'title' => 'New Thread',
                ]),
                $request
            );

            DB::commit();
        } catch (Exception) {
            DB::rollBack();

            return back()->withErrors(['message' => 'Failed to create chat']);
        }

        session()->flash('first_message', true);

        return redirect()
            ->route('chat.show', $chat);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Chat $chat, UpdateChatRequest $request)
    {
        $chat->update($request->validated());

        return redirect()
            ->route('chat.show', $chat);
    }

    /**
     * Display the specified resource.
     */
    public function show(Chat $chat)
    {
        $chat->load(['messages.user', 'messages.attachments']);

        return inertia('chat/show', [
            'chat' => $chat,
            'chats' => Auth::check() ? user()->chats()->latest()->latest('id')->get() : [],
            'messages' => $chat->messages,
            'models' => Models::getAvailableModels(),
            'first_message' => session()->get('first_message', false),
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
