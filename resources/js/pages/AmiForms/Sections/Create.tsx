import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface AmiForm {
    id: number;
    title: string;
}

interface Props {
    form: AmiForm;
}

export default function Create({ form }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        order: null as number | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Form AMI', href: '/ami-forms' },
        { title: 'Sections', href: `/ami-forms/${form.id}/sections` },
        { title: 'Create', href: `/ami-forms/${form.id}/sections/create` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(`/ami-forms/${form.id}/sections`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Section - ${form.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/ami-forms/${form.id}/sections`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        New Section
                    </h2>
                </div>

                <div className="max-w-xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Section Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                placeholder="Standar Kompetensi Lulusan"
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order">Order</Label>
                            <Input
                                id="order"
                                type="number"
                                value={data.order ?? ''}
                                onChange={(event) =>
                                    setData('order', event.target.value === '' ? null : Number(event.target.value))
                                }
                                placeholder="0"
                            />
                            {errors.order && (
                                <p className="text-sm text-red-600">{errors.order}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                Save Section
                            </Button>
                            <Link href={`/ami-forms/${form.id}/sections`}>
                                <Button type="button" variant="ghost">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
