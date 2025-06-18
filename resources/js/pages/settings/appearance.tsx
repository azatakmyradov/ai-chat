import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';

import SettingsLayout from '@/layouts/settings/layout';
import { Head } from '@inertiajs/react';

export default function Appearance() {
    return (
        <SettingsLayout>
            <Head title="Profile" />

            <div className="space-y-6">
                <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                <AppearanceTabs />
            </div>
        </SettingsLayout>
    );
}
