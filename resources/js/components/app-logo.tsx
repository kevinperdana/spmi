import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { brand } = usePage<SharedData>().props;
    const brandName = brand?.name || 'SPMI';
    const brandLogoUrl = brand?.logoUrl;

    return (
        <>
            <div
                className={`flex aspect-square size-8 items-center justify-center rounded-md ${
                    brandLogoUrl
                        ? 'bg-transparent overflow-hidden'
                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                }`}
            >
                {brandLogoUrl ? (
                    <img
                        src={brandLogoUrl}
                        alt={brandName}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {brandName}
                </span>
            </div>
        </>
    );
}
