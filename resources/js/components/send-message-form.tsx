import useLocalStorage from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { Chat, Model } from '@/types';
import { useForm } from '@inertiajs/react';
import { PaperclipIcon, SendIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

type Props = {
    chat: Chat;
    models: Model[];
};

const ACCEPTED_FILE_TYPES = {
    'text/*': ['.txt'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'],
    'application/pdf': ['.pdf'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function SendMessageForm({ chat, models }: Props) {
    const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', models[0]?.id ?? '');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const { data, setData, post } = useForm({
        message: '',
        model: selectedModel,
        attachments: [] as File[],
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate file types and sizes
        const validFiles = files.filter((file) => {
            const isValidType = Object.entries(ACCEPTED_FILE_TYPES).some(([mimeType, extensions]) => {
                if (mimeType === 'image/*') {
                    return file.type.startsWith('image/');
                } else if (mimeType === 'application/pdf') {
                    return file.type === 'application/pdf';
                } else if (mimeType === 'text/*') {
                    return file.type === 'text/plain';
                }
                return file.type === mimeType;
            });

            const isValidSize = file.size <= MAX_FILE_SIZE;

            if (!isValidType) {
                alert(`File type not supported: ${file.name}`);
            }
            if (!isValidSize) {
                alert(`File too large: ${file.name} (max 10MB)`);
            }

            return isValidType && isValidSize;
        });

        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setData('attachments', [...data.attachments, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.message.trim() || data.attachments.length > 0) {
            setData('model', selectedModel);
            post(`/chat/${chat.id}/messages`, {
                async: true,
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setData('message', '');
                    setData('attachments', []);
                    setSelectedFiles([]);
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-4">
            <div className="relative flex flex-col gap-2">
                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm">
                                <span className="max-w-[200px] truncate">{file.name}</span>
                                <button type="button" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">
                                    <XIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="relative flex items-end gap-2">
                    <Textarea
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        placeholder="Type your message..."
                        className={cn(
                            'min-h-[120px] w-full resize-none rounded-lg border bg-background pb-16 focus-visible:ring-1',
                            selectedFiles.length > 0 && 'pb-20',
                        )}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        autoFocus
                    />
                    <div className="absolute right-2 bottom-2 flex flex-row-reverse items-center gap-2">
                        <Button type="submit" className="h-10 px-4" size="icon" disabled={!data.message.trim() && data.attachments.length === 0}>
                            <SendIcon className="h-4 w-4" />
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept={Object.entries(ACCEPTED_FILE_TYPES)
                                    .map(([mimeType, extensions]) => [...extensions, mimeType].join(','))
                                    .join(',')}
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <PaperclipIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select
                            value={selectedModel}
                            onValueChange={(value) => {
                                setSelectedModel(() => value);
                                setData('model', value);
                            }}
                        >
                            <SelectTrigger className="h-10 w-[140px]">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </form>
    );
}
