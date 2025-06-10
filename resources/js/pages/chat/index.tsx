import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useLocalStorage from '@/hooks/useLocalStorage';
import AppLayout from '@/layouts/app-layout';
import { Chat, Model, type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

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

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
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
                        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                            <div className="relative flex items-end gap-2">
                                <Textarea
                                    ref={inputRef}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Type your message..."
                                    className="min-h-[80px] resize-none rounded-lg border-muted bg-background pr-32 focus-visible:ring-1"
                                />
                                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                                    <Select value={selectedModel} onValueChange={setSelectedModel}>
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
                                    <Button type="submit" className="h-10 px-4" disabled={processing}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
