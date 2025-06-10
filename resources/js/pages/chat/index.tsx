import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Index({ chats }: { chats: any[] }) {
    // useEcho(`chat.${chat.id}`, 'AIChatResponseReceived', (e) => console.log(e.message));

    return (
        <AppLayout breadcrumbs={breadcrumbs} chats={chats}>
            <Head title="Dashboard" />
            <main className="flex flex-1 items-center justify-center">
                <div className="text-2xl text-muted-foreground">Select a chat to start messaging</div>
            </main>
        </AppLayout>
    );
}
