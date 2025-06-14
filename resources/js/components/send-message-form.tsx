import useLocalStorage from '@/hooks/useLocalStorage';
import { Chat, Model } from '@/types';
import { useForm } from '@inertiajs/react';
import { SendIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

type Props = {
    chat: Chat;
    models: Model[];
    onMessageSend: () => void;
};

export function SendMessageForm({ chat, models, onMessageSend }: Props) {
    const [selectedModel, setSelectedModel] = useLocalStorage('selectedModel', models[0]?.id ?? '');

    const { data, setData, post } = useForm({
        message: '',
        model: selectedModel,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.message.trim()) {
            onMessageSend();
            setData('model', selectedModel);
            post(`/chat/${chat.id}/messages`, {
                async: true,
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setData('message', '');
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-4">
            <div className="relative flex items-end gap-2">
                <Textarea
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[120px] w-full resize-none rounded-lg border bg-background pb-16 focus-visible:ring-1"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    autoFocus
                />
                <div className="absolute right-2 bottom-2 flex flex-row-reverse items-center gap-2">
                    <Button type="submit" className="h-10 px-4" size="icon" disabled={!data.message.trim()}>
                        <SendIcon className="h-4 w-4" />
                    </Button>
                    <Select
                        value={selectedModel}
                        onValueChange={(value) => {
                            setSelectedModel(() => value);
                            setData('model', value);
                        }}
                    >
                        <SelectTrigger className="h-10 w-[140px]">
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </form>
    );
}
