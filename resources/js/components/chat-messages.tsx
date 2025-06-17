import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, Model } from '@/types';
import { ReactNode, useRef } from 'react';
import { Message } from './message';

type Props = {
    messages: ChatMessageType[];
    children: ReactNode;
    isStreaming?: boolean;
    models?: Model[];
    className?: string;
};

export function ChatMessages({ messages, children, isStreaming, models, className }: Props) {
    const lastMessageRef = useRef<HTMLDivElement>(null);

    return (
        <div className={cn('mx-auto mt-2 w-full flex-1 overflow-y-auto', className)}>
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-4 pb-64">
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
        </div>
    );
}
