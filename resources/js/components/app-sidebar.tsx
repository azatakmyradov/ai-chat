import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Chat, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import { NavChats } from './nav-chats';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'New Chat',
        href: '/chat',
        icon: Plus,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar({ chats: initialChats }: { chats: Chat[] }) {
    const [chats, setChats] = useState(initialChats);

    // Listen for title updates from EventStream
    useEffect(() => {
        const handleTitleUpdate = (event: CustomEvent) => {
            const { chatId, newTitle } = event.detail;

            // Update local state
            setChats((prevChats) => prevChats.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat)));
        };

        window.addEventListener('chatTitleUpdated', handleTitleUpdate as EventListener);

        return () => {
            window.removeEventListener('chatTitleUpdated', handleTitleUpdate as EventListener);
        };
    }, []);
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {chats && <NavChats chats={chats} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
