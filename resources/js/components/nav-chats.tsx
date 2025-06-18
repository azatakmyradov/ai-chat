import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Chat, SharedData, SidebarChats } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { GitBranchIcon, MessageCircleIcon, TrashIcon } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function NavChats({ chats = {} as SidebarChats }: { chats: SidebarChats }) {
    const page = usePage<SharedData>();
    const { open } = useSidebar();

    if (Object.keys(chats).length === 0) {
        return null;
    }

    function getTitle(key: string) {
        switch (key) {
            case 'today':
                return 'Today';
            case 'yesterday':
                return 'Yesterday';
            case 'last_week':
                return 'Last Week';
            case 'last_month':
                return 'Last Month';
            case 'older':
                return 'Older';
            default:
                return key.charAt(0).toUpperCase() + key.slice(1);
        }
    }

    return (
        <SidebarGroup className="px-2 py-0">
            {Object.entries(chats).map(([key, chats]) => (
                <SidebarGroup key={key}>
                    <SidebarGroupLabel>{getTitle(key)}</SidebarGroupLabel>
                    <SidebarMenu>
                        {chats.map((chat) => (
                            <SidebarMenuItem key={chat.id}>
                                <SidebarMenuButton asChild isActive={page.url.startsWith(`/chat/${chat.id}`)}>
                                    <Link
                                        href={route('chat.show', { chat: chat.id })}
                                        className="group/chat flex items-center justify-between"
                                        preserveState={false}
                                        prefetch="mount"
                                        preserveScroll={true}
                                    >
                                        {open && (
                                            <div className="flex items-center gap-2 truncate">
                                                {chat.branch_chat_id && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="group/branch"
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        router.visit(route('chat.show', { chat: chat.branch_chat_id }), {
                                                                            preserveScroll: true,
                                                                        });
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
                                                <span>{chat.title}</span>
                                            </div>
                                        )}
                                        {!open && (
                                            <MessageCircleIcon className="h-4 w-4 text-gray-500 opacity-75 transition-all duration-300 group-hover/branch:text-primary group-hover/chat:opacity-100" />
                                        )}
                                        {open && <DeleteChatButton chat={chat} />}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
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
                className="rounded-md p-1 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(() => true);
                }}
            >
                <TrashIcon className="ml-auto h-4 w-4" />
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
