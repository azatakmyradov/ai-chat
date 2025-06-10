import { useEventStream } from '@laravel/stream-react';

interface TitleGeneratorProps {
    chatId: string;
    onTitleUpdate: (title: string, isStreaming?: boolean) => void;
    onComplete: () => void;
}

export default function TitleGenerator({ chatId, onTitleUpdate, onComplete }: TitleGeneratorProps) {
    // Use the useEventStream configuration
    const { message } = useEventStream(route('chat.title-stream', { chat: chatId }), {
        eventName: 'title-update',
        endSignal: '</stream>',
        onMessage: (event) => {
            try {
                const parsed = JSON.parse(event.data);

                if (parsed.title) {
                    onTitleUpdate(parsed.title, false);
                }
            } catch (error) {
                console.error('Error parsing title JSON:', error);
            }
        },
        onComplete: () => {
            onComplete();
        },
        onError: (error) => {
            console.error('Title generation error:', error);
            onComplete();
        },
    });

    // This component doesn't render anything
    return null;
}
