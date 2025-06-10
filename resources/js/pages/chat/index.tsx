import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FormEvent, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Index({ chats }: { chats: any[] }) {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        throw new Error('Function not implemented.');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} chats={chats}>
            <Head title="Dashboard" />
            <main className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                        <div className="mb-8 text-2xl font-medium text-muted-foreground">Select a chat to start messaging</div>
                        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                            <div className="relative flex items-end gap-2">
                                <Textarea
                                    ref={inputRef}
                                    placeholder="Type your message..."
                                    className="min-h-[80px] resize-none rounded-lg border-muted bg-background pr-24 focus-visible:ring-1"
                                />
                                <Button type="submit" className="absolute right-2 bottom-2 h-10 px-4">
                                    Send
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
