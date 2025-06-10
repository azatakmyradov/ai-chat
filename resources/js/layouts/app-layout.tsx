import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Chat, type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    chats?: Chat[];
}

export default ({ children, breadcrumbs, chats, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} chats={chats} {...props}>
        {children}
    </AppLayoutTemplate>
);
