import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import { memo } from 'react';
import Markdown from './markdown';

type Props = {
    message: ChatMessage;
    isStreaming?: boolean;
};

const MessageComponent = memo(function MessageComponent({ message, isStreaming }: Props) {
    return (
        <div
            className={cn(
                message.role === 'assistant' ? 'w-full rounded-xl' : 'ml-auto w-fit rounded-xl',
                message.role === 'assistant' ? 'bg-background' : 'self-end border border-border bg-muted/50 px-4 pt-2 pb-0.5 dark:bg-muted/30',
                isStreaming && 'min-h-[100px]',
            )}
        >
            <div
                className={cn(
                    'prose prose-sm w-full max-w-none break-words',
                    // Typography
                    'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:break-words prose-headings:text-foreground',
                    'prose-p:mt-0 prose-p:mb-2 prose-p:leading-7 prose-p:break-words prose-p:text-foreground',
                    'prose-pre:my-2 prose-pre:bg-muted/50 prose-pre:p-4',
                    'prose-code:rounded-md prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:break-words prose-code:text-foreground',
                    'prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-sm',
                    'prose-strong:font-semibold prose-strong:break-words prose-strong:text-foreground',
                    'prose-a:font-medium prose-a:break-words prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                    'prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:break-words prose-blockquote:text-muted-foreground prose-blockquote:italic',
                    'prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2',
                    'prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2',
                    // Lists
                    'prose-ul:list-inside prose-ul:list-disc prose-ul:space-y-2',
                    'prose-ol:list-inside prose-ol:list-decimal prose-ol:space-y-2',
                    'prose-li:leading-7 prose-li:break-words prose-li:text-foreground',
                    // Spacing
                    'prose-img:my-4 prose-img:rounded-lg',
                    'prose-hr:my-6 prose-hr:border-border',
                    // Custom styles for better readability
                    'prose-pre:rounded-lg prose-pre:border prose-pre:border-border',
                    'prose-code:text-wrap prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:before:content-none prose-pre:after:content-none',
                    // Prevent layout shifts during streaming and syntax highlighting
                    'prose-pre:min-h-[2.5rem] prose-pre:transition-all prose-pre:duration-200',
                    'prose-pre:overflow-x-auto prose-pre:whitespace-pre',
                    'prose-pre:code:min-h-[2.5rem] prose-pre:code:block',
                    isStreaming && 'prose-pre:min-h-[100px]',
                )}
            >
                <Markdown key={message.id} markdown={message.content} />
            </div>
            {message.model?.name && <div className="mt-2 text-xs text-muted-foreground">{message.model.name}</div>}
        </div>
    );
});

export { MessageComponent as Message };
