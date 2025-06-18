<?php

namespace App\Http\Controllers;

use App\Enums\Models;
use App\Events\RetryChatMessage;
use App\Jobs\AIStreamResponse;
use App\Models\Chat;
use App\Models\ChatMessage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use ValueError;

class RetryChatMessageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Chat $chat, ChatMessage $message)
    {
        $request->validate([
            'model' => ['required'],
        ]);

        try {
            $model = Models::from($request->model);
        } catch (ValueError) {
            Log::error('Invalid model', ['model' => $request->model]);

            return redirect()->route('chat.show', $chat)->with('error', 'Invalid model');
        } catch (Exception) {
            Log::error('An error occurred while retrying the message', ['model' => $request->model]);

            return redirect()->route('chat.show', $chat)->with('error', 'An error occurred while retrying the message');
        }

        $chat->messages()->where('id', '>=', $message->id)->delete();

        Cache::forget('chat.'.$chat->id);

        $lastMessageUserMessage = $chat->messages()->latest()->where('role', 'user')->first();

        RetryChatMessage::dispatch($chat, $chat->messages);
        AIStreamResponse::dispatch($chat->refresh(), $lastMessageUserMessage?->web_search ?? false, $model);

        session()->flash('show_loading_indicator', true);

        return redirect()->route('chat.show', $chat);
    }
}
