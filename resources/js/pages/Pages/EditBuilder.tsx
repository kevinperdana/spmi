import { FormEventHandler, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { PageBuilderProvider, usePageBuilder } from '@/contexts/page-builder-context';
import { ElementPalette } from '@/components/page-builder/element-palette';
import { Canvas } from '@/components/page-builder/canvas';
import { PropertiesPanel } from '@/components/page-builder/properties-panel';

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

function EditPageForm({ page }: Props) {
    const { getContent } = usePageBuilder();
    const [data, setData] = useState({
        title: page.title,
        slug: page.slug,
        is_published: page.is_published,
        order: page.order,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const content = getContent();
        const submitData = {
            ...data,
            content: JSON.stringify(content),
        };

        router.put(`/pages/${page.id}`, submitData, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const generateSlug = () => {
        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setData({ ...data, slug });
    };

    return (
        <div className="flex flex-col h-screen">
            <Head title={`Edit ${page.title}`} />
            
            {/* Top Bar */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/pages"
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Page</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/pages">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Settings Bar */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-900 px-6 py-4">
                <div className="grid grid-cols-3 gap-4 max-w-6xl">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData({ ...data, title: e.target.value })}
                            onBlur={generateSlug}
                            required
                            placeholder="Page title"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            type="text"
                            value={data.slug}
                            onChange={(e) => setData({ ...data, slug: e.target.value })}
                            placeholder="page-url"
                            className="mt-1"
                        />
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex items-center">
                            <input
                                id="is_published"
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData({ ...data, is_published: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                            />
                            <Label htmlFor="is_published" className="ml-2 mb-0">Publish</Label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Builder Area - 3 Columns */}
            <div className="flex flex-1 overflow-hidden">
                <ElementPalette />
                <Canvas />
                <PropertiesPanel />
            </div>
        </div>
    );
}

export default function Edit({ page }: Props) {
    // Parse existing content
    let initialContent = null;
    if (page.content) {
        try {
            const parsed = JSON.parse(page.content);
            initialContent = parsed;
        } catch (e) {
            console.error('Failed to parse page content:', e);
        }
    }

    return (
        <PageBuilderProvider initialContent={initialContent}>
            <EditPageForm page={page} />
        </PageBuilderProvider>
    );
}
