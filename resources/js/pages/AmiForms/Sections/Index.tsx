import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { FileText, FolderOpen, Plus, Trash2, Edit } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface AmiForm {
    id: number;
    title: string;
}

interface AmiFormSection {
    id: number;
    title: string;
    order: number;
    items_count: number;
}

interface Props {
    form: AmiForm;
    sections: AmiFormSection[];
}

export default function Index({ form, sections }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Form AMI', href: '/ami-forms' },
        { title: 'Sections', href: `/ami-forms/${form.id}/sections` },
    ];

    const handleDelete = (sectionId: number) => {
        if (!confirm('Delete this section?')) return;

        setDeletingId(sectionId);
        router.delete(`/ami-forms/${form.id}/sections/${sectionId}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sections - ${form.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Form Sections
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {form.title}
                        </p>
                    </div>
                    <Link href={`/ami-forms/${form.id}/sections/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Section
                        </Button>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="p-6">
                        {sections.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No sections yet. Create your first section!
                                </p>
                                <Link href={`/ami-forms/${form.id}/sections/create`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Section
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sections.map((section) => (
                                    <div
                                        key={section.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    {section.title}
                                                </h3>
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                                    <FileText className="mr-1 h-3 w-3" />
                                                    {section.items_count}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Order: {section.order}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/ami-forms/${form.id}/sections/${section.id}/items`}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                title="Manage items"
                                            >
                                                <FolderOpen className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/ami-forms/${form.id}/sections/${section.id}/edit`}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                title="Edit section"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(section.id)}
                                                disabled={deletingId === section.id}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                                                title="Delete section"
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
