import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Chat } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavChats({ chats = [] }: { chats: Chat[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton asChild isActive={page.url.startsWith(`/chat/${chat.id}`)} tooltip={{ children: chat.title }}>
                            <Link href={`/chat/${chat.id}`} prefetch>
                                <span>{chat.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
