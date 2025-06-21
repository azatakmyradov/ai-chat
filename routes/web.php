<?php

use App\Http\Controllers\BranchOffChatController;
use App\Http\Controllers\ChatAttachmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ChatTitleStreamController;
use App\Http\Controllers\RetryChatMessageController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/chat')->name('home');
Route::redirect('/dashboard', '/chat')->name('dashboard');

Route::resource('chat', ChatController::class)
    ->only(['index', 'store', 'update', 'show', 'destroy'])
    ->middlewareFor(['index', 'store', 'update', 'destroy'], 'auth');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('/chat/{chat}/messages', ChatMessageController::class)
        ->only(['store']);

    Route::post('/chat/{chat}/messages/{message}/branch-off', BranchOffChatController::class)
        ->name('chat.branch-off');

    Route::post('/chat/{chat}/messages/{message}/retry', RetryChatMessageController::class)
        ->name('chat.retry-message');

    Route::get('/chat/{chat}/title-stream', ChatTitleStreamController::class)
        ->name('chat.title-stream');

    Route::get('/attachments/{attachment}', [ChatAttachmentController::class, 'show'])
        ->name('attachments.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
