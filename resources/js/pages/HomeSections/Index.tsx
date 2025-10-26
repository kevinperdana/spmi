import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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
    created_at: string;
    updated_at: string;
}

interface Props {
    sections: HomeSection[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home Sections',
        href: '/home-sections',
    },
];

export default function Index({ sections }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this section?')) {
            setDeletingId(id);
            router.delete(`/home-sections/${id}`, {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const getLayoutLabel = (layoutType: string) => {
        const labels: Record<string, string> = {
            'single': 'Single Column',
            'two-column': 'Two Columns',
            'two-column-reverse': 'Two Columns (Reverse)',
        };
        return labels[layoutType] || layoutType;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home Sections" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Home Page Sections
                    </h2>
                    <Link href="/home-sections/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Section
                        </Button>
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        {sections.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No sections yet. Create your first section!
                                </p>
                                <Link href="/home-sections/create">
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
                                        className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="cursor-move text-gray-400">
                                            <GripVertical className="h-5 w-5" />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    {section.content.heading || section.content.left?.heading || 'Untitled Section'}
                                                </h3>
                                                {section.is_active ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                        <EyeOff className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {getLayoutLabel(section.layout_type)}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {section.section_type}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <div className="flex items-center gap-1">
                                                    <div 
                                                        className="w-4 h-4 rounded border border-gray-300"
                                                        style={{ backgroundColor: section.background_color }}
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {section.background_color}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/home-sections/${section.id}/edit`}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(section.id)}
                                                disabled={deletingId === section.id}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
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
