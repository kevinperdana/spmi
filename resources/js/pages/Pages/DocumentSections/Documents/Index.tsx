import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, Edit, ArrowLeft, ExternalLink } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    title: string;
    slug: string;
}

interface DocumentSection {
    id: number;
    title: string;
}

interface DocumentItem {
    id: number;
    doc_number: string | null;
    title: string;
    description: string | null;
    file_label: string | null;
    file_url: string;
    order: number;
}

interface Props {
    page: Page;
    section: DocumentSection;
    documents: DocumentItem[];
}

export default function Index({ page, section, documents }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const isSop = page.slug === 'sop';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: 'Document Sections', href: `/pages/${page.id}/document-sections` },
        { title: section.title, href: `/pages/${page.id}/document-sections/${section.id}/documents` },
    ];

    const handleDelete = (documentId: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        setDeletingId(documentId);
        router.delete(`/pages/${page.id}/document-sections/${section.id}/documents/${documentId}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Documents - ${section.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/pages/${page.id}/document-sections`}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Documents
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {section.title}
                        </p>
                    </div>
                    <Link href={`/pages/${page.id}/document-sections/${section.id}/documents/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New File
                        </Button>
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        {documents.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No documents yet. Add your first file.
                                </p>
                                <Link href={`/pages/${page.id}/document-sections/${section.id}/documents/create`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Document
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((document) => (
                                    <div
                                        key={document.id}
                                        className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    {document.title}
                                                </h3>
                                                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 text-xs font-medium">
                                                    <FileText className="mr-1 h-3 w-3" />
                                                    PDF
                                                </span>
                                            </div>
                                            {document.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {document.description}
                                                </p>
                                            )}
                                            {isSop && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    No Dokumen: {document.doc_number || '-'}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <a
                                                    href={document.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View file
                                                </a>
                                                <span className="text-xs text-gray-500">
                                                    Order: {document.order}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/pages/${page.id}/document-sections/${section.id}/documents/${document.id}/edit`}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                title="Edit document"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(document.id)}
                                                disabled={deletingId === document.id}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                                                title="Delete document"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
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
