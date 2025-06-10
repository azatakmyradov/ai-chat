<?php

use App\Http\Controllers\ChatMessageController;
use App\Models\Chat;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/chat', function () {
        return inertia('chat/show', [
            'chat' => Chat::first(),
        ]);
    });

    Route::resource('/chat/{chat}/messages', ChatMessageController::class)
        ->only(['store']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
