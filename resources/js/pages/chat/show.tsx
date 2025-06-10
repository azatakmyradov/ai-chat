import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type Chat, type Message } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useRef, useState } from 'react';

export default function Show({ chat, messages: initialMessages, chats }: { chat: Chat; messages: Message[]; chats: Chat[] }) {
    const [streamedContent, setStreamedContent] = useState('');
    const [messages, setMessages] = useState(initialMessages);

    const { data, setData, post } = useForm({
        message: '',
    });

    useEcho(`chat.${chat.id}`, 'AIResponseReceived', (e: { content: string; chunk: string }) => {
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
            post(`/chat/${chat.id}/messages`, {
                preserveScroll: true,
                onSuccess: () => {
                    setData('message', '');
                },
            });
        }
    };

    return (
        <AppLayout chats={chats}>
            <main className="flex flex-1 flex-col overflow-y-auto p-8">
                <Head title={chat.title || `Chat ${chat.id}`} />
                <h1 className="mb-4 text-2xl font-bold">{chat.title || `Chat ${chat.id}`}</h1>
                <div className="mx-auto w-full max-w-4xl">
                    <div ref={messageContainerRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-32">
                        {messages.map(
                            (msg: Message) =>
                                msg.content.length > 0 && (
                                    <div
                                        key={msg.id}
                                        className={`max-w-xl rounded-lg p-4 ${msg.role === 'assistant' ? 'self-start bg-blue-50' : 'self-end bg-green-50'}`}
                                    >
                                        <div className="mb-1 text-xs text-gray-500">
                                            {msg.role === 'assistant' ? 'Assistant' : msg.user?.name || 'User'}
                                        </div>
                                        <div>{msg.content}</div>
                                    </div>
                                ),
                        )}
                        {streamedContent.length > 0 && (
                            <div className={`max-w-xl self-start rounded-lg bg-blue-50 p-4`}>
                                <div className="mb-1 text-xs text-gray-500">Assistant</div>
                                <div>{streamedContent}</div>
                            </div>
                        )}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="fixed right-0 bottom-0 left-0 bg-transparent p-4">
                    <div className="mx-auto w-full max-w-4xl px-8">
                        <div className="relative flex items-end gap-2">
                            <Textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Type your message..."
                                className="min-h-[80px] resize-none rounded-lg border-3 border-muted bg-white/80 pr-24 backdrop-blur-sm focus-visible:ring-1"
                            />
                            <Button type="submit" className="absolute right-2 bottom-2 h-10 px-4">
                                Send
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </AppLayout>
    );
}
