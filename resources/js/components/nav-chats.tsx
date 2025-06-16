import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Chat, SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { GitBranchIcon, TrashIcon } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function NavChats({ chats = [] }: { chats: Chat[] }) {
    const page = usePage<SharedData>();

    if (chats.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="py-0 px-2">
            <SidebarGroupLabel>Chat History</SidebarGroupLabel>
            <SidebarMenu>
                {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton asChild isActive={page.url.startsWith(`/chat/${chat.id}`)}>
                            <button
                                onClick={() => {
                                    router.visit(route('chat.show', { chat: chat.id }));
                                }}
                                className="flex justify-between items-center group/chat"
                            >
                                <div className="flex gap-2 items-center truncate">
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
                                                        <GitBranchIcon className="w-4 h-4 text-gray-500 opacity-75 transition-all duration-300 group-hover/branch:text-primary group-hover/chat:opacity-100" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p>Branched from {chat.title}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    <span>{chat.title}</span>
                                </div>
                                <DeleteChatButton chat={chat} />
                            </button>
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
        router.delete(route('chat.destroy', { chat: chat.id }), {
            preserveState: false,
        });
    }

    return (
        <div className="hidden group-hover/chat:block">
            <button
                className="p-1 text-gray-500 rounded-md dark:text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(() => true);
                }}
            >
                <TrashIcon className="ml-auto w-4 h-4" />
            </button>
            {createPortal(
                <DeleteConfirmationDialog
                    open={open}
                    onOpenChange={setOpen}
                    onConfirm={handleDelete}
                    title="Delete Chat"
                    description="Are you sure you want to delete this chat? This action cannot be undone."
                />,
                document.body,
            )}
        </div>
    );
}
