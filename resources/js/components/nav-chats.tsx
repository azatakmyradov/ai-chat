import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Chat, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { GitBranchIcon, TrashIcon } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function NavChats({ chats = [] }: { chats: Chat[] }) {
    const page = usePage<SharedData>();

    if (chats.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Chat History</SidebarGroupLabel>
            <SidebarMenu>
                {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton asChild isActive={page.url.startsWith(`/chat/${chat.id}`)} tooltip={{ children: chat.title }}>
                            <Link
                                href={route('chat.show', { chat: chat.id })}
                                className="group/chat flex items-center justify-between"
                                prefetch="click"
                            >
                                <div className="flex items-center gap-2">
                                    {chat.branch_chat_id && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="group/branch"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            router.get(route('chat.show', { chat: chat.branch_chat_id }), {}, { prefetch: true });
                                                        }}
                                                    >
                                                        <GitBranchIcon className="h-4 w-4 text-gray-500 opacity-75 transition-all duration-300 group-hover/branch:text-primary group-hover/chat:opacity-100" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Branched from {chat.title}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    <span className="truncate">{chat.title}</span>
                                </div>
                                <DeleteChatButton chat={chat} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function DeleteChatButton({ chat }: { chat: Chat }) {
    const [open, setOpen] = useState(false);

    function handleDelete(event: MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        event.stopPropagation();
        setOpen(() => false);
        router.delete(route('chat.destroy', { chat: chat.id }));
    }

    return (
        <>
            <button
                className="rounded-md p-1 text-gray-500 opacity-0 group-hover/chat:opacity-100 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(() => true);
                }}
            >
                <TrashIcon className="ml-auto h-4 w-4" />
            </button>
            <DeleteConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                onConfirm={handleDelete}
                title="Delete Chat"
                description="Are you sure you want to delete this chat? This action cannot be undone."
            />
        </>
    );
}
