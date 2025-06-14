import { ChatMessages } from '@/components/chat-messages';
import { Message } from '@/components/message';
import { SendMessageForm } from '@/components/send-message-form';
import SidebarTitleUpdater from '@/components/sidebar-title-updater';
import TitleGenerator from '@/components/title-generator';
import useLocalStorage from '@/hooks/useLocalStorage';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Model, SharedData, type Chat, type Message as MessageType } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useRef, useState } from 'react';

type PageProps = {
    chat: Chat;
    messages: MessageType[];
    chats: Chat[];
    models: Model[];
    first_message: boolean;
};

export default function Show({ chat, messages: initialMessages, chats, models, first_message }: PageProps) {
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

    const page = usePage<SharedData>();

    const isStreaming = streaming.content.length > 0;

    useEffect(() => {
        if (first_message) {
            setIsGenerating(true);
        }
    }, [first_message]);

    useEffect(() => {
        if (chat && chat.title === 'New Thread' && streaming.content.length > 0) {
            setShouldGenerateTitle(true);
            setShouldUpdateSidebar(true);
        }
    }, [chat, streaming.content]);

    useEcho(`chat.${chat.id}`, 'AIResponseReceived', ({ content, chunk, model }: { content: string; chunk: string; model: Model }) => {
        if (chunk.trim() === '') return;

        setStreaming(() => ({
            content,
            model: model.id,
        }));

        if (chunk.trim() === '</stream>') {
            setStreaming(() => ({ content: '', model: selectedModel }));
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: new Date().toISOString(),
                    role: 'assistant',
                    user_id: page.props.auth.user.id,
                    chat_id: chat.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                    model,
                    content,
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
                chat_id: chat.id,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    });

    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (streaming.content.length > 0 && isGenerating) {
            setIsGenerating(false);
        }
    }, [isGenerating, streaming.content]);

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

                <ChatMessages messages={messages} isStreaming={isStreaming}>
                    <div className="mt-4 ml-4 max-w-xl self-start rounded-xl">
                        {isGenerating && messages[messages.length - 1]?.role === 'user' && (
                            <div className="size-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent pl-4"></div>
                        )}
                    </div>

                    {streaming.content.length > 0 && (
                        <Message
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
                    )}
                </ChatMessages>

                <SendMessageForm chat={chat} models={models} />
            </main>
        </AppLayout>
    );
}
