import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    openrouter_api_key: string | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface ChatMessage {
    id: string;
    content: string;
    role: 'assistant' | 'user';
    user_id: number;
    chat_id: string;
    is_failed?: boolean;
    user?: User;
    chat?: Chat;
    model?: Model;
    attachments?: ChatMessageAttachment[];
}

export interface ChatMessageAttachment {
    id: string;
    file_name: string;
    file_path: string;
    type: 'image' | 'document' | 'text';
}

export interface Chat {
    id: string;
    title: string;
    user_id: number;
    is_public: boolean;
    messages?: ChatMessage[];
    branch_chat_id?: string;
    branchChat?: Chat;
    user?: string;
}

export interface ModelProvider {
    id: string;
    name: string;
}

export interface Model {
    id: string;
    name: string;
    description: string;
    provider: ModelProvider;
}
