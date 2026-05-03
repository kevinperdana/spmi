import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Copy, ExternalLink, FileText, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DocumentItem {
    id: number;
    title: string;
    display_name: string;
    file_path: string;
    file_url: string;
    short_url_key: string | null;
    short_url: string | null;
    short_url_path: string | null;
    mime_type: string | null;
    size: number;
    source: string;
}

interface Props {
    documents: DocumentItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Docs Management', href: '/docs-management' },
];

const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getCsrfToken = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') || '';

export default function Index({ documents: initialDocuments }: Props) {
    const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCopyUrl = async (url: string, key: string) => {
        const fullUrl = url.startsWith('http')
            ? url
            : `${window.location.origin}${url}`;

        try {
            await navigator.clipboard.writeText(fullUrl);
        } catch {
            const tempInput = document.createElement('textarea');
            tempInput.value = fullUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }

        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 1500);
    };

    const handleRename = async (doc: DocumentItem) => {
        const nextTitle = window.prompt('Nama dokumen baru', doc.title || '');
        if (nextTitle === null) return;

        const trimmedTitle = nextTitle.trim();
        if (!trimmedTitle) return;

        setRenamingId(doc.id);
        setError(null);

        try {
            const response = await fetch(`/docs-management/${doc.id}/rename`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ title: trimmedTitle }),
            });

            const payload = (await response
                .json()
                .catch(() => null)) as
                | { success?: boolean; document?: DocumentItem; message?: string }
                | null;

            if (!response.ok || !payload?.success || !payload.document) {
                setError(
                    payload?.message || 'Gagal mengganti nama dokumen.',
                );
                return;
            }

            setDocuments((prev) =>
                prev.map((item) =>
                    item.id === doc.id ? payload.document! : item,
                ),
            );
        } catch {
            setError('Gagal mengganti nama dokumen.');
        } finally {
            setRenamingId(null);
        }
    };

    const handleDelete = async (doc: DocumentItem) => {
        if (!window.confirm('Hapus dokumen ini?')) return;

        setDeletingId(doc.id);
        setError(null);

        try {
            const response = await fetch(`/docs-management/${doc.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                setError('Gagal menghapus dokumen.');
                return;
            }

            setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
        } catch {
            setError('Gagal menghapus dokumen.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleManualShortUrl = async (doc: DocumentItem) => {
        const current = doc.short_url_path || 'pagedocs/';
        const input = window.prompt(
            'Masukkan URL manual (contoh: pagedocs/abcdef.pdf). Tidak boleh ada dash (-).',
            current,
        );

        if (input === null) return;

        const shortUrl = input.trim();
        if (!shortUrl) return;
        if (shortUrl.includes('-')) {
            setError('URL manual tidak boleh mengandung dash (-).');
            return;
        }

        setRenamingId(doc.id);
        setError(null);

        try {
            const response = await fetch(
                `/docs-management/${doc.id}/short-url/manual`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ short_url: shortUrl }),
                },
            );

            const payload = (await response
                .json()
                .catch(() => null)) as
                | { success?: boolean; document?: DocumentItem; message?: string }
                | { errors?: Record<string, string[]> }
                | null;

            if (
                !response.ok ||
                !('success' in (payload || {})) ||
                !payload?.success ||
                !payload.document
            ) {
                const validationMessage =
                    'errors' in (payload || {})
                        ? payload?.errors?.short_url?.[0]
                        : undefined;

                setError(
                    validationMessage ||
                        ('message' in (payload || {})
                            ? payload?.message
                            : undefined) ||
                        'Gagal menyimpan URL manual.',
                );
                return;
            }

            setDocuments((prev) =>
                prev.map((item) =>
                    item.id === doc.id ? payload.document! : item,
                ),
            );
        } catch {
            setError('Gagal menyimpan URL manual.');
        } finally {
            setRenamingId(null);
        }
    };

    const handleAutomaticShortUrl = async (doc: DocumentItem) => {
        setRenamingId(doc.id);
        setError(null);

        try {
            const response = await fetch(`/docs-management/${doc.id}/short-url/auto`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
            });

            const payload = (await response
                .json()
                .catch(() => null)) as
                | { success?: boolean; document?: DocumentItem; message?: string }
                | null;

            if (!response.ok || !payload?.success || !payload.document) {
                setError(payload?.message || 'Gagal generate automatic short URL.');
                return;
            }

            setDocuments((prev) =>
                prev.map((item) =>
                    item.id === doc.id ? payload.document! : item,
                ),
            );
        } catch {
            setError('Gagal generate automatic short URL.');
        } finally {
            setRenamingId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Docs Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Docs Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Kelola daftar dokumen dari seluruh halaman.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="p-6">
                        {documents.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                Belum ada dokumen.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((doc) => {
                                    const defaultCopyKey = `${doc.id}:default`;
                                    const shortCopyKey = `${doc.id}:short`;

                                    return (
                                        <div
                                            key={doc.id}
                                            className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                        >
                                        <div className="flex items-start gap-4">
                                            <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-neutral-900">
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <FileText className="h-6 w-6 text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {doc.display_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {doc.mime_type ||
                                                            'application/octet-stream'}{' '}
                                                        • {formatBytes(doc.size)}{' '}
                                                        • {doc.source}
                                                    </div>
                                                    <div className="text-xs break-all text-gray-500 dark:text-gray-400">
                                                        Default URL: {doc.file_url}
                                                    </div>
                                                    <div className="text-xs break-all text-gray-500 dark:text-gray-400">
                                                        {doc.short_url
                                                            ? `Short URL: ${doc.short_url}`
                                                            : 'Short URL: belum diatur'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() =>
                                                    handleCopyUrl(doc.file_url, defaultCopyKey)
                                                }
                                            >
                                                <Copy className="h-4 w-4" />
                                                {copiedKey === defaultCopyKey
                                                    ? 'Copied'
                                                    : 'Copy URL (Default)'}
                                            </Button>
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium text-gray-700 hover:bg-accent dark:text-gray-200"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open
                                            </a>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => handleRename(doc)}
                                                disabled={renamingId === doc.id}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                {renamingId === doc.id
                                                    ? 'Renaming...'
                                                    : 'Rename Title'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() =>
                                                    doc.short_url &&
                                                    handleCopyUrl(
                                                        doc.short_url,
                                                        shortCopyKey,
                                                    )
                                                }
                                                disabled={!doc.short_url}
                                            >
                                                <Copy className="h-4 w-4" />
                                                {copiedKey === shortCopyKey
                                                    ? 'Copied'
                                                    : 'Copy URL (Short)'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => handleManualShortUrl(doc)}
                                                disabled={renamingId === doc.id}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit URL Manual
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                className="bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                                onClick={() => handleAutomaticShortUrl(doc)}
                                                disabled={renamingId === doc.id}
                                            >
                                                Automatic Short URL
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => handleDelete(doc)}
                                                disabled={deletingId === doc.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {deletingId === doc.id
                                                    ? 'Deleting...'
                                                    : 'Delete'}
                                            </Button>
                                        </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
