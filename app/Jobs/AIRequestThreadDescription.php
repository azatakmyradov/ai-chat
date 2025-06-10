<?php

namespace App\Jobs;

use App\Models\Chat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Prism\Prism\Prism;

class AIRequestThreadDescription implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Chat $chat, public string $message)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $response = Prism::text()
            ->using('openai', 'gpt-4')
            ->withSystemPrompt('You are a helpful assistant that creates a title for a chat thread.')
            ->withPrompt('Create a title for the following chat thread: ' . $this->message)
            ->asText();

        $this->chat->update(['title' => $response->text]);
    }
}
