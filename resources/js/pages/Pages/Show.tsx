import { Head, Link } from '@inertiajs/react';
import { BlockRenderer } from '@/components/page-builder/block-renderer';
import { PageContent } from '@/types/page-builder';

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
    // Parse JSON content
    let pageContent: PageContent | null = null;
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
    }
    return (
        <>
            <Head title={page.title} />

            <div className="min-h-screen bg-gray-50">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Link href="/">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 font-bold text-white shadow-md">
                                        S
                                    </div>
                                </Link>
                                <Link href="/">
                                    <span 
                                        className="text-xl font-bold text-gray-900"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        SPMI STT Indonesia Tanjung Pinang
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <div className="py-12">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <article className="bg-white rounded-lg shadow-sm p-8">
                            <header className="mb-8">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {page.title}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Last updated: {new Date(page.updated_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </header>

                            <div className="max-w-none">
                                {pageContent && pageContent.blocks && pageContent.blocks.length > 0 ? (
                                    <div>
                                        {pageContent.blocks.map((block) => (
                                            <BlockRenderer
                                                key={block.id}
                                                block={block}
                                                isEditing={false}
                                                selectedBlockId={null}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No content available.</p>
                                )}
                            </div>
                        </article>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-auto bg-gray-900 text-white py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p>&copy; 2024 SPMI STT Indonesia Tanjung Pinang. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
