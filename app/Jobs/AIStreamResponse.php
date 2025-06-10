<?php

namespace App\Jobs;

use App\Events\AIChatResponseReceived;
use App\Events\AIResponseReceived;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Prism\Prism\Prism;
use Prism\Prism\ValueObjects\Messages\AssistantMessage;
use Prism\Prism\ValueObjects\Messages\UserMessage;

class AIStreamResponse implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Chat $chat, public string $message) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $content = '';

        $response = Prism::text()
            ->using('openai', 'gpt-4')
            ->withSystemPrompt(view('prompts.system'))
            ->withMessages($this->buildConversationHistory())
            ->asStream();

        // Process each chunk as it arrives
        foreach ($response as $chunk) {
            $content .= $chunk->text;

            AIResponseReceived::dispatch($this->chat, $content, $chunk->text);

            if ($chunk->finishReason) {
                $this->chat->messages()->create([
                    'user_id' => User::first(),
                    'role' => 'assistant',
                    'content' => $content,
                ]);
                AIResponseReceived::dispatch($this->chat, $content, '</stream>');
            }
        }
    }

    private function buildConversationHistory(): array
    {
        return $this->chat
            ->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn(ChatMessage $message): UserMessage|AssistantMessage => match ($message->role) {
                'user' => new UserMessage(content: $message->content ?? ''),
                'assistant' => new AssistantMessage(content: $message->content ?? ''),
            })
            ->toArray();
    }
}
