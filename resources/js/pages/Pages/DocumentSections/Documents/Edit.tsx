import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    title: string;
    slug: string;
}

interface DocumentSection {
    id: number;
    title: string;
}

interface DocumentItem {
    id: number;
    title: string;
    description: string | null;
    file_label: string | null;
    file_url: string;
    order: number;
}

interface Props {
    page: Page;
    section: DocumentSection;
    document: DocumentItem;
}

const FILE_ACCEPT = '.pdf';

export default function Edit({ page, section, document }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: document.title,
        description: document.description || '',
        order: document.order,
        file: null as File | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: 'Document Sections', href: `/pages/${page.id}/document-sections` },
        { title: section.title, href: `/pages/${page.id}/document-sections/${section.id}/documents` },
        { title: 'Edit', href: `/pages/${page.id}/document-sections/${section.id}/documents/${document.id}/edit` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(`/pages/${page.id}/document-sections/${section.id}/documents/${document.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Document - ${section.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/pages/${page.id}/document-sections/${section.id}/documents`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Edit Document
                    </h2>
                </div>

                <div className="max-w-xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                placeholder="Document title"
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                placeholder="Short description (optional)"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
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

                        <div className="space-y-2">
                            <Label htmlFor="file">Replace File (optional)</Label>
                            <Input
                                id="file"
                                type="file"
                                accept={FILE_ACCEPT}
                                onChange={(event) =>
                                    setData('file', event.target.files?.[0] ?? null)
                                }
                            />
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <ExternalLink className="h-3 w-3" />
                                <a
                                    href={document.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                >
                                    View current file
                                </a>
                            </div>
                            <p className="text-xs text-gray-500">
                                Accepted type: PDF (max 50MB).
                            </p>
                            {errors.file && (
                                <p className="text-sm text-red-600">{errors.file}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                Save Changes
                            </Button>
                            <Link href={`/pages/${page.id}/document-sections/${section.id}/documents`}>
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
