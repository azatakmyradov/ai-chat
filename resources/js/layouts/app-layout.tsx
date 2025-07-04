import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { SidebarChats, type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    chats?: SidebarChats;
}

export default ({ children, breadcrumbs, chats, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} chats={chats} {...props}>
        {children}
        <Toaster richColors />
    </AppLayoutTemplate>
);
