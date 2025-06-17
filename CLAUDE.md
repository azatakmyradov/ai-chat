# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI chat application built with Laravel + React, supporting multiple LLMs through OpenRouter. It features real-time chat with AI models, file attachments, chat branching, and web search capabilities.

## Key Architecture

### Backend (Laravel)
- **AI Integration**: Custom OpenRouter provider in `app/AI/OpenRouter/` implementing Prism PHP interfaces
- **Core Models**: 
  - `Chat` (UUID-based with branching support via `branch_chat_id`)
  - `ChatMessage` (supports attachments and streaming)
  - `User` (stores OpenRouter API keys)
- **Queue Jobs**: `AIStreamResponse` handles async AI responses with streaming
- **Events**: AI response lifecycle events (`AIResponseReceived`, `AIResponseCompleted`, `AIResponseFailed`)

### Frontend (React + Inertia.js)
- **Chat Interface**: `resources/js/pages/chat/show.tsx` handles real-time messaging with Laravel Echo
- **Components**: Modular UI with shadcn/ui components in `resources/js/components/ui/`
- **Streaming**: Real-time AI responses using Laravel Echo and Pusher
- **State Management**: Local storage for model selection, React state for chat state

### Real-time Features
- **Laravel Echo + Pusher**: Configured in `resources/js/app.tsx` for real-time updates
- **Laravel Horizon**: Queue worker for background AI processing
- **Streaming Responses**: AI responses stream in real-time to the frontend

## Development Commands

### Backend Development
```bash
# Start full development environment (includes Laravel server, Horizon, logs, and Vite)
composer dev

# Start with SSR support
composer dev:ssr

# Run tests
composer test
# or
php artisan test

# Run migrations
php artisan migrate

# Start individual services
php artisan serve          # Laravel server
php artisan horizon        # Queue worker
php artisan pail           # Log viewer
```

### Frontend Development
```bash
# Development server (included in composer dev)
npm run dev

# Build for production
npm run build

# Build with SSR
npm run build:ssr

# Code quality
npm run lint              # ESLint with auto-fix
npm run format           # Prettier formatting
npm run format:check     # Check formatting
npm run types           # TypeScript type checking
```

### Database
- Uses SQLite by default (`database/database.sqlite`)
- Factories available for `Chat`, `ChatMessage`, `User`, and `ChatMessageAttachment`
- Seeders in `database/seeders/`

## Code Patterns

### AI Integration
- Models enum in `app/Enums/Models.php` defines available AI models
- OpenRouter provider follows Prism PHP patterns for text, structured, embeddings, and streaming
- System prompts stored in `resources/views/prompts/system.blade.php`

### Chat Features
- **Branching**: Create new chats from existing messages via `BranchOffChatController`
- **Retry**: Regenerate AI responses with `RetryChatMessageController`
- **Attachments**: File uploads handled through `ChatAttachmentController`
- **Public Sharing**: Chats can be made public via `is_public` flag

### Frontend Conventions
- TypeScript throughout with strict typing in `resources/js/types/`
- Tailwind CSS with custom theme support
- React 19 with automatic JSX runtime
- shadcn/ui component library for consistent UI
- Inertia.js for seamless Laravel-React integration

## Testing
- Uses Pest PHP for backend testing
- Feature tests in `tests/Feature/` including auth and chat functionality
- Authentication tests cover registration, login, password reset, email verification