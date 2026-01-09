import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
}

interface DocumentSection {
    id: number;
    title: string;
}

interface Props {
    page: Page;
    section: DocumentSection;
}

const FILE_ACCEPT = '.pdf';

export default function Create({ page, section }: Props) {
    const isSop = page.slug === 'sop' || page.slug === 'pedoman';
    const isSpmi = page.slug === 'dokumen-spmi';
    const isAmi = page.slug === 'audit-mutu-internal';
    const { data, setData, post, processing, errors } = useForm({
        doc_number: '',
        title: '',
        description: '',
        order: null as number | null,
        file: null as File | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
        { title: 'Document Sections', href: `/pages/${page.id}/document-sections` },
        { title: section.title, href: `/pages/${page.id}/document-sections/${section.id}/documents` },
        { title: 'Create', href: `/pages/${page.id}/document-sections/${section.id}/documents/create` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(`/pages/${page.id}/document-sections/${section.id}/documents`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`New Document - ${section.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/pages/${page.id}/document-sections/${section.id}/documents`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        New Document
                    </h2>
                </div>

                <div className="max-w-xl">
                    <form onSubmit={submit} className="space-y-6">
                        {isSop && (
                            <div className="space-y-2">
                                <Label htmlFor="doc_number">No Dokumen</Label>
                                <Input
                                    id="doc_number"
                                    value={data.doc_number}
                                    onChange={(event) => setData('doc_number', event.target.value)}
                                    placeholder="AKD-001"
                                />
                                {errors.doc_number && (
                                    <p className="text-sm text-red-600">{errors.doc_number}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="title">{isSop || isSpmi ? 'Nama Dokumen' : 'Title'}</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                placeholder={isSop || isSpmi ? 'Nama Dokumen' : 'Document title'}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {isAmi && (
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
                        )}

                        {!isSpmi && (
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
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="file">File</Label>
                            <Input
                                id="file"
                                type="file"
                                accept={FILE_ACCEPT}
                                onChange={(event) =>
                                    setData('file', event.target.files?.[0] ?? null)
                                }
                            />
                            <p className="text-xs text-gray-500">
                                Accepted type: PDF (max 50MB).
                            </p>
                            {errors.file && (
                                <p className="text-sm text-red-600">{errors.file}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                Save Document
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
