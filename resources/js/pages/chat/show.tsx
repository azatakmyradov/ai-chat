import SidebarTitleUpdater from '@/components/sidebar-title-updater';
import TitleGenerator from '@/components/title-generator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useLocalStorage from '@/hooks/useLocalStorage';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Model, type Chat, type Message } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useRef, useState } from 'react';

export default function Show({
    chat,
    messages: initialMessages,
    chats,
    models,
}: {
    chat: Chat;
    messages: Message[];
    chats: Chat[];
    models: Model[];
}) {
    const [streamedContent, setStreamedContent] = useState('');
    const [messages, setMessages] = useState(initialMessages);
    const [shouldGenerateTitle, setShouldGenerateTitle] = useState(false);
    const [shouldUpdateSidebar, setShouldUpdateSidebar] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(chat.title);
    const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', models[0]?.id || '');

    const { data, setData, post } = useForm({
        message: '',
        model: selectedModel,
    });

    useEffect(() => {
        if (chat && chat.title === 'New Thread' && streamedContent.length > 0) {
            setShouldGenerateTitle(true);
            setShouldUpdateSidebar(true);
        }
    }, [chat, streamedContent]);

    useEcho(`chat.${chat.id}`, 'AIResponseReceived', (e: { content: string; chunk: string; model: Model }) => {
        setStreamedContent(() => e.content);
        if (e.chunk === '</stream>') {
            setStreamedContent('');
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: new Date().toISOString(),
                    content: e.content,
                    role: 'assistant',
                    user_id: 1,
                    chat_id: Number(chat.id),
                    created_at: new Date(),
                    updated_at: new Date(),
                    model: e.model,
                },
            ]);
        }
    });

    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.message.trim()) {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: new Date().toISOString(),
                    content: data.message,
                    role: 'user',
                    user_id: 1,
                    chat_id: Number(chat.id),
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ]);
            setData('model', selectedModel);
            post(`/chat/${chat.id}/messages`, {
                preserveScroll: true,
                onSuccess: () => {
                    setData('message', '');
                },
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'New Chat',
            href: '/chat',
        },
        {
            title: currentTitle,
            href: `/chat/${chat.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} chats={chats}>
            <main className="flex flex-1 flex-col overflow-y-auto p-8">
                <Head title={currentTitle} />

                {shouldGenerateTitle && chat && (
                    <TitleGenerator
                        chatId={chat.id}
                        onTitleUpdate={(newTitle) => {
                            document.title = `${newTitle} - LaraChat`;
                            setCurrentTitle(newTitle);
                        }}
                        onComplete={() => {
                            setShouldGenerateTitle(false);
                        }}
                    />
                )}

                {/* Sidebar title updater - separate EventStream for sidebar */}
                {shouldUpdateSidebar && chat && (
                    <SidebarTitleUpdater
                        chatId={chat.id}
                        onComplete={() => {
                            setShouldUpdateSidebar(false);
                        }}
                    />
                )}

                <div className="mx-auto w-full max-w-4xl">
                    <div ref={messageContainerRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-32">
                        {messages.map(
                            (msg: Message) =>
                                msg.content.length > 0 && (
                                    <div
                                        key={msg.id}
                                        className={`max-w-xl rounded-xl p-4 ${
                                            msg.role === 'assistant' ? '' : 'self-end border border-border bg-muted/50 dark:bg-muted/30'
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap text-foreground">{msg.content}</div>
                                        <div className="text-xs text-muted-foreground">{msg.model?.name}</div>
                                    </div>
                                ),
                        )}
                        {streamedContent.length > 0 && (
                            <div className="max-w-xl self-start rounded-xl border border-border bg-muted/50 p-4 dark:bg-muted/30">
                                <div className="whitespace-pre-wrap text-foreground">{streamedContent}</div>
                            </div>
                        )}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="fixed right-0 bottom-0 left-0 border-t border-border bg-background/80 p-4 backdrop-blur-sm">
                    <div className="mx-auto w-full max-w-4xl px-8">
                        <div className="relative flex items-end gap-2">
                            <Textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Type your message..."
                                className="min-h-[80px] resize-none rounded-lg border bg-background pr-32 focus-visible:ring-1"
                            />
                            <div className="absolute right-2 bottom-2 flex items-center gap-2">
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
                                <Button type="submit" className="h-10 px-4">
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </AppLayout>
    );
}
