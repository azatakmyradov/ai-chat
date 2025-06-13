<?php

namespace App\Enums;

use Prism\Prism\Enums\Provider;

enum Models: string
{
    case GPT_4O_MINI = 'gpt-4o-mini';
    case GPT_4_1_NANO = 'gpt-4.1-nano';
    case O4_MINI = 'o4-mini';
    case O3_MINI = 'o3-mini';
    case CLAUDE_3_5_SONNET = 'claude-3-5-sonnet-20240620';
    case CLAUDE_3_7_SONNET = 'claude-3-7-sonnet-20250219';
    case CLAUDE_4_0_SONNET = 'claude-sonnet-4-20250514';
    case CLAUDE_4_0_OPUS = 'claude-opus-4-20250514';

    public static function getAvailableModels(): array
    {
        return array_map(
            fn (Models $model): array => $model->toArray(),
            self::cases()
        );
    }

    public function getName(): string
    {
        return match ($this) {
            self::GPT_4O_MINI => 'GPT-4o mini',
            self::GPT_4_1_NANO => 'GPT-4.1 Nano',
            self::O4_MINI => 'GPT o4 mini',
            self::O3_MINI => 'GPT o3 mini',
            self::CLAUDE_3_5_SONNET => 'Claude 3.5 Sonnet',
            self::CLAUDE_3_7_SONNET => 'Claude 3.7 Sonnet',
            self::CLAUDE_4_0_SONNET => 'Claude 4.0 Sonnet',
            self::CLAUDE_4_0_OPUS => 'Claude 4.0 Opus',
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
        };
    }

    public function getProvider(): Provider
    {
        return match ($this) {
            self::GPT_4O_MINI => Provider::OpenAI,
            self::GPT_4_1_NANO => Provider::OpenAI,
            self::O4_MINI => Provider::OpenAI,
            self::O3_MINI => Provider::OpenAI,
            self::CLAUDE_3_5_SONNET => Provider::Anthropic,
            self::CLAUDE_3_7_SONNET => Provider::Anthropic,
            self::CLAUDE_4_0_SONNET => Provider::Anthropic,
            self::CLAUDE_4_0_OPUS => Provider::Anthropic,
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->value,
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'provider' => $this->getProvider()->value,
        ];
    }
}
