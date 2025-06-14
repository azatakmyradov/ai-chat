<?php

use App\Enums\Models;
use App\Http\Controllers\BranchOffChatController;
use App\Http\Controllers\ChatAttachmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ChatTitleStreamController;
use Illuminate\Support\Facades\Route;
use Prism\Prism\Prism;
use Prism\Prism\ValueObjects\Messages\Support\Document;
use Prism\Prism\ValueObjects\Messages\UserMessage;

Route::redirect('/', '/chat')->name('home');
Route::redirect('/dashboard', '/chat')->name('dashboard');

Route::resource('chat', ChatController::class)
    ->only(['index', 'store', 'update', 'show', 'destroy'])
    ->middlewareFor(['index', 'store', 'update', 'destroy'], 'auth');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('/chat/{chat}/messages', ChatMessageController::class)
        ->only(['store']);

    Route::post('/chat/{chat}/messages/{message}', BranchOffChatController::class)
        ->name('chat.branch-off');

    Route::get('/chat/{chat}/title-stream', ChatTitleStreamController::class)
        ->name('chat.title-stream');

    Route::get('/attachments/{attachment}', [ChatAttachmentController::class, 'show'])
        ->name('attachments.show');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/test', function () {
    $message = new UserMessage('Explain and summarize the contents of the attached document', [
        Document::fromPath(
            path: '/Users/azatakmyradov/Downloads/EJ1172284.pdf',
        ),
    ]);

    $response = Prism::text()
        ->using('open-router', Models::GEMINI_2_0_FLASH->value)
        ->withSystemPrompt(view('prompts.system'))
        ->withMessages([
            $message
        ])
        ->asText();

    dd($response);
});
