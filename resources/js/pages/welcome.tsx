import { login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Home, User, Menu, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DynamicHomeSection } from '@/components/DynamicHomeSection';

interface HomeSection {
    id: number;
    layout_type: string;
    section_type: string;
    background_color: string;
    content: {
        heading?: string;
        text?: string;
        image?: string;
        left?: { heading?: string; text?: string; image?: string };
        right?: { heading?: string; text?: string; image?: string };
    };
    order: number;
    is_active: boolean;
}

export default function Welcome({
    canRegister = true,
    homeSections = [],
}: {
    canRegister?: boolean;
    homeSections?: HomeSection[];
}) {
    const { auth, menuItems, brand } = usePage<SharedData>().props;
    const items = menuItems || [];
    const brandName = brand?.name || 'SPMI';
    const brandLogoUrl = brand?.logoUrl;
    const brandInitial = brandName.trim().charAt(0).toUpperCase() || 'S';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerHoverRef = useRef(false);
    const dropdownHoverRef = useRef(false);
    const menuAreaRef = useRef<HTMLDivElement | null>(null);
    const menuScrollRef = useRef<HTMLDivElement | null>(null);
    const menuItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const [dropdownPosition, setDropdownPosition] = useState<{ left: number; top: number } | null>(null);
    const [hasMenuOverflow, setHasMenuOverflow] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    
    const clearCloseTimeout = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const scheduleClose = () => {
        clearCloseTimeout();
        closeTimeoutRef.current = setTimeout(() => {
            if (!triggerHoverRef.current && !dropdownHoverRef.current) {
                setOpenDropdown(null);
                setDropdownPosition(null);
            }
        }, 400);
    };

    const handleTriggerEnter = (itemId: number) => {
        triggerHoverRef.current = true;
        clearCloseTimeout();
        setOpenDropdown(itemId);
        updateDropdownPosition(itemId);
    };

    const handleTriggerLeave = () => {
        triggerHoverRef.current = false;
        scheduleClose();
    };

    const handleDropdownEnter = () => {
        dropdownHoverRef.current = true;
        clearCloseTimeout();
    };

    const handleDropdownLeave = () => {
        dropdownHoverRef.current = false;
        scheduleClose();
    };

    const updateDropdownPosition = (itemId?: number | null) => {
        const targetId = itemId ?? openDropdown;
        if (!targetId) {
            setDropdownPosition(null);
            return;
        }

        const trigger = menuItemRefs.current[targetId];
        const container = menuAreaRef.current;
        if (!trigger || !container) {
            setDropdownPosition(null);
            return;
        }

        const triggerRect = trigger.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const dropdownWidth = 224;
        const offsetTop = 0;

        let left = triggerRect.left - containerRect.left;
        const maxLeft = containerRect.width - dropdownWidth;
        if (maxLeft < 0) {
            left = 0;
        } else {
            left = Math.min(Math.max(left, 0), maxLeft);
        }

        const top = triggerRect.bottom - containerRect.top + offsetTop;

        setDropdownPosition({ left, top });
    };

    const updateMenuScroll = () => {
        const el = menuScrollRef.current;
        if (!el) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }

        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        setHasMenuOverflow(el.scrollWidth > el.clientWidth + 1);
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
        if (openDropdown) {
            updateDropdownPosition(openDropdown);
        }
    };

    const scrollMenuBy = (offset: number) => {
        const el = menuScrollRef.current;
        if (!el) return;
        el.scrollBy({ left: offset, behavior: 'smooth' });
    };

    useEffect(() => {
        updateMenuScroll();

        const el = menuScrollRef.current;
        if (!el) return;

        const handleScroll = () => updateMenuScroll();
        el.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateMenuScroll);

        return () => {
            el.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateMenuScroll);
        };
    }, [items.length, openDropdown]);

    useEffect(() => {
        if (openDropdown) {
            updateDropdownPosition(openDropdown);
        }
    }, [openDropdown]);

    return (
        <>
            <Head title="SPMI STTI" />
            <div className="min-h-screen flex flex-col bg-gray-50">
                {/* Navbar */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 relative" ref={menuAreaRef}>
                            <div className="flex items-center flex-1 min-w-0">
                                <Link href="/" className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${brandLogoUrl ? 'bg-transparent' : 'bg-blue-600'}`}>
                                        {brandLogoUrl ? (
                                            <img
                                                src={brandLogoUrl}
                                                alt={brandName}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-xl">
                                                {brandInitial}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        {brandName}
                                    </span>
                                </Link>
                                
                                <div className="hidden md:flex ml-10 flex-1 min-w-0 items-center gap-1">
                                    {hasMenuOverflow ? (
                                        <button
                                            type="button"
                                            aria-label="Scroll menu left"
                                            onClick={() => scrollMenuBy(-240)}
                                            disabled={!canScrollLeft}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition ${
                                                canScrollLeft ? 'cursor-pointer hover:border-blue-200 hover:text-blue-600' : 'cursor-default opacity-40'
                                            }`}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                    ) : null}
                                    <div
                                        ref={menuScrollRef}
                                        className="menu-scroll flex flex-1 min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap"
                                    >
                                        <Link href="/" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap">
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
                                                        ref={(el) => {
                                                            menuItemRefs.current[item.id] = el;
                                                        }}
                                                        onMouseEnter={() => handleTriggerEnter(item.id)}
                                                        onMouseLeave={handleTriggerLeave}
                                                    >
                                                        <Link
                                                            href={itemUrl}
                                                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap"
                                                        >
                                                            {item.title}
                                                            <ChevronDown className="h-3 w-3 ml-1" />
                                                        </Link>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <Link 
                                                    key={item.id}
                                                    href={itemUrl}
                                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap"
                                                >
                                                    {item.title}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    {hasMenuOverflow ? (
                                        <button
                                            type="button"
                                            aria-label="Scroll menu right"
                                            onClick={() => scrollMenuBy(240)}
                                            disabled={!canScrollRight}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition ${
                                                canScrollRight ? 'cursor-pointer hover:border-blue-200 hover:text-blue-600' : 'cursor-default opacity-40'
                                            }`}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 flex-shrink-0">
                                {auth.user ? (
                                    <>
                                        <Link href="/dashboard" className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                            <User className="h-4 w-4 mr-2" />
                                            {auth.user.name}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                >
                                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                            {openDropdown && dropdownPosition ? (
                                <div
                                    className="absolute z-50 w-56"
                                    style={{ left: dropdownPosition.left, top: dropdownPosition.top }}
                                    onMouseEnter={handleDropdownEnter}
                                    onMouseLeave={handleDropdownLeave}
                                >
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                        {items
                                            .find((item) => item.id === openDropdown)
                                            ?.children?.map((child) => {
                                                const childUrl = child.page ? `/page/${child.page.slug}` : child.url || '#';
                                                return (
                                                    <Link
                                                        key={child.id}
                                                        href={childUrl}
                                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-normal break-words leading-snug"
                                                    >
                                                        {child.title}
                                                    </Link>
                                                );
                                            })}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    
                    {/* Mobile Menu Modal */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            {/* Backdrop */}
                            <div 
                                className="absolute inset-0 bg-black/50"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                            
                            {/* Modal Content */}
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
                                                href={login()}
                                                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Main Content - Dynamic Sections */}
                <div className="flex-1">
                    {homeSections && homeSections.length > 0 ? (
                        homeSections.map((section) => (
                            <DynamicHomeSection key={section.id} section={section} />
                        ))
                    ) : (
                        // Fallback content if no sections
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <main className="w-full">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">
                                            No content sections available yet.
                                        </p>
                                    </div>
                                </div>
                            </main>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Column 1: Logo & SPMI */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${brandLogoUrl ? 'bg-transparent' : 'bg-blue-600'}`}>
                                        {brandLogoUrl ? (
                                            <img
                                                src={brandLogoUrl}
                                                alt={brandName}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-xl">
                                                {brandInitial}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                        {brandName}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Sistem Penjaminan Mutu Internal<br />
                                    STT Indonesia Tanjung Pinang
                                </p>
                            </div>
                            
                            {/* Column 2: Informasi */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>Kontak Kami :</p>
                                    <p>0811-7002-638</p>
                                </div>
                            </div>
                            
                        </div>
                        
                        {/* Copyright */}
                        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                © {new Date().getFullYear()} {brandName} STT Indonesia Tanjung Pinang. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
