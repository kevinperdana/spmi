import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
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
    return (
        <div className="flex min-h-screen">
            {/* Left Section - Blue Background */}
            <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between" style={{ background: 'linear-gradient(to bottom right, #2563eb, #1e40af)' }}>
                <div>
                    <Link
                        href={home()}
                        className="flex items-center gap-3 text-white"
                    >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-2xl">S</span>
                        </div>
                        <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>SPMI</span>
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
                    © {new Date().getFullYear()} SPMI. All rights reserved.
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
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">S</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>SPMI</span>
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
