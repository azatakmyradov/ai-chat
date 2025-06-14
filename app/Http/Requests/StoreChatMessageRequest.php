<?php

namespace App\Http\Requests;

use App\Enums\Models;
use App\Models\ChatMessageAttachment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreChatMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string'],
            'model' => ['required', 'string', Rule::in(array_column(Models::getAvailableModels(), 'id'))],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => [
                'file',
                File::types(array_keys(ChatMessageAttachment::getMimeTypes()))
                    ->max(10 * 1024),
            ],
        ];
    }
}
