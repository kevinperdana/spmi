import { useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, ExternalLink, File, FileText, FileVideo, Trash2, Upload } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface MediaItem {
    id: number;
    original_name: string;
    file_name: string;
    mime_type: string | null;
    extension: string | null;
    size: number;
    path: string;
    url: string;
    created_at: string;
}

interface Props {
    media: MediaItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Media',
        href: '/media',
    },
];

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.mp4,.webm,.ogg,.mov,.avi,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf';

const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const isImage = (item: MediaItem) => item.mime_type?.startsWith('image/');
const isVideo = (item: MediaItem) => item.mime_type?.startsWith('video/');
const isPdf = (item: MediaItem) => item.mime_type === 'application/pdf';
const getStorageUrl = (item: MediaItem) => {
    if (item.path) {
        return `/storage/${item.path.replace(/^\/+/, '')}`;
    }

    return item.url;
};

export default function Index({ media: initialMedia }: Props) {
    const [media, setMedia] = useState<MediaItem[]>(initialMedia);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            setError('CSRF token not found. Please refresh the page.');
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('files[]', file);
        });

        setUploading(true);
        setError(null);

        try {
            const response = await fetch('/media', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                setError(result?.error || result?.message || 'Upload failed. Please try again.');
                return;
            }

            if (result?.items?.length) {
                setMedia((prev) => [...result.items, ...prev]);
            }
        } catch (uploadError) {
            console.error('Upload failed:', uploadError);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCopyUrl = async (url: string, id: number) => {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

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

        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1500);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        setDeletingId(id);
        router.delete(`/media/${id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
            onSuccess: () => setMedia((prev) => prev.filter((item) => item.id !== id)),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Media" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Media Library
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Upload images, documents, and videos to get shareable URLs.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            multiple
                            className="hidden"
                            onChange={(event) => handleFilesSelected(event.target.files)}
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <Upload className="h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported: images (JPG, PNG, GIF, WEBP, SVG), PDF, video (MP4, WEBM, OGG, MOV, AVI), Office files (DOC/X, XLS/X, PPT/X), TXT, CSV, RTF. Max 50MB each.
                </p>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        {media.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No media uploaded yet. Upload your first file!
                                </p>
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Files
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {media.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-neutral-900 overflow-hidden">
                                            {isImage(item) ? (
                                                <img
                                                    src={getStorageUrl(item)}
                                                    alt={item.original_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : isVideo(item) ? (
                                                <FileVideo className="h-6 w-6 text-gray-500" />
                                            ) : isPdf(item) ? (
                                                <FileText className="h-6 w-6 text-gray-500" />
                                            ) : (
                                                <File className="h-6 w-6 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {item.original_name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.mime_type || item.extension?.toUpperCase() || 'File'} • {formatBytes(item.size)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                                {getStorageUrl(item)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyUrl(getStorageUrl(item), item.id)}
                                            >
                                                <Copy className="h-4 w-4" />
                                                {copiedId === item.id ? 'Copied' : 'Copy URL'}
                                            </Button>
                                            <a
                                                href={getStorageUrl(item)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-accent"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
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
