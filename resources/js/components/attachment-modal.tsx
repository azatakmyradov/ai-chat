import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { ChatMessageAttachment } from '@/types';

type Props = {
    attachment: ChatMessageAttachment | null;
    onClose: () => void;
};

export function AttachmentModal({ attachment, onClose }: Props) {
    if (!attachment) return null;

    const attachmentUrl = route('attachments.show', { attachment: attachment.id });

    const renderContent = () => {
        switch (attachment.type) {
            case 'image':
                return <img src={attachmentUrl} alt={attachment.file_name} className="max-h-[80vh] w-auto object-contain" />;
            case 'document':
                return <iframe src={attachmentUrl} className="h-[80vh] w-full" title={attachment.file_name} />;
            case 'text':
                return <iframe src={attachmentUrl} className="h-[80vh] w-full" title={attachment.file_name} />;
            default:
                return <div>Unsupported attachment type</div>;
        }
    };

    return (
        <Dialog open={!!attachment} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-4xl">
                <div className="flex flex-col items-center justify-center">
                    <h3 className="mb-4 text-lg font-semibold">{attachment.file_name}</h3>
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
