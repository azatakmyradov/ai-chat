<?php

namespace Database\Factories;

use App\Models\ChatMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatMessageAttachment>
 */
class ChatMessageAttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'file_name' => $this->faker->word . '.' . $this->faker->fileExtension(),
            'file_path' => $this->faker->imageUrl(),
            'chat_message_id' => ChatMessage::factory(),
        ];
    }
}
