<?php

namespace App\Http\Controllers;

use App\Enums\Models;
use App\Models\Chat;
use Illuminate\Http\StreamedEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Prism;

class ChatTitleStreamController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Chat $chat)
    {
        return response()->eventStream(function () use ($chat) {
            // If title is already set and not "Untitled", send it immediately
            if ($chat->title && $chat->title !== 'New Thread') {
                yield new StreamedEvent(
                    event: 'title-update',
                    data: json_encode(['title' => $chat->title])
                );

                return;
            }

            // Generate title immediately when stream is requested
            $this->generateTitleInBackground($chat);

            // Wait for title updates and stream them
            $startTime = time();
            $timeout = 30; // 30 second timeout

            while (time() - $startTime < $timeout) {
                // Refresh the chat model to get latest title
                $chat->refresh();

                // If title has changed from "Untitled", send it
                if ($chat->title !== 'New Thread') {
                    yield new StreamedEvent(
                        event: 'title-update',
                        data: json_encode(['title' => $chat->title])
                    );
                    break;
                }

                // Wait a bit before checking again
                usleep(1000000); // 1 second
            }
        }, endStreamWith: new StreamedEvent(event: 'title-update', data: '</stream>'));
    }

    private function generateTitleInBackground(Chat $chat)
    {
        // Get the first message
        $firstMessage = $chat->messages()->where('role', 'user')->first();

        if (! $firstMessage) {
            return;
        }

        try {
            $response = Prism::text()
                ->using(Provider::Gemini, Models::GEMINI_2_0_FLASH_LITE->value)
                ->withSystemPrompt('Generate a concise, descriptive title (max 50 characters) for a chat that starts with the following message. Respond with only the title, no quotes or extra formatting.')
                ->withPrompt($firstMessage->content)
                ->asText();

            $generatedTitle = trim($response->text);

            // Ensure title length
            if (strlen($generatedTitle) > 50) {
                $generatedTitle = substr($generatedTitle, 0, 47) . '...';
            }

            // Update the chat title
            $chat->update(['title' => $generatedTitle]);

            Log::info('Generated title for chat', ['chat_id' => $chat->id, 'title' => $generatedTitle]);
        } catch (\Exception $e) {
            // Fallback title on error
            $fallbackTitle = substr($firstMessage->content, 0, 47) . '...';
            $chat->update(['title' => $fallbackTitle]);
            Log::error('Error generating title, using fallback', ['error' => $e->getMessage()]);
        }

        Cache::forget('chats.' . user()->id);
    }
}
