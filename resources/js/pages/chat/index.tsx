import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useLocalStorage from '@/hooks/useLocalStorage';
import AppLayout from '@/layouts/app-layout';
import { Chat, Model, type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { SendIcon } from 'lucide-react';
import { useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Chat',
        href: '/chat',
    },
];

export default function Index({ chats, models }: { chats: Chat[]; models: Model[] }) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', models[0]?.id || '');

    const { data, setData, post, processing } = useForm({
        message: '',
        model: selectedModel,
    });

    function handleSubmit(event: React.FormEvent): void {
        event.preventDefault();
        setData('model', selectedModel);
        post(route('chat.store'), {
            onSuccess: () => {
                setData('message', '');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} chats={chats}>
            <Head title="New Chat" />
            <main className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                        <div className="mb-8 text-2xl font-medium text-muted-foreground">Select a chat to start messaging</div>
                        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl px-4">
                            <div className="relative flex items-end gap-2">
                                <Textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Type your message..."
                                    className="min-h-[120px] w-full resize-none rounded-lg border bg-background pb-16 focus-visible:ring-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="absolute right-2 bottom-2 flex flex-row-reverse items-center gap-2">
                                    <Button type="submit" className="h-10 px-4" size="icon" disabled={!data.message.trim()}>
                                        <SendIcon className="h-4 w-4" />
                                    </Button>
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
                        </form>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
