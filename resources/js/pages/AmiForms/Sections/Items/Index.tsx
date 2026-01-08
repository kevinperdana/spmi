import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface AmiForm {
    id: number;
    title: string;
}

interface AmiFormSection {
    id: number;
    title: string;
    order?: number;
}

interface AmiFormItem {
    id: number;
    code: string | null;
    indicator: string;
    satuan_unit: string;
    target_unit: string;
    capaian_unit: string;
    persentase_unit: string;
    order: number;
}

interface Props {
    form: AmiForm;
    section: AmiFormSection | null;
    items: AmiFormItem[];
}

const unitLabel = (unit: string) => {
    switch (unit) {
        case 'tersedia':
            return 'Tersedia';
        case 'persen':
            return '%';
        case 'ipk':
            return 'IPK';
        case 'tahun':
            return 'Tahun';
        case 'dokumen':
            return 'Dokumen';
        case 'dokumen_tersedia':
            return 'Dokumen Tersedia';
        case 'angka':
            return 'Angka';
        default:
            return unit;
    }
};

export default function Index({ form, section, items }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Form AMI', href: '/ami-forms' },
    ];

    const activeSection = section;

    const handleDelete = (itemId: number) => {
        if (!confirm('Delete this item?')) return;

        setDeletingId(itemId);
        if (!activeSection) return;
        router.delete(`/ami-forms/${form.id}/sections/${activeSection.id}/items/${itemId}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Items - ${activeSection?.title || form.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/ami-forms"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Items
                            </h2>
                        </div>
                    </div>
                    {activeSection ? (
                        <Link href={`/ami-forms/${form.id}/sections/${activeSection.id}/items/create`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Item
                            </Button>
                        </Link>
                    ) : null}
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="p-6">
                        {activeSection && items.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No items yet. Add your first indicator.
                                </p>
                                <Link href={`/ami-forms/${form.id}/sections/${activeSection.id}/items/create`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </Link>
                            </div>
                        ) : activeSection ? (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-neutral-800 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    {item.code ? `${item.code}. ` : ''}{item.indicator}
                                                </h3>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                Satuan: {unitLabel(item.satuan_unit)} · Target: {unitLabel(item.target_unit)} · Capaian: {unitLabel(item.capaian_unit)} · Persentase: {unitLabel(item.persentase_unit)}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Order: {item.order}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/ami-forms/${form.id}/sections/${activeSection.id}/items/${item.id}/edit`}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                title="Edit item"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                                                title="Delete item"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Belum ada item. Tambahkan item terlebih dahulu.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
