import { MouseEvent, ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './alert-dialog';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (event: MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    children?: ReactNode;
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Delete Confirmation',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    children,
}: DeleteConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {children}
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="mt-0 text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 focus:ring-red-600 dark:hover:bg-red-800 dark:focus:ring-red-700"
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
