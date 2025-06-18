<?php

namespace App\Enums;

enum Models: string
{
    case GPT_4O_MINI = 'openai/gpt-4o-mini';
    case GPT_4_1_NANO = 'openai/gpt-4.1-nano';
    case O4_MINI = 'openai/o4-mini';
    case O3_MINI = 'openai/o3-mini';
    case CLAUDE_3_5_SONNET = 'anthropic/claude-3.5-sonnet';
    case CLAUDE_3_7_SONNET = 'anthropic/claude-3.7-sonnet';
    case CLAUDE_4_0_SONNET = 'anthropic/claude-sonnet-4';
    case CLAUDE_4_0_OPUS = 'anthropic/claude-opus-4';
    case GEMINI_2_0_FLASH_LITE = 'google/gemini-2.0-flash-lite-001';
    case GEMINI_2_0_FLASH = 'google/gemini-2.0-flash-001';
    case GEMINI_2_5_PRO = 'google/gemini-2.5-pro';
    case GEMINI_2_5_FLASH = 'google/gemini-2.5-flash';
    case UNKNOWN = 'unknown';

    public static function getAvailableModels(): array
    {
        return array_map(
            fn(Models $model): array => $model->toArray(),
            self::cases()
        );
    }

    public function getName(): string
    {
        return match ($this) {
            self::GPT_4O_MINI => '4o mini',
            self::GPT_4_1_NANO => '4.1 Nano',
            self::O4_MINI => 'o4 mini',
            self::O3_MINI => 'o3 mini',
            self::CLAUDE_3_5_SONNET => 'Claude 3.5 Sonnet',
            self::CLAUDE_3_7_SONNET => 'Claude 3.7 Sonnet',
            self::CLAUDE_4_0_SONNET => 'Claude 4.0 Sonnet',
            self::CLAUDE_4_0_OPUS => 'Claude 4.0 Opus',
            self::GEMINI_2_0_FLASH_LITE => 'Gemini 2.0 Flash Lite',
            self::GEMINI_2_0_FLASH => 'Gemini 2.0 Flash',
            self::GEMINI_2_5_PRO => 'Gemini 2.5 Pro',
            self::GEMINI_2_5_FLASH => 'Gemini 2.5 Flash',
            self::UNKNOWN => 'Unknown',
        };
    }

    public function getDescription(): string
    {
        return match ($this) {
            self::GPT_4O_MINI => 'Cheapest model, best for smarter tasks',
            self::GPT_4_1_NANO => 'Cheapest model, best for simpler tasks',
            self::O4_MINI => 'Reasoning model, best for complex tasks',
            self::O3_MINI => 'Reasoning model, best for complex tasks',
            self::CLAUDE_3_5_SONNET => 'High level of intelligence and capability',
            self::CLAUDE_3_7_SONNET => 'High intelligence with toggleable extended thinking',
            self::CLAUDE_4_0_SONNET => 'High intelligence and balanced performanc',
            self::CLAUDE_4_0_OPUS => 'Highest level of intelligence and capability',
            self::GEMINI_2_0_FLASH_LITE => 'Gemini 2.0 Flash Lite',
            self::GEMINI_2_0_FLASH => 'Gemini 2.0 Flash',
            self::GEMINI_2_5_PRO => 'Gemini 2.5 Pro',
            self::GEMINI_2_5_FLASH => 'Gemini 2.5 Flash',
            self::UNKNOWN => 'Unknown',
        };
    }

    public function getProvider(): array
    {
        $providers = [
            'openai' => 'OpenAI',
            'anthropic' => 'Anthropic',
            'google' => 'Google',
        ];

        $providerId = explode('/', $this->value)[0];

        return [
            'id' => $providerId ?? 'unknown',
            'name' => $providers[$providerId] ?? 'Unknown',
        ];
    }

    public function toArray(): array
    {
        return [
            'id' => $this->value,
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'provider' => $this->getProvider(),
        ];
    }
}
