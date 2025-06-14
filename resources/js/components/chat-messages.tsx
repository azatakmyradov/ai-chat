import type { ChatMessage as ChatMessageType } from '@/types';
import 'highlight.js/styles/obsidian.css';
import { ReactNode, useEffect, useRef } from 'react';
import { Message } from './message';
import { ScrollArea } from './ui/scroll-area';

type Props = {
    messages: ChatMessageType[];
    children: ReactNode;
    isStreaming?: boolean;
};

export function ChatMessages({ messages, children, isStreaming }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    // Smooth scroll to bottom when new messages arrive or during streaming
    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollContainer = scrollRef.current;
        const isNewMessage = messages.length > prevMessagesLengthRef.current;
        const shouldAutoScroll =
            isNewMessage || // Always scroll on new message
            (isStreaming && scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100); // Scroll during streaming if near bottom

        if (shouldAutoScroll) {
            // Use requestAnimationFrame to ensure smooth scrolling
            requestAnimationFrame(() => {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: isStreaming ? 'smooth' : 'auto',
                });
            });
        }

        prevMessagesLengthRef.current = messages.length;
    }, [messages, isStreaming]);

    return (
        <div className="mx-auto mt-2 min-h-[calc(100vh-16rem)] w-full flex-1">
            <ScrollArea ref={scrollRef} className="h-[calc(100vh-16rem)] w-full">
                <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-4 pb-32">
                    {messages.map(
                        (message, index) =>
                            message.content.length > 0 && (
                                <div
                                    key={message.id}
                                    ref={index === messages.length - 1 ? lastMessageRef : undefined}
                                    className="min-h-[2rem]" // Ensure minimum height for each message
                                >
                                    <Message key={message.id} message={message} isStreaming={isStreaming && index === messages.length - 1} />
                                </div>
                            ),
                    )}
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
}
