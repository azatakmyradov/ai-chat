<?php

use App\Enums\Models;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ChatTitleStreamController;
use Illuminate\Support\Facades\Route;
use Prism\Prism\Enums\Provider;
use Prism\Prism\Prism;

Route::redirect('/', '/chat')->name('home');
Route::redirect('/dashboard', '/chat')->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('chat', ChatController::class)
        ->only(['index', 'store', 'show', 'destroy']);

    Route::resource('/chat/{chat}/messages', ChatMessageController::class)
        ->only(['store']);

    Route::get('/chat/{chat}/title-stream', ChatTitleStreamController::class)
        ->name('chat.title-stream');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::get('/test', function () {
    $response = Prism::text()
        ->using(Provider::Gemini, Models::GEMINI_2_0_FLASH->value)
        ->withPrompt('What is the stock price of Google right now?')
        // Enable search grounding
        ->withProviderOptions(['searchGrounding' => true])
        ->asText();
});
