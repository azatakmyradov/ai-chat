<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatAttachmentController extends Controller
{
    public function show(Request $request, string $attachmentId): StreamedResponse
    {
        $attachment = ChatMessageAttachment::findOrFail($attachmentId);
        $message = ChatMessage::findOrFail($attachment->chat_message_id);

        // Check if the user has access to this attachment
        if ($message->chat->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to attachment');
        }

        // Get the file path from storage
        $path = $attachment->file_path;
        if (!Storage::exists($path)) {
            abort(404, 'Attachment not found');
        }

        // Stream the file with appropriate headers
        return Storage::response($path, $attachment->file_name, [
            'Content-Type' => Storage::mimeType($path),
            'Content-Disposition' => 'inline',
        ]);
    }
}
