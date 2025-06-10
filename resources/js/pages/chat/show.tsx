import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type Chat, type Message } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function Show({ chat, messages, chats }: { chat: Chat; messages: Message[]; chats: Chat[] }) {
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const content = inputRef.current?.value.trim();
        if (content) {
            router.post(
                `/chat/${chat.id}/messages`,
                { content },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (inputRef.current) inputRef.current.value = '';
                    },
                },
            );
        }
    };

    return (
        <AppLayout chats={chats}>
            <main className="flex flex-1 flex-col overflow-y-auto p-8">
                <Head title={chat.title || `Chat ${chat.id}`} />
                <h1 className="mb-4 text-2xl font-bold">{chat.title || `Chat ${chat.id}`}</h1>
                <div className="mx-auto w-full max-w-4xl">
                    <div ref={messageContainerRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-32">
                        {messages.map((msg: Message) => (
                            <div
                                key={msg.id}
                                className={`max-w-xl rounded-lg p-4 ${msg.role === 'assistant' ? 'self-start bg-blue-50' : 'self-end bg-green-50'}`}
                            >
                                <div className="mb-1 text-xs text-gray-500">{msg.role === 'assistant' ? 'Assistant' : msg.user?.name || 'User'}</div>
                                <div>{msg.content}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="fixed right-0 bottom-0 left-0 bg-transparent p-4">
                    <div className="mx-auto w-full max-w-4xl px-8">
                        <div className="relative flex items-end gap-2">
                            <Textarea
                                ref={inputRef}
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
