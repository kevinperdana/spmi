import { Head, Link, usePage } from '@inertiajs/react';
import { PageContentRenderer } from '@/components/PageContentRenderer';
import { type SharedData } from '@/types';
import { Home, FileText, Menu, X, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    is_published: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    page: Page;
}

export default function Show({ page }: Props) {
    const { auth, menuItems } = usePage<SharedData>().props;
    const items = menuItems || [];
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
    
    const handleMouseEnter = (itemId: number) => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setOpenDropdown(itemId);
    };
    
    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setOpenDropdown(null);
        }, 200);
        setHoverTimeout(timeout);
    };
    // Parse JSON content
    let pageContent: any = null;
    try {
        if (page.content) {
            // Handle both string and object content
            if (typeof page.content === 'string') {
                pageContent = JSON.parse(page.content);
            } else {
                pageContent = page.content as any;
            }
        }
    } catch (e) {
        console.error('Failed to parse page content:', e, page.content);
        // If parsing fails, treat as plain text
        pageContent = null;
    }
    return (
        <>
            <Head title={page.title} />

            <div className="min-h-screen bg-gray-50">
                {/* Navbar */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">S</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>SPMI</span>
                                </Link>
                                
                                <div className="hidden md:flex ml-10 space-x-4">
                                    <Link href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                        <Home className="h-4 w-4 mr-2" />
                                        Home
                                    </Link>
                                    {items.map((item) => {
                                        const hasChildren = item.children && item.children.length > 0;
                                        const itemUrl = item.page ? `/page/${item.page.slug}` : item.url || '#';
                                        
                                        if (hasChildren) {
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className="relative"
                                                    onMouseEnter={() => handleMouseEnter(item.id)}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    <Link
                                                        href={itemUrl}
                                                        className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        {item.title}
                                                        <ChevronDown className="h-3 w-3 ml-1" />
                                                    </Link>
                                                    {openDropdown === item.id && (
                                                        <div className="absolute top-full left-0 pt-2 w-56">
                                                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                                {item.children!.map(child => {
                                                                    const childUrl = child.page ? `/page/${child.page.slug}` : child.url || '#';
                                                                    return (
                                                                        <Link
                                                                            key={child.id}
                                                                            href={childUrl}
                                                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                        >
                                                                            {child.title}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        
                                        return (
                                            <Link 
                                                key={item.id}
                                                href={itemUrl}
                                                className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link href="/dashboard" className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                        <User className="h-4 w-4 mr-2" />
                                        {auth.user.name}
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                                    >
                                        Log in
                                    </Link>
                                )}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                >
                                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Menu Modal */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div 
                                className="absolute inset-0 bg-black/50"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Menu</h2>
                                    
                                    <div className="space-y-2">
                                        <Link
                                            href="/"
                                            className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Home className="h-5 w-5 mr-3" />
                                            <span className="font-medium">Home</span>
                                        </Link>
                                        {items.map((item) => {
                                            const itemUrl = item.page ? `/page/${item.page.slug}` : item.url || '#';
                                            return (
                                                <div key={item.id}>
                                                    <Link
                                                        href={itemUrl}
                                                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <FileText className="h-5 w-5 mr-3" />
                                                        <span className="font-medium">{item.title}</span>
                                                    </Link>
                                                    {item.children && item.children.map(child => {
                                                        const childUrl = child.page ? `/page/${child.page.slug}` : child.url || '#';
                                                        return (
                                                            <Link
                                                                key={child.id}
                                                                href={childUrl}
                                                                className="flex items-center px-4 py-2 pl-12 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <span>{child.title}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                        
                                        <div className="border-t border-gray-200 my-4" />
                                        
                                        {auth.user ? (
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <User className="h-5 w-5 mr-3" />
                                                <span className="font-medium">{auth.user.name}</span>
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/login"
                                                className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <span className="font-medium">Log in</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold">
                                {page.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {pageContent && (pageContent.rows || pageContent.sections) ? (
                            <PageContentRenderer content={pageContent} />
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                {page.content && !pageContent ? (
                                    /* Plain text fallback */
                                    <div className="prose max-w-none">
                                        <p className="whitespace-pre-wrap">{page.content}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No content available.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Column 1: Logo & SPMI */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">S</span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>SPMI</span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Sistem Penjaminan Mutu Internal<br />
                                    STT Indonesia Tanjung Pinang
                                </p>
                            </div>
                            
                            {/* Column 2: Informasi */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi</h3>
                                <div className="space-y-2">
                                    <Link href="#" className="block text-gray-600 hover:text-blue-600 text-sm">
                                        Kontak Kami
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Column 3: Data (Menu) */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Data</h3>
                                <div className="space-y-2">
                                    <Link href="/" className="block text-gray-600 hover:text-blue-600 text-sm">
                                        Home
                                    </Link>
                                    {menuItems.map((item) => {
                                        const itemUrl = item.page ? `/page/${item.page.slug}` : item.url || '#';
                                        return (
                                            <Link 
                                                key={item.id}
                                                href={itemUrl}
                                                className="block text-gray-600 hover:text-blue-600 text-sm"
                                            >
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        {/* Copyright */}
                        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                © 2025 SPMI STT Indonesia Tanjung Pinang. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
