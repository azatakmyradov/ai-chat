import type { ChatMessage as ChatMessageType, Model } from '@/types';
import 'highlight.js/styles/obsidian.css';
import { ReactNode, useRef } from 'react';
import { Message } from './message';
import { ScrollArea } from './ui/scroll-area';

type Props = {
    messages: ChatMessageType[];
    children: ReactNode;
    isStreaming?: boolean;
    models?: Model[];
};

export function ChatMessages({ messages, children, isStreaming, models }: Props) {
    const lastMessageRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex-1 mx-auto mt-2 w-full min-h-[calc(100vh-16rem)]">
            <ScrollArea className="w-full h-[calc(100vh-16rem)]">
                <div className="flex flex-col gap-4 px-4 pb-32 mx-auto w-full max-w-3xl min-h-full">
                    {messages.map(
                        (message, index) =>
                            message.content.length > 0 && (
                                <div
                                    key={message.id}
                                    ref={index === messages.length - 1 ? lastMessageRef : undefined}
                                    className="min-h-[2rem]" // Ensure minimum height for each message
                                >
                                    <Message
                                        key={message.id}
                                        message={message}
                                        isStreaming={isStreaming && index === messages.length - 1}
                                        models={models}
                                    />
                                </div>
                            ),
                    )}
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
}
