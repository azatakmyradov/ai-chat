# AI-Chat

This is an AI chat application built with Laravel + React, supporting multiple LLMs through OpenRouter. It features real-time chat with AI models, file attachments, chat branching, and web search capabilities.

## Features

### Core Requirements

- [x] Chat with Various LLMs
- [x] Authentication & Sync
- [x] Browser Friendly
- [x] Easy to Try

### Bonus Features

- [x] Attachment Support
- [x] Syntax Highlighting
- [x] Resumable Streams
- [x] Chat Sharing
- [x] Bring Your Own Key
- [x] Chat Branching
- [x] Web Search
- [ ] Image Generation Support

---

## 🚀 Installation

### Prerequisites

- PHP >= 8.2
- Node.js >= 18
- Composer
- SQLite (default) or MySQL/Postgres
- (Optional) Docker & Docker Compose

### 1. Clone the repository

```bash
git clone <repo-url>
cd chat2
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Environment setup

- Copy `.env.example` to `.env` (create one if missing, see config files for required variables)
- Generate app key:

```bash
php artisan key:generate
```

- **Add your OpenRouter API key and Pusher credentials to `.env`:**
    - `OPENROUTER_API_KEY=your-openrouter-key`
    - `PUSHER_APP_KEY=your-pusher-key`
    - `PUSHER_APP_SECRET=your-pusher-secret`
    - `PUSHER_APP_ID=your-pusher-app-id`
    - `PUSHER_HOST=your-pusher-host` (if self-hosted)
    - `PUSHER_PORT=your-pusher-port` (if self-hosted)
- (Optional) Set up your OpenRouter API key in `.env` or via the UI

### 4. Database setup

- By default, uses SQLite:

```bash
touch database/database.sqlite
php artisan migrate
```

- For MySQL/Postgres, update `.env` and run migrations.

### 5. Start development servers

```bash
# All-in-one (Laravel, Horizon, logs, Vite)
composer dev

# Or run separately
php artisan serve      # Laravel backend
php artisan horizon    # Queue worker
npm run dev            # Frontend
```

### 6. (Optional) Docker

```bash
docker-compose up --build
```

---

- Frontend: TypeScript strict mode, ESLint, Prettier

```bash
npm run lint
npm run format:check
npm run types
```

---

## 🗂️ Code Structure & Conventions

- **Backend**: Laravel, custom AI provider in `app/AI/OpenRouter/`, events, jobs, policies, and models for chat, message, user, and attachments.
- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Inertia.js, modular components in `resources/js/components/`.
- **Real-time**: Laravel Echo + Pusher for streaming AI responses.
- **Database**: Factories and seeders in `database/`, SQLite by default.
- **Testing**: Pest for backend, strict typing and linting for frontend.

---

## 🤝 Contributing

Pull requests and issues are welcome! Please follow code style and best practices.

## 📄 License

This is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
