<?php

namespace App\Jobs;

use App\AI\OpenRouter\OpenRouter;
use App\Enums\Models;
use App\Events\AIResponseFailed;
use App\Events\AIResponseReceived;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Collection;
use Prism\Prism\Prism;
use Prism\Prism\ValueObjects\Messages\AssistantMessage;
use Prism\Prism\ValueObjects\Messages\Support\Image;
use Prism\Prism\ValueObjects\Messages\Support\Document;
use Prism\Prism\ValueObjects\Messages\Support\Text;
use Prism\Prism\ValueObjects\Messages\UserMessage;

class AIStreamResponse implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Chat $chat, public bool $webSearch, public Models $model)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $content = '';

        $apiKey = $this->chat->user->getRawOriginal('openrouter_api_key');

        if ($apiKey === null) {
            AIResponseFailed::dispatch($this->chat, null);

            return;
        }

        $response = Prism::text()
            ->using('open-router', $this->webSearch ? $this->model->value . ':online' : $this->model->value, [
                'api_key' => $apiKey,
            ])
            ->withSystemPrompt(view('prompts.system'))
            ->withMessages($this->buildConversationHistory())
            ->asStream();

        try {
            // Process each chunk as it arrives
            foreach ($response as $chunk) {
                $content .= $chunk->text;

                AIResponseReceived::dispatch($this->chat, $content, $chunk->text, $this->model->toArray());

                if ($chunk->finishReason) {
                    $this->createAssistantMessage($content);
                    AIResponseReceived::dispatch($this->chat, $content, '</stream>', $this->model->toArray());
                }
            }
        } catch (Exception) {
            if ($content) {
                $message = $this->createAssistantMessage($content, true);
            }

            AIResponseFailed::dispatch($this->chat, $message ?? null);
        }
    }

    private function createAssistantMessage(string $content, bool $isFailed = false): ChatMessage
    {
        return $this->chat->messages()->create([
            'user_id' => $this->chat->user_id,
            'role' => 'assistant',
            'content' => $content,
            'model' => $this->model->value,
            'is_failed' => $isFailed,
        ]);
    }

    private function buildConversationHistory(): array
    {
        return $this->chat
            ->messages()
            ->with(['attachments'])
            ->orderBy('created_at')
            ->get()
            ->map(fn(ChatMessage $message) => match ($message->role) {
                'user' => new UserMessage(
                    content: $message->content ?? '',
                    additionalContent: $this->buildAttachments($message->attachments),
                ),
                'assistant' => new AssistantMessage(content: $message->content ?? ''),
            })
            ->toArray();
    }

    private function buildAttachments(Collection $attachments): array
    {
        return $attachments->map(
            fn(ChatMessageAttachment $attachment) =>
            match ($attachment->type) {
                'image' => Image::fromPath(
                    path: storage_path('app/private/' . $attachment->file_path),
                ),
                'document' => Document::fromPath(
                    path: storage_path('app/private/' . $attachment->file_path),
                    title: $attachment->file_name,
                ),
                'text' => new Text(
                    'This is a contents of plain textfile attached to the message: ' . PHP_EOL . PHP_EOL .
                        file_get_contents(storage_path('app/private/' . $attachment->file_path)),
                ),
                default => throw new \Exception('Invalid attachment type'),
            }
        )->toArray();
    }
}
