import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, Eye, EyeOff, FolderOpen } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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
    pages: Page[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pages',
        href: '/pages',
    },
];

export default function Index({ pages }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Pages Management
                    </h2>
                </div>

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                            {pages.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        No pages yet. Create your first page!
                                    </p>
                                    <Link href="/pages/create">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Page
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pages.map((page) => (
                                        <div
                                            key={page.id}
                                            className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                        {page.title}
                                                    </h3>
                                                    {page.is_published ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                            <EyeOff className="w-3 h-3 mr-1" />
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    /page/{page.slug}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {['audit-mutu-internal', 'sop', 'pedoman', 'kebijakan', 'dokumen-spmi'].includes(page.slug) && (
                                                    <Link
                                                        href={`/pages/${page.id}/document-sections`}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                        title="Manage document sections"
                                                    >
                                                        <FolderOpen className="h-5 w-5" />
                                                    </Link>
                                                )}
                                                {page.is_published && (
                                                    <a
                                                        href={`/page/${page.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
