import { FormEventHandler, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    is_published: boolean;
    order: number;
}

interface Props {
    page: Page;
}

export default function Edit({ page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pages',
            href: '/pages',
        },
        {
            title: 'Edit',
            href: `/pages/${page.id}/edit`,
        },
    ];
    const [data, setData] = useState({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        is_published: page.is_published,
        order: page.order,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/pages/${page.id}`, data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${page.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <Link
                        href="/pages"
                        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Pages
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border max-w-3xl">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Edit Page
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData({ ...data, title: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData({ ...data, slug: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        URL will be: /page/{data.slug}
                                    </p>
                                    {errors.slug && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData({ ...data, content: e.target.value })}
                                        rows={10}
                                        className="mt-1"
                                        placeholder="Enter your page content here..."
                                    />
                                    {errors.content && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="order">Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData({ ...data, order: parseInt(e.target.value) || 0 })}
                                        className="mt-1"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Lower numbers appear first in navigation
                                    </p>
                                    {errors.order && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.order}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="is_published"
                                        type="checkbox"
                                        checked={data.is_published}
                                        onChange={(e) => setData({ ...data, is_published: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-neutral-700 dark:ring-offset-neutral-800"
                                    />
                                    <Label htmlFor="is_published" className="ml-2 mb-0">
                                        Publish this page
                                    </Label>
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <Link href="/pages">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
