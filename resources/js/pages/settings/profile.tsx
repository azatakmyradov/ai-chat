import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

type ProfileForm = {
    name: string;
    email: string;
    openrouter_api_key: string | null;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        openrouter_api_key: auth.user.openrouter_api_key,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('openrouter_api_key', '');
            },
        });
    };

    const handleDeleteKey = () => {
        router.delete(route('profile.delete-key'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('openrouter_api_key', '');
            },
        });
    };

    return (
        <SettingsLayout>
            <Head title="Profile" />

            <div className="space-y-6">
                <HeadingSmall title="Profile information" description="Update your name and email address" />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            className="block mt-1 w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>

                        <Input
                            id="email"
                            type="email"
                            className="block mt-1 w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="openrouter_api_key">OpenRouter API key</Label>
                        <span className="text-xs text-muted-foreground">
                            This is used to authenticate with the OpenRouter API. You can find your API key{' '}
                            <a href="https://openrouter.ai/settings/api-keys" target="_blank" rel="noopener noreferrer">
                                here
                            </a>
                            .
                        </span>

                        {auth.user.openrouter_api_key === 'redacted' ? (
                            <>
                                <span className="text-xs text-green-500">Your key is set.</span>
                                <Button variant="outline" onClick={handleDeleteKey} className="mt-2" type="button">
                                    Delete key
                                </Button>
                            </>
                        ) : (
                            <Input
                                id="openrouter_api_key"
                                type="text"
                                className="block mt-1 w-full"
                                value={data.openrouter_api_key!}
                                onChange={(e) => setData('openrouter_api_key', e.target.value)}
                                autoComplete="openrouter_api_key"
                                placeholder="OpenRouter API key"
                            />
                        )}

                        <InputError className="mt-2" message={errors.openrouter_api_key} />
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div>
                            <p className="-mt-4 text-sm text-muted-foreground">
                                Your email address is unverified.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                >
                                    Click here to resend the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4 items-center">
                        <Button disabled={processing}>Save</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </SettingsLayout>
    );
}
