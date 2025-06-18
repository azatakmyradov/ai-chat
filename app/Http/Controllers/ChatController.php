<?php

namespace App\Http\Controllers;

use App\Actions\CreateChatMessage;
use App\Enums\Models;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;
use App\Models\Chat;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
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
            'chats' => Cache::remember('chats.' . user()->id, now()->addMinutes(10), function () {
                return user()->chats()->latest()->latest('id')->get()->groupBy(function ($chat) {
                    return match (true) {
                        $chat->created_at->isToday() => 'today',
                        $chat->created_at->isYesterday() => 'yesterday',
                        $chat->created_at->isBefore(now()->subDays(7)) => 'last_week',
                        $chat->created_at->isBefore(now()->subDays(30)) => 'last_month',
                        default => 'older',
                    };
                });
            }),
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

            Cache::forget('chats.' . user()->id);
        } catch (Exception) {
            DB::rollBack();

            return back()->withErrors(['message' => 'Failed to create chat']);
        }

        session()->flash('show_loading_indicator', true);

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
        $chats = Auth::check()
            ? Cache::remember('chats.' . user()->id, now()->addMinutes(10), function () {
                return user()->chats()->latest()->latest('id')->get()->groupBy(function ($chat) {
                    return match (true) {
                        $chat->created_at->isToday() => 'today',
                        $chat->created_at->isYesterday() => 'yesterday',
                        $chat->created_at->isBefore(now()->subDays(7)) => 'last_week',
                        $chat->created_at->isBefore(now()->subDays(30)) => 'last_month',
                        default => 'older',
                    };
                });
            })
            : [];

        $chat = Cache::remember('chat.' . $chat->id, now()->addMinutes(10), function () use ($chat) {
            return $chat->load(['messages.user', 'messages.attachments']);
        });

        return inertia('chat/show', [
            'chat' => $chat,
            'chats' => $chats,
            'messages' => $chat->messages,
            'models' => Models::getAvailableModels(),
            'show_loading_indicator' => session()->get('show_loading_indicator', false),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat)
    {
        $chatId = $chat->id;
        $chat->delete();

        Cache::forget('chats.' . user()->id);

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
