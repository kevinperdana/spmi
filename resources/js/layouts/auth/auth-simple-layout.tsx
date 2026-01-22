import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { brand } = usePage<SharedData>().props;
    const brandName = brand?.name || 'SPMI';
    const brandLogoUrl = brand?.logoUrl;
    const brandInitial = brandName.trim().charAt(0).toUpperCase() || 'S';

    return (
        <div className="flex min-h-screen">
            {/* Left Section - Blue Background */}
            <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between" style={{ background: 'linear-gradient(to bottom right, #2563eb, #1e40af)' }}>
                <div>
                    <Link
                        href={home()}
                        className="flex items-center gap-3 text-white"
                    >
                        <div
                            className="w-12 h-12 p-1 rounded-lg flex items-center justify-center bg-white"
                        >
                            {brandLogoUrl ? (
                                <img
                                    src={brandLogoUrl}
                                    alt={brandName}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-blue-600 font-bold text-2xl">{brandInitial}</span>
                            )}
                        </div>
                        <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {brandName}
                        </span>
                    </Link>
                </div>

                <div className="text-white space-y-6">
                    <h2 className="text-4xl font-bold leading-tight">
                        Sistem Penjaminan <br/>Mutu Internal
                    </h2>
                    <p className="text-blue-100 text-lg">
                        STT Indonesia Tanjung Pinang
                    </p>
                </div>

                <div className="text-blue-200 text-sm">
                    © {new Date().getFullYear()} {brandName}. All rights reserved.
                </div>
            </div>

            {/* Right Section - White Background with Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2"
                        >
                            <div
                            className="w-12 h-12 p-1 rounded-lg flex items-center justify-center bg-white"
                            >
                                {brandLogoUrl ? (
                                    <img
                                        src={brandLogoUrl}
                                        alt={brandName}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-2xl">{brandInitial}</span>
                                )}
                            </div>
                            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {brandName}
                            </span>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                            <p className="text-gray-600">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
