import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageContentRenderer } from '@/components/PageContentRenderer';
import AmiDocuments from '@/components/AmiDocuments';
import SopDocuments from '@/components/SopDocuments';
import KebijakanDocuments from '@/components/KebijakanDocuments';
import SpmiDocuments from '@/components/SpmiDocuments';
import QuestionnaireIntro from '@/components/QuestionnaireIntro';
import QuestionnaireItems from '@/components/QuestionnaireItems';
import { type SharedData } from '@/types';
import { Home, Menu, X, ChevronDown, User } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

interface Page {
    id: number;
    title: string;
    slug: string;
    layout_type?: string | null;
    content: string | null;
    is_published: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    page: Page;
    documentSections?: DocumentSection[];
    questionnaireItems?: QuestionnaireItem[];
    questionnaireFields?: QuestionnaireField[];
    questionnaireSections?: QuestionnaireSection[];
}

interface DocumentItem {
    id: number;
    doc_number?: string | null;
    title: string;
    description: string | null;
    file_label: string | null;
    download_url: string | null;
}

interface DocumentSection {
    id: number;
    title: string;
    documents: DocumentItem[];
}

interface QuestionnaireOption {
    id: number;
    label: string;
}

interface QuestionnaireItem {
    id: number;
    question: string;
    description?: string | null;
    type: 'checkbox' | 'radio';
    options: QuestionnaireOption[];
}

interface QuestionnaireFieldOption {
    id: number;
    label: string;
}

interface QuestionnaireField {
    id: number;
    type: 'input' | 'select' | 'text';
    label?: string | null;
    placeholder?: string | null;
    input_type?: string | null;
    content?: string | null;
    is_required?: boolean;
    options: QuestionnaireFieldOption[];
}

interface QuestionnaireSection {
    id: number;
    title: string;
    description?: string | null;
    items: QuestionnaireItem[];
}

export default function Show({
    page,
    documentSections = [],
    questionnaireItems = [],
    questionnaireFields = [],
    questionnaireSections = [],
}: Props) {
    const { auth, menuItems, brand } = usePage<SharedData>().props;
    const items = menuItems || [];
    const brandName = brand?.name || 'SPMI';
    const brandLogoUrl = brand?.logoUrl;
    const brandInitial = brandName.trim().charAt(0).toUpperCase() || 'S';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
    const [questionnaireSubmitting, setQuestionnaireSubmitting] = useState(false);
    const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);
    const questionnaireFormRef = useRef<HTMLFormElement>(null);
    
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

    const handleQuestionnaireSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        if (questionnaireSubmitting) return;

        setQuestionnaireSubmitting(true);
        setQuestionnaireSubmitted(false);

        const formData = new FormData(event.currentTarget);
        router.post(`/page/${page.slug}/responses`, formData, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setQuestionnaireSubmitting(false),
            onSuccess: () => {
                setQuestionnaireSubmitted(true);
                questionnaireFormRef.current?.reset();
            },
        });
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
    const isAmiPage = page.slug === 'audit-mutu-internal';
    const isSopPage = page.slug === 'sop' || page.slug === 'pedoman';
    const isKebijakanPage = page.slug === 'kebijakan';
    const isSpmiPage = page.slug === 'dokumen-spmi';
    const hasDocumentSections = (isAmiPage || isSopPage || isSpmiPage || isKebijakanPage) && documentSections.length > 0;
    const isQuestionnairePage = page.layout_type === 'kuesioner';

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
                                
                                <div className="hidden md:flex ml-10 space-x-1">
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
                                                    onMouseEnter={() => handleMouseEnter(item.id)}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    <Link
                                                        href={itemUrl}
                                                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap"
                                                    >
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
                                                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-normal break-words leading-snug"
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
                                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap"
                                            >
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
                            <h1 className="text-5xl md:text-6xl font-bold">
                                {page.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="py-0">
                    <div className="mx-auto max-w-full px-0 sm:px-0 lg:px-0">
                        {isQuestionnairePage ? (
                            <form ref={questionnaireFormRef} onSubmit={handleQuestionnaireSubmit}>
                                <QuestionnaireIntro title={page.title} fields={questionnaireFields} />
                                <QuestionnaireItems
                                    sections={questionnaireSections}
                                    items={questionnaireItems}
                                />
                                <section className="bg-slate-50 pb-12">
                                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                                        {questionnaireSubmitted ? (
                                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                Terima kasih, jawaban kuesioner sudah tersimpan.
                                            </div>
                                        ) : null}
                                        <button
                                            type="submit"
                                            disabled={questionnaireSubmitting}
                                            className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition ${
                                                questionnaireSubmitting
                                                    ? 'bg-blue-400'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {questionnaireSubmitting ? 'Mengirim...' : 'Kirim Kuesioner'}
                                        </button>
                                    </div>
                                </section>
                            </form>
                        ) : hasDocumentSections && isAmiPage ? (
                            <AmiDocuments label={page.title} sections={documentSections} />
                        ) : hasDocumentSections && isKebijakanPage ? (
                            <KebijakanDocuments sections={documentSections} label="KEBIJAKAN" />
                        ) : hasDocumentSections && isSopPage ? (
                            <SopDocuments
                                sections={documentSections}
                                label={page.slug === 'pedoman' ? 'PEDOMAN' : `DOKUMEN ${page.title.toUpperCase()}`}
                            />
                        ) : hasDocumentSections && isSpmiPage ? (
                            <SpmiDocuments sections={documentSections} />
                        ) : pageContent && (pageContent.rows || pageContent.sections) ? (
                            <PageContentRenderer content={pageContent} pageSlug={page.slug} />
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
                                © {new Date().getFullYear()} {brandName} STT Indonesia Tanjung Pinang. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
