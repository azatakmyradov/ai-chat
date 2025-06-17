import { ChatMessages } from '@/components/chat-messages';
import { Message } from '@/components/message';
import { SendMessageForm } from '@/components/send-message-form';
import SidebarTitleUpdater from '@/components/sidebar-title-updater';
import TitleGenerator from '@/components/title-generator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useLocalStorage from '@/hooks/useLocalStorage';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ChatMessage, Model, SharedData, SidebarChats, type Chat, type ChatMessage as ChatMessageType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Globe, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type PageProps = {
    chat: Chat;
    messages: ChatMessageType[];
    chats: SidebarChats;
    models: Model[];
    show_loading_indicator: boolean;
};

export default function Show({ chat, messages: initialMessages, chats, models, show_loading_indicator }: PageProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [shouldGenerateTitle, setShouldGenerateTitle] = useState(false);
    const [shouldUpdateSidebar, setShouldUpdateSidebar] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(chat.title);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModel] = useLocalStorage('selectedModel', models[0]?.id ?? '');
    const [streaming, setStreaming] = useState({
        content: '',
        model: selectedModel,
    });
    const [isPublic, setIsPublic] = useState(chat.is_public);

    const page = usePage<SharedData>();

    const isStreaming = streaming.content.length > 0;

    useEffect(() => {
        if (show_loading_indicator) {
            setIsGenerating(true);
        }
    }, [show_loading_indicator]);

    useEffect(() => {
        if (chat && chat.title === 'New Thread' && streaming.content.length > 0) {
            setShouldGenerateTitle(true);
            setShouldUpdateSidebar(true);
        }
    }, [chat, streaming.content]);

    useEcho(`chat.${chat.id}`, 'AIResponseReceived', ({ content, chunk, model }: { content: string; chunk: string; model: Model }) => {
        if (chunk.trim() === '') return;

        setStreaming(() => ({
            content: content,
            model: model.id,
        }));
    });

    useEcho(`chat.${chat.id}`, 'AIResponseCompleted', ({ message }: { message: ChatMessage }) => {
        setIsGenerating(false);
        setStreaming(() => ({ content: '', model: selectedModel }));
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    useEcho(`chat.${chat.id}`, 'AIResponseFailed', ({ message }: { message?: ChatMessage }) => {
        setIsGenerating(false);
        setStreaming(() => ({ content: '', model: selectedModel }));

        if (message) {
            setMessages((prevMessages) => [...prevMessages, message]);
        } else {
            toast.error('Failed to generate response');
        }
    });

    useEcho(`chat.${chat.id}`, 'UserMessageSent', ({ message }: { message: ChatMessage }) => {
        setIsGenerating(true);
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

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

    const handlePublicToggle = (checked: boolean) => {
        setIsPublic(checked);
        router.put(
            route('chat.update', { chat: chat.id }),
            { is_public: checked },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} chats={chats}>
            <div className="flex relative flex-col h-full">
                <Head title={currentTitle} />

                <div className="flex justify-between items-center py-2 px-4 mx-auto w-full max-w-3xl">
                    <div className="flex gap-2 items-center">
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
                    </div>

                    {page.props.auth.user && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex gap-2 items-center">
                                        <Switch id="public-toggle" checked={isPublic} onCheckedChange={handlePublicToggle} />
                                        <Label htmlFor="public-toggle" className="flex gap-1 items-center cursor-pointer">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-sm">Public</span>
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Make this chat visible to everyone</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Sidebar title updater - separate EventStream for sidebar */}
                {shouldUpdateSidebar && chat && (
                    <SidebarTitleUpdater
                        chatId={chat.id}
                        onComplete={() => {
                            setShouldUpdateSidebar(false);
                        }}
                    />
                )}

                <ChatMessages messages={messages} isStreaming={isStreaming} models={models}>
                    {streaming.content.length > 0 && (
                        <>
                            <Message
                                models={models}
                                message={{
                                    id: new Date().toISOString(),
                                    chat_id: chat.id,
                                    user_id: page.props.auth.user.id,
                                    role: 'assistant',
                                    content: streaming.content,
                                    model: models.find((model) => model.id === streaming.model) as Model,
                                }}
                                isStreaming={true}
                            />
                        </>
                    )}
                    {isGenerating && streaming.content.length === 0 && (
                        <div className="flex gap-2 items-center py-4 rounded-xl bg-background">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">AI is generating...</span>
                        </div>
                    )}
                </ChatMessages>

                {page.props.auth.user && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border bg-background md:left-64">
                        <SendMessageForm chat={chat} models={models} disabled={isGenerating} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
