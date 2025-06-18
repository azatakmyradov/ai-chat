import { cn } from '@/lib/utils';
import type { ChatMessage, ChatMessageAttachment, Model } from '@/types';
import { router } from '@inertiajs/react';
import { Check, Copy, FileIcon, GitBranchIcon, ImageIcon, RefreshCcw } from 'lucide-react';
import { memo, useState } from 'react';
import { AttachmentModal } from './attachment-modal';
import { ModelSelector } from './model-selector';
import { DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type Props = {
    message: ChatMessage;
    models?: Model[];
};

const MessageComponent = memo(function MessageComponent({ message, models }: Props) {
    const [selectedAttachment, setSelectedAttachment] = useState<ChatMessageAttachment | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const copyMessage = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            setIsCopied(false);
        }
    };

    const renderAttachmentIcon = (type: ChatMessageAttachment['type']) => {
        switch (type) {
            case 'image':
                return <ImageIcon className="h-4 w-4" />;
            default:
                return <FileIcon className="h-4 w-4" />;
        }
    };

    function handleRetry(model: Model): void {
        router.post(
            route('chat.retry-message', { chat: message.chat_id, message: message.id }),
            {
                model: model.id,
            },
            {
                preserveState: false,
            },
        );
    }

    return (
        <>
            <div
                className={cn(
                    message.role === 'assistant' ? 'w-full rounded-xl' : 'ml-auto w-fit rounded-xl',
                    message.role === 'assistant' ? 'bg-background' : 'self-end border border-border bg-muted/50 dark:bg-muted/30',
                    'group/message relative px-4 pt-2 pb-0.5',
                )}
            >
                <div
                    className={cn(
                        'prose prose-sm w-full max-w-none break-words',
                        // Code
                        'prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:text-foreground prose-pre:my-2',
                        // Typography
                        'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:break-words prose-headings:text-foreground',
                        'prose-p:mt-0 prose-p:mb-2 prose-p:leading-7 prose-p:break-words prose-p:text-foreground',
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
                    )}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                />
                {message.attachments && message.attachments.length > 0 && (
                    <div className="my-2 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                            <button
                                key={attachment.id}
                                onClick={() => setSelectedAttachment(attachment)}
                                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                            >
                                {renderAttachmentIcon(attachment.type)}
                                {attachment.file_name}
                            </button>
                        ))}
                    </div>
                )}
                {message.role === 'assistant' && (
                    <div className="flex w-full flex-row items-center justify-start gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 rounded-md border border-transparent bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted"
                                        title="Copy message"
                                        onClick={copyMessage}
                                    >
                                        {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Copy message</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 rounded-md border border-transparent bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted"
                                        title="Branch off"
                                        onClick={() =>
                                            router.post(
                                                route('chat.branch-off', { chat: message.chat_id, message: message.id }),
                                                {},
                                                {
                                                    preserveState: false,
                                                },
                                            )
                                        }
                                    >
                                        <GitBranchIcon className="h-3.5 w-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Branch off</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {message.model !== undefined && message.role === 'assistant' && (
                                        <ModelSelector
                                            selectedModel={message.model?.id}
                                            models={models}
                                            onSelect={handleRetry}
                                            trigger={
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1.5 rounded-md border border-transparent bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted"
                                                    title="Retry message"
                                                >
                                                    <RefreshCcw className="h-3.5 w-3.5" />
                                                </button>
                                            }
                                        >
                                            <DropdownMenuItem onClick={() => handleRetry(message.model as Model)}>
                                                <RefreshCcw className="h-3.5 w-3.5" />
                                                Retry same model
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </ModelSelector>
                                    )}
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Retry message</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="text-xs text-muted-foreground">{message.model?.name}</div>
                    </div>
                )}
                {message.is_failed && <div className="mt-2 text-xs text-red-500">Something went wrong while generating the response</div>}
            </div>
            <AttachmentModal attachment={selectedAttachment} onClose={() => setSelectedAttachment(null)} />
        </>
    );
});

export { MessageComponent as Message };
