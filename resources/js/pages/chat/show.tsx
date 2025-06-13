import SidebarTitleUpdater from '@/components/sidebar-title-updater';
import TitleGenerator from '@/components/title-generator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useLocalStorage from '@/hooks/useLocalStorage';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Model, SharedData, type Chat, type Message } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { SendIcon } from 'lucide-react';
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
    const [isGenerating, setIsGenerating] = useState(false);

    const page = usePage<SharedData>();

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
                    user_id: page.props.auth.user.id,
                    chat_id: Number(chat.id),
                    created_at: new Date(),
                    updated_at: new Date(),
                    model: e.model,
                },
            ]);
        }
    });

    useEcho(`chat.${chat.id}`, 'UserMessageSent', (e: { message: string }) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: new Date().toISOString(),
                content: e.message,
                role: 'user',
                user_id: page.props.auth.user.id,
                chat_id: Number(chat.id),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    });

    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (streamedContent.length > 0 && isGenerating) {
            setIsGenerating(false);
        }
    }, [streamedContent]);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        if (data.message.trim()) {
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
            <main className="relative flex h-full flex-1 flex-col overflow-y-auto">
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

                <div className="mx-auto mt-2 w-full flex-1">
                    <ScrollArea className="h-[calc(100vh-13rem)] w-full px-4">
                        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-32">
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
                            <div className="ml-4 max-w-xl self-start rounded-xl">
                                {isGenerating && (
                                    <div className="size-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent pl-4"></div>
                                )}
                            </div>

                            {streamedContent.length > 0 && (
                                <div className="max-w-xl self-start rounded-xl border border-border bg-muted/50 p-4 dark:bg-muted/30">
                                    <div className="whitespace-pre-wrap text-foreground">{streamedContent}</div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

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
            </main>
        </AppLayout>
    );
}
