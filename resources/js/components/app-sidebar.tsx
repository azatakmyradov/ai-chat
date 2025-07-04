import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, SidebarChats, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import { NavChats } from './nav-chats';

const mainNavItems: NavItem[] = [
    {
        title: 'New Chat',
        href: '/chat',
        icon: Plus,
    },
];

export function AppSidebar({ chats: initialChats }: { chats?: SidebarChats }) {
    const [chats, setChats] = useState<SidebarChats>(initialChats ?? ({} as SidebarChats));
    const props = usePage<SharedData>();

    // Listen for title updates from EventStream
    useEffect(() => {
        const handleTitleUpdate = (event: CustomEvent) => {
            const { chatId, newTitle } = event.detail;

            // Update local state
            setChats((prevChats) => {
                Object.entries(prevChats ?? {}).forEach(([key, chats]) => {
                    chats.forEach((chat) => {
                        if (chat.id === chatId) {
                            chat.title = newTitle;
                        }
                    });
                });

                return prevChats;
            });
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
                {props.props.auth.user ? (
                    <>
                        <NavMain items={mainNavItems} />
                        {chats && <NavChats chats={chats} />}
                    </>
                ) : null}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
