import { SendMessageForm } from '@/components/send-message-form';
import AppLayout from '@/layouts/app-layout';
import { Chat, Model, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Chat',
        href: '/chat',
    },
];

export default function Index({ chats, models }: { chats: Chat[]; models: Model[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs} chats={chats}>
            <Head title="New Chat" />
            <main className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                        <div className="mb-8 text-2xl font-medium text-muted-foreground">Select a chat to start messaging</div>
                        <SendMessageForm models={models} />
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
