<?php

namespace App\Jobs;

use App\Events\AIChatResponseReceived;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Foundation\Queue\Queueable;
use Prism\Prism\Prism;

class AIStreamResponse
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $chat = Chat::first();
        $chatMessage = $chat->messages()->create([
            'user_id' => User::first(),
            'role' => 'assistant',
            'content' => '',
        ]);

        $content = '';

        $response = Prism::text()
            ->using('openai', 'gpt-4')
            ->withPrompt('Write me a poem')
            ->asStream();

        // Process each chunk as it arrives
        foreach ($response as $chunk) {
            $content .= $chunk->text;

            AIChatResponseReceived::dispatch($chat, $content, $chunk->text);

            if ($chunk->finishReason) {
                AIChatResponseReceived::dispatch($chat, $content, '</stream>');
            }
        }

        $chatMessage->update(['content' => $content]);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }
}
