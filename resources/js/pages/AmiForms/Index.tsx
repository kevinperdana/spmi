import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, FolderOpen, Plus, Trash2 } from 'lucide-react';

interface AmiForm {
    id: number;
    title: string;
    items_count?: number;
    created_at: string;
}

interface Props {
    forms: AmiForm[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Form AMI', href: '/ami-forms' },
];

export default function Index({ forms }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/ami-forms', {
            preserveScroll: true,
            onSuccess: () => reset('title'),
        });
    };

    const handleDelete = (formId: number) => {
        if (!confirm('Delete this form?')) return;
        setDeletingId(formId);
        router.delete(`/ami-forms/${formId}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form AMI" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Form AMI
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tambah daftar form AMI berdasarkan judul.
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
                                    <Label htmlFor="title">Judul Form</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(event) => setData('title', event.target.value)}
                                        placeholder="Contoh: Audit Mutu Internal 2024"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Tambah Form'}
                                </Button>
                            </div>
                        </form>

                        {forms.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                Belum ada form AMI. Tambahkan form baru.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {forms.map((form) => (
                                    <div
                                        key={form.id}
                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-neutral-800 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {form.title}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {`${form.items_count ?? 0} item`}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/ami-forms/${form.id}/sections`}>
                                                <Button type="button" size="sm" variant="outline">
                                                    <FolderOpen className="mr-2 h-4 w-4" />
                                                    Atur Form
                                                </Button>
                                            </Link>
                                            <Link href={`/ami-forms/${form.id}/results`}>
                                                <Button type="button" size="sm" variant="outline">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Lihat Hasil
                                                </Button>
                                            </Link>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(form.id)}
                                                disabled={deletingId === form.id}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                                                {deletingId === form.id ? 'Menghapus...' : 'Hapus'}
                                            </Button>
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
