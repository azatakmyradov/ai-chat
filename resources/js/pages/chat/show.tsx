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
        if (e.chunk === '') return;

        setStreamedContent(() => e.content);
        if (e.chunk.trim() === '</stream>') {
            setStreamedContent(() => '');
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
            <main className="flex overflow-y-auto relative flex-col flex-1 h-full">
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

                <div className="flex-1 mx-auto mt-2 w-full">
                    <ScrollArea className="px-4 w-full h-[calc(100vh-13rem)]">
                        <div className="flex flex-col gap-4 pb-32 mx-auto w-full max-w-2xl">
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
                            <div className="self-start ml-4 max-w-xl rounded-xl">
                                {isGenerating && (
                                    <div className="pl-4 rounded-full border-4 border-blue-400 animate-spin size-8 border-t-transparent"></div>
                                )}
                            </div>

                            {streamedContent.length > 0 && (
                                <div className="self-start p-4 max-w-xl rounded-xl border border-border bg-muted/10 dark:bg-muted/30">
                                    <div className="whitespace-pre-wrap text-foreground">{streamedContent}</div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <form onSubmit={handleSubmit} className="px-4 mx-auto w-full max-w-2xl">
                    <div className="flex relative gap-2 items-end">
                        <Textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Type your message..."
                            className="pb-16 w-full rounded-lg border resize-none focus-visible:ring-1 min-h-[120px] bg-background"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex absolute right-2 bottom-2 flex-row-reverse gap-2 items-center">
                            <Button type="submit" className="px-4 h-10" size="icon" disabled={!data.message.trim()}>
                                <SendIcon className="w-4 h-4" />
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
