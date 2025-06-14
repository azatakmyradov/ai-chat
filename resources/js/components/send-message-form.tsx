import useLocalStorage from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { Chat, Model, SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Globe, PaperclipIcon, SendIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { ModelSelector } from './model-selector';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

type Props = {
    chat?: Chat;
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
    const page = usePage<SharedData>();

    const { data, setData, post } = useForm<{
        message: string;
        model: string;
        attachments: File[];
        web_search: boolean;
    }>({
        message: '',
        model: selectedModel,
        attachments: [] as File[],
        web_search: false,
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

            if (!chat) {
                post(route('chat.store'), {
                    preserveState: false,
                    onSuccess: () => {
                        setData('message', '');
                        setData('attachments', []);
                        setSelectedFiles([]);
                    },
                });
                return;
            }

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

    if (!page.props.auth.user?.openrouter_api_key) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4">
                <div className="flex flex-col gap-2">
                    <p className="mb-4 text-center text-sm text-muted-foreground">
                        You need to set your OpenRouter API key in your profile to use this feature.
                    </p>
                </div>
            </div>
        );
    }

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
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
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
                                <PaperclipIcon className="size-4" />
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant={data.web_search ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setData('web_search', !data.web_search)}
                        >
                            <Globe className="size-4" />
                            <span className="hidden text-xs sm:block">Web Search</span>
                        </Button>
                        <ModelSelector
                            selectedModel={selectedModel}
                            models={models}
                            onSelect={(model) => {
                                setSelectedModel(model.id);
                                setData('model', model.id);
                            }}
                            trigger={
                                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                                    {models.find((m) => m.id === selectedModel)?.name ?? 'Select Model'}
                                </Button>
                            }
                        />
                    </div>
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
                    <div className="absolute right-2 bottom-2">
                        <Button type="submit" className="h-10 px-4" size="icon" disabled={!data.message.trim() && data.attachments.length === 0}>
                            <SendIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
