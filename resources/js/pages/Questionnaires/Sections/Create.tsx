import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface PageInfo {
    id: number;
    title: string;
}

interface Props {
    page: PageInfo;
}

export default function Create({ page }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        order: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kuesioner', href: '/questionnaires' },
        { title: page.title, href: `/questionnaires/${page.id}/items` },
        { title: 'Tambah Section', href: `/questionnaires/${page.id}/sections/create` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(`/questionnaires/${page.id}/sections`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Section - ${page.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/questionnaires/${page.id}/items`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Tambah Section
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {page.title}
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Nama Section</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                placeholder="Contoh: Aspek Tangibles"
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi (opsional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                placeholder="Keterangan singkat section"
                                rows={4}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order">Urutan (opsional)</Label>
                            <Input
                                id="order"
                                type="number"
                                value={data.order}
                                onChange={(event) => setData('order', event.target.value)}
                                placeholder="Contoh: 1"
                            />
                            {errors.order && (
                                <p className="text-sm text-red-600">{errors.order}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Section'}
                            </Button>
                            <Button type="button" variant="ghost" asChild>
                                <Link href={`/questionnaires/${page.id}/items`}>Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
