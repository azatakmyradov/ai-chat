<?php

namespace App\Jobs;

use App\Enums\Models;
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
    public function __construct(public Chat $chat, public string $message, public Models $model) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $content = '';

        $response = Prism::text()
            ->using($this->model->getProvider(), $this->model->value)
            ->withSystemPrompt(view('prompts.system'))
            ->withMessages($this->buildConversationHistory())
            ->asStream();

        // Process each chunk as it arrives
        foreach ($response as $chunk) {
            $content .= $chunk->text;

            AIResponseReceived::dispatch($this->chat, $content, $chunk->text, $this->model->toArray());

            if ($chunk->finishReason) {
                $this->chat->messages()->create([
                    'user_id' => User::first(),
                    'role' => 'assistant',
                    'content' => $content,
                    'model' => $this->model->value,
                ]);
                AIResponseReceived::dispatch($this->chat, $content, '</stream>', $this->model->toArray());
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
