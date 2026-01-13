import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Eye, ListChecks, Plus, SquarePen, Trash2 } from 'lucide-react';

interface Questionnaire {
    id: number;
    title: string;
    slug: string;
    created_at: string;
}

interface Props {
    questionnaires: Questionnaire[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kuesioner', href: '/questionnaires' },
];

export default function Index({ questionnaires }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingSlugId, setEditingSlugId] = useState<number | null>(null);
    const [editingSlug, setEditingSlug] = useState('');
    const [savingId, setSavingId] = useState<number | null>(null);
    const [savingSlugId, setSavingSlugId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });
    const slugError = (errors as Record<string, string>).slug;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/questionnaires', {
            preserveScroll: true,
            onSuccess: () => reset('title'),
        });
    };

    const handleDelete = (questionnaireId: number) => {
        if (!confirm('Delete this questionnaire?')) return;
        setDeletingId(questionnaireId);
        router.delete(`/questionnaires/${questionnaireId}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const startEdit = (questionnaire: Questionnaire) => {
        setEditingId(questionnaire.id);
        setEditingTitle(questionnaire.title);
        setEditingSlugId(null);
        setEditingSlug('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTitle('');
    };

    const startSlugEdit = (questionnaire: Questionnaire) => {
        setEditingSlugId(questionnaire.id);
        setEditingSlug(questionnaire.slug);
        setEditingId(null);
        setEditingTitle('');
    };

    const cancelSlugEdit = () => {
        setEditingSlugId(null);
        setEditingSlug('');
    };

    const handleUpdate = (questionnaireId: number) => {
        const nextTitle = editingTitle.trim();
        if (!nextTitle) return;
        setSavingId(questionnaireId);
        router.patch(`/questionnaires/${questionnaireId}`, { title: nextTitle }, {
            preserveScroll: true,
            onFinish: () => {
                setSavingId(null);
                setEditingId(null);
                setEditingTitle('');
            },
        });
    };

    const handleSlugUpdate = (questionnaireId: number) => {
        const nextSlug = editingSlug.trim();
        if (!nextSlug) return;
        setSavingSlugId(questionnaireId);
        router.patch(`/questionnaires/${questionnaireId}`, { slug: nextSlug }, {
            preserveScroll: true,
            onFinish: () => {
                setSavingSlugId(null);
                setEditingSlugId(null);
                setEditingSlug('');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kuesioner" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Kuesioner
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kelola daftar kuesioner untuk layanan yang ingin dinilai.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="p-6">
                        <form
                            onSubmit={submit}
                            className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-neutral-900/40"
                        >
                            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Kuesioner</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(event) => setData('title', event.target.value)}
                                        placeholder="Contoh: Kuesioner Layanan Akademik & Umum"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Tambah Kuesioner'}
                                </Button>
                            </div>
                        </form>

                        {questionnaires.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                Belum ada kuesioner. Tambahkan kuesioner baru.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questionnaires.map((questionnaire) => (
                                    <div
                                        key={questionnaire.id}
                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-neutral-800 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            {editingId === questionnaire.id ? (
                                                <div className="space-y-2">
                                                    <Label htmlFor={`questionnaire-title-${questionnaire.id}`}>
                                                        Nama Kuesioner
                                                    </Label>
                                                    <Input
                                                        id={`questionnaire-title-${questionnaire.id}`}
                                                        value={editingTitle}
                                                        onChange={(event) => setEditingTitle(event.target.value)}
                                                        placeholder="Nama kuesioner"
                                                        className="w-full"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                        {questionnaire.title}
                                                    </div>
                                                    {editingSlugId === questionnaire.id ? (
                                                        <div className="mt-2 space-y-2">
                                                            <Label htmlFor={`questionnaire-slug-${questionnaire.id}`}>
                                                                Slug Halaman
                                                            </Label>
                                                            <Input
                                                                id={`questionnaire-slug-${questionnaire.id}`}
                                                                value={editingSlug}
                                                                onChange={(event) => setEditingSlug(event.target.value)}
                                                                placeholder="contoh: kuesioner-layanan"
                                                                className="w-full"
                                                            />
                                                            <p className="text-xs text-gray-500">
                                                                URL: /page/{editingSlug || 'slug-anda'}
                                                            </p>
                                                            {slugError && (
                                                                <p className="text-sm text-red-600">{slugError}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            /page/{questionnaire.slug}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {editingId === questionnaire.id ? (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleUpdate(questionnaire.id)}
                                                        disabled={savingId === questionnaire.id}
                                                    >
                                                        {savingId === questionnaire.id ? 'Menyimpan...' : 'Simpan'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={cancelEdit}
                                                        disabled={savingId === questionnaire.id}
                                                    >
                                                        Batal
                                                    </Button>
                                                </>
                                            ) : editingSlugId === questionnaire.id ? (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleSlugUpdate(questionnaire.id)}
                                                        disabled={savingSlugId === questionnaire.id}
                                                    >
                                                        {savingSlugId === questionnaire.id ? 'Menyimpan...' : 'Simpan Slug'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={cancelSlugEdit}
                                                        disabled={savingSlugId === questionnaire.id}
                                                    >
                                                        Batal
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button type="button" size="sm" variant="outline" asChild>
                                                        <Link href={`/questionnaires/${questionnaire.id}/items`}>
                                                            <ListChecks className="mr-2 h-4 w-4" />
                                                            Atur Kuesioner
                                                        </Link>
                                                    </Button>
                                                    <Button type="button" size="sm" variant="outline" asChild>
                                                        <Link href={`/questionnaires/${questionnaire.id}/responses`}>
                                                            <BarChart3 className="mr-2 h-4 w-4" />
                                                            Lihat Hasil Kuesioner
                                                        </Link>
                                                    </Button>
                                                    <a
                                                        href={`/page/${questionnaire.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button type="button" size="sm" variant="outline">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Lihat
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startEdit(questionnaire)}
                                                        disabled={editingSlugId !== null}
                                                    >
                                                        <SquarePen className="mr-2 h-4 w-4" />
                                                        Edit Nama
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startSlugEdit(questionnaire)}
                                                        disabled={editingId !== null || editingSlugId !== null}
                                                    >
                                                        <SquarePen className="mr-2 h-4 w-4" />
                                                        Edit Slug
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(questionnaire.id)}
                                                        disabled={deletingId === questionnaire.id}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                                                        {deletingId === questionnaire.id ? 'Menghapus...' : 'Hapus'}
                                                    </Button>
                                                </>
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
