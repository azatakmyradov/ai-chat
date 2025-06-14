import type { Message as MessageType } from '@/types';
import 'highlight.js/styles/obsidian.css';
import { ReactNode, useEffect, useRef } from 'react';
import { Message } from './message';
import { ScrollArea } from './ui/scroll-area';

type Props = {
    messages: MessageType[];
    children: ReactNode;
    isStreaming?: boolean;
};

export function ChatMessages({ messages, children, isStreaming }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Smooth scroll to bottom when new messages arrive or during streaming
    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollContainer = scrollRef.current;
        const shouldAutoScroll = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;

        if (shouldAutoScroll) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: isStreaming ? 'smooth' : 'auto',
            });
        }
    }, [messages, isStreaming]);

    return (
        <div className="mx-auto mt-2 w-full flex-1">
            <ScrollArea ref={scrollRef} className="h-[calc(100vh-13rem)] w-full">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-32">
                    {messages.map(
                        (message, index) =>
                            message.content.length > 0 && (
                                <div key={message.id} ref={index === messages.length - 1 ? lastMessageRef : undefined}>
                                    <Message message={message} isStreaming={isStreaming && index === messages.length - 1} />
                                </div>
                            ),
                    )}
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
}
