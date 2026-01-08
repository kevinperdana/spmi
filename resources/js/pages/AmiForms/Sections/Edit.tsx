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

interface AmiFormSection {
    id: number;
    title: string;
    order: number;
}

interface Props {
    form: AmiForm;
    section: AmiFormSection;
}

export default function Edit({ form, section }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: section.title,
        order: section.order,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Form AMI', href: '/ami-forms' },
        { title: 'Sections', href: `/ami-forms/${form.id}/sections` },
        { title: 'Edit', href: `/ami-forms/${form.id}/sections/${section.id}/edit` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(`/ami-forms/${form.id}/sections/${section.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Section - ${form.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/ami-forms/${form.id}/sections/${section.id}/items`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Edit Section
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
                                Save Changes
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
