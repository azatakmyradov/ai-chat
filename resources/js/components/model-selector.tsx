import { cn } from '@/lib/utils';
import { Model } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Props = {
    selectedModel: string;
    models?: Model[];
    trigger: React.ReactNode;
    children?: React.ReactNode;
    onSelect: (model: Model) => void;
};

export function ModelSelector({ selectedModel, models, trigger, onSelect, children }: Props) {
    const modelsByProvider = models?.reduce(
        (acc, model) => {
            const provider = model.provider;
            if (!acc[provider.id]) {
                acc[provider.id] = {
                    name: provider.name,
                    models: [],
                };
            }
            acc[provider.id].models.push(model);
            return acc;
        },
        {} as Record<string, { name: string; models: Model[] }>,
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent>
                {children !== undefined && children}
                {modelsByProvider &&
                    Object.entries(modelsByProvider)
                        .filter(([providerId]) => providerId !== 'unknown')
                        .map(([providerId, { name: providerName, models: providerModels }]) => (
                            <DropdownMenuSub key={providerId}>
                                <DropdownMenuSubTrigger
                                    className={cn(providerId === selectedModel?.split('/')[0] && 'bg-accent text-accent-foreground')}
                                >
                                    {providerName}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {providerModels.map((model) => (
                                        <DropdownMenuItem
                                            key={model.id}
                                            onClick={() => onSelect(model)}
                                            className={cn(model.id === selectedModel && 'bg-accent text-accent-foreground')}
                                        >
                                            {model.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
