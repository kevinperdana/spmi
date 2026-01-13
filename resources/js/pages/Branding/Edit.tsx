import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem, type BrandSettings } from '@/types';

interface Props {
    brand: BrandSettings;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Branding', href: '/branding' },
];

export default function Edit({ brand }: Props) {
    const [uploading, setUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { data, setData, put, processing, errors } = useForm({
        name: brand.name || 'SPMI',
        logoUrl: brand.logoUrl || '',
    });

    const brandInitial = data.name.trim().charAt(0).toUpperCase() || 'S';

    const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];
        if (!file) return;

        setSelectedFileName(file.name);

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await fetch('/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }

            const result = await response.json();
            if (result.url) {
                setData('logoUrl', result.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload icon. Please try again.');
        } finally {
            setUploading(false);
            input.value = '';
        }
    };

    const handleOpenFileDialog = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        put('/branding');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branding" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Branding
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Atur icon dan nama untuk header, footer, dan header dashboard.
                    </p>
                </div>

                <div className="max-w-2xl rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="brand-name">Nama</Label>
                            <Input
                                id="brand-name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                placeholder="SPMI"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="brand-logo">Icon</Label>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex size-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-neutral-900">
                                    {data.logoUrl ? (
                                        <img
                                            src={data.logoUrl}
                                            alt={data.name}
                                            className="h-12 w-12 object-contain"
                                        />
                                    ) : (
                                        <span className="text-2xl font-semibold">
                                            {brandInitial}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <input
                                        id="brand-logo"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={uploading}
                                        className="sr-only"
                                    />
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleOpenFileDialog}
                                            disabled={uploading}
                                            className="w-fit"
                                        >
                                            {uploading ? 'Mengunggah...' : data.logoUrl ? 'Ganti Icon' : 'Pilih Icon'}
                                        </Button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedFileName || (data.logoUrl ? 'Icon sudah tersimpan.' : 'Belum ada file dipilih.')}
                                        </span>
                                    </div>
                                    {data.logoUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setData('logoUrl', '');
                                                setSelectedFileName('');
                                            }}
                                            className="w-fit"
                                        >
                                            Hapus Icon
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {errors.logoUrl && (
                                <p className="text-sm text-red-600">{errors.logoUrl}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Disarankan ukuran ikon 256x256px (PNG/SVG).
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing || uploading}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
