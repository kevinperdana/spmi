import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface PageInfo {
    id: number;
    title: string;
}

interface QuestionnaireOption {
    id: number;
    label: string;
    order: number;
}

interface QuestionnaireFieldOption {
    id: number;
    label: string;
    order: number;
}

interface QuestionnaireField {
    id: number;
    type: 'input' | 'select' | 'text';
    label?: string | null;
    placeholder?: string | null;
    input_type?: string | null;
    content?: string | null;
    order: number;
    options: QuestionnaireFieldOption[];
}

interface QuestionnaireItem {
    id: number;
    section_id?: number | null;
    question: string;
    description?: string | null;
    type: 'checkbox' | 'radio';
    order: number;
    options: QuestionnaireOption[];
}

interface QuestionnaireSection {
    id: number;
    title: string;
    description?: string | null;
    order: number;
}

interface Props {
    page: PageInfo;
    fields: QuestionnaireField[];
    sections: QuestionnaireSection[];
    activeSectionId?: number | null;
    items: QuestionnaireItem[];
}

const typeLabel = (type: QuestionnaireItem['type']) =>
    type === 'checkbox' ? 'Checkbox (multi pilih)' : 'Radio (pilih satu)';

const fieldTypeLabel = (type: QuestionnaireField['type']) => {
    switch (type) {
        case 'input':
            return 'Field (Input)';
        case 'select':
            return 'Dropdown';
        default:
            return 'Teks';
    }
};

export default function Index({ page, fields, sections, activeSectionId, items }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingFieldId, setDeletingFieldId] = useState<number | null>(null);
    const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kuesioner', href: '/questionnaires' },
        { title: page.title, href: `/questionnaires/${page.id}/items` },
    ];

    const handleDelete = (itemId: number) => {
        if (!confirm('Hapus item kuesioner ini?')) return;

        setDeletingId(itemId);
        router.delete(`/questionnaires/${page.id}/items/${itemId}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const handleFieldDelete = (fieldId: number) => {
        if (!confirm('Hapus field ini?')) return;

        setDeletingFieldId(fieldId);
        router.delete(`/questionnaires/${page.id}/fields/${fieldId}`, {
            preserveScroll: true,
            onFinish: () => setDeletingFieldId(null),
        });
    };

    const handleSectionDelete = (sectionId: number) => {
        if (!confirm('Hapus section ini? Semua item di section akan terhapus.')) return;

        setDeletingSectionId(sectionId);
        router.delete(`/questionnaires/${page.id}/sections/${sectionId}`, {
            preserveScroll: true,
            onFinish: () => setDeletingSectionId(null),
        });
    };

    const hasSections = sections.length > 0;
    const activeSection = sections.find((section) => section.id === activeSectionId) || null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Item Kuesioner - ${page.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/questionnaires"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Item Kuesioner
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {page.title}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="p-6">
                        <div className="mb-8 space-y-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Form Awal & Petunjuk
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Kelola field seperti NIM, nama, dropdown, atau teks petunjuk.
                                    </p>
                                </div>
                                <Link href={`/questionnaires/${page.id}/fields/create`}>
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Field
                                    </Button>
                                </Link>
                            </div>

                            {fields.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Belum ada field. Tambahkan field pertama untuk form awal.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {fields.map((field) => (
                                        <div
                                            key={field.id}
                                            className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-neutral-800 md:flex-row md:items-start md:justify-between"
                                        >
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700/40">
                                                        {fieldTypeLabel(field.type)}
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700/40">
                                                        Order: {field.order}
                                                    </span>
                                                </div>
                                                {field.type === 'text' ? (
                                                    <div>
                                                        {field.label ? (
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {field.label}
                                                            </div>
                                                        ) : null}
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                                            {field.content}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            {field.label}
                                                        </div>
                                                        {field.placeholder ? (
                                                            <div className="text-xs text-gray-500">
                                                                Placeholder: {field.placeholder}
                                                            </div>
                                                        ) : null}
                                                        {field.type === 'select' && field.options.length ? (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {field.options.map((option) => (
                                                                    <span
                                                                        key={option.id}
                                                                        className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                                    >
                                                                        {option.label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/questionnaires/${page.id}/fields/${field.id}/edit`}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                    title="Edit field"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFieldDelete(field.id)}
                                                    disabled={deletingFieldId === field.id}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                                                    title="Hapus field"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-6 border-t border-gray-200 pt-6 dark:border-gray-700" />
                        <div className="mb-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Section Kuesioner
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Kelompokkan pertanyaan ke dalam tab di halaman publik.
                                </p>
                            </div>

                            {sections.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Belum ada section. Tambahkan section sebelum membuat item.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sections.map((section) => {
                                        const isActive = section.id === activeSectionId;
                                        return (
                                            <div
                                                key={section.id}
                                                className={`flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-start md:justify-between ${
                                                    isActive
                                                        ? 'border-blue-300 bg-blue-50/60 dark:border-blue-700/60 dark:bg-blue-900/20'
                                                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-neutral-800'
                                                }`}
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {section.title}
                                                    </div>
                                                    {section.description ? (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                                            {section.description}
                                                        </div>
                                                    ) : null}
                                                    <div className="text-xs text-gray-500">
                                                        Order: {section.order}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {isActive ? (
                                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            href={`/questionnaires/${page.id}/items?section=${section.id}`}
                                                            className="text-sm text-blue-600 hover:text-blue-700"
                                                        >
                                                            Pilih
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={`/questionnaires/${page.id}/sections/${section.id}/edit`}
                                                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                        title="Edit section"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSectionDelete(section.id)}
                                                        disabled={deletingSectionId === section.id}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                                                        title="Hapus section"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mb-6 border-t border-gray-200 pt-6 dark:border-gray-700" />
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Item Kuesioner{activeSection ? `: ${activeSection.title}` : ''}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Kelola pertanyaan dan opsi jawaban.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Link href={`/questionnaires/${page.id}/sections/create`}>
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Section
                                    </Button>
                                </Link>
                                {hasSections ? (
                                    <Link
                                        href={
                                            activeSectionId
                                                ? `/questionnaires/${page.id}/items/create?section=${activeSectionId}`
                                                : `/questionnaires/${page.id}/items/create`
                                        }
                                    >
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Item
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Item
                                    </Button>
                                )}
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {hasSections
                                        ? 'Belum ada item kuesioner di section ini. Tambahkan item pertama.'
                                        : 'Buat section terlebih dahulu sebelum menambah item.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-neutral-800 md:flex-row md:items-start md:justify-between"
                                    >
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {item.question}
                                                </h3>
                                                {item.description ? (
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {item.description}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700/40">
                                                    {typeLabel(item.type)}
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700/40">
                                                    Opsi: {item.options.length}
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700/40">
                                                    Order: {item.order}
                                                </span>
                                            </div>

                                            {item.options.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {item.options.map((option) => (
                                                        <span
                                                            key={option.id}
                                                            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                        >
                                                            {option.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/questionnaires/${page.id}/items/${item.id}/edit`}
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
                                                title="Hapus item"
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
