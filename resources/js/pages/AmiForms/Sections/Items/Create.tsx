import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface AmiForm {
    id: number;
    title: string;
}

interface AmiFormSection {
    id: number;
    title: string;
}

interface Props {
    form: AmiForm;
    section: AmiFormSection;
    satuanOptions: string[];
    targetOptions: string[];
    capaianOptions: string[];
}

const unitLabel = (unit: string) => {
    switch (unit) {
        case 'tersedia':
            return 'Tersedia (Checklist)';
        case 'persen':
            return 'Persen (%)';
        case 'ipk':
            return 'IPK';
        case 'tahun':
            return 'Tahun';
        case 'dokumen':
            return 'Dokumen';
        case 'dokumen_tersedia':
            return 'Dokumen Tersedia';
        case 'angka':
            return 'Angka';
        default:
            return unit;
    }
};

const selectClassName = 'h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100';

export default function Create({ form, section, satuanOptions, targetOptions, capaianOptions }: Props) {
    const defaultSatuan = satuanOptions.includes('tersedia') ? 'tersedia' : satuanOptions[0];
    const defaultTarget = targetOptions.includes('dokumen') ? 'dokumen' : targetOptions[0];
    const defaultCapaian = capaianOptions.includes('dokumen_tersedia') ? 'dokumen_tersedia' : capaianOptions[0];

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        indicator: '',
        satuan_unit: defaultSatuan,
        target_unit: defaultTarget,
        target_value: null as number | null,
        capaian_unit: defaultCapaian,
        capaian_value: null as number | null,
        order: null as number | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Form AMI', href: '/ami-forms' },
        { title: 'Sections', href: `/ami-forms/${form.id}/sections` },
        { title: section.title, href: `/ami-forms/${form.id}/sections/${section.id}/items` },
        { title: 'Create', href: `/ami-forms/${form.id}/sections/${section.id}/items/create` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(`/ami-forms/${form.id}/sections/${section.id}/items`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Item - ${section.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/ami-forms/${form.id}/sections/${section.id}/items`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        New Item
                    </h2>
                </div>

                <div className="max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="code">No / Kode</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(event) => setData('code', event.target.value)}
                                    placeholder="1, 5a, 5b"
                                />
                                {errors.code && (
                                    <p className="text-sm text-red-600">{errors.code}</p>
                                )}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="indicator">Indikator Kinerja Utama</Label>
                                <Textarea
                                    id="indicator"
                                    value={data.indicator}
                                    onChange={(event) => setData('indicator', event.target.value)}
                                    placeholder="Contoh: CPL mencakup sikap, keterampilan umum..."
                                    rows={3}
                                />
                                {errors.indicator && (
                                    <p className="text-sm text-red-600">{errors.indicator}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="satuan_unit">Satuan</Label>
                                <div className="relative">
                                    <select
                                        id="satuan_unit"
                                        value={data.satuan_unit}
                                        onChange={(event) => setData('satuan_unit', event.target.value)}
                                        className={selectClassName}
                                    >
                                        {satuanOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {unitLabel(option)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.satuan_unit && (
                                    <p className="text-sm text-red-600">{errors.satuan_unit}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="target_unit">Target</Label>
                                <div className="relative">
                                    <select
                                        id="target_unit"
                                        value={data.target_unit}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setData('target_unit', value);
                                            if (value !== 'angka' && value !== 'persen') {
                                                setData('target_value', null);
                                            }
                                        }}
                                        className={selectClassName}
                                    >
                                        {targetOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {unitLabel(option)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.target_unit && (
                                    <p className="text-sm text-red-600">{errors.target_unit}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capaian_unit">Capaian</Label>
                                <div className="relative">
                                    <select
                                        id="capaian_unit"
                                        value={data.capaian_unit}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setData('capaian_unit', value);
                                            if (value !== 'angka') {
                                                setData('capaian_value', null);
                                            }
                                        }}
                                        className={selectClassName}
                                    >
                                        {capaianOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {unitLabel(option)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.capaian_unit && (
                                    <p className="text-sm text-red-600">{errors.capaian_unit}</p>
                                )}
                            </div>
                        </div>

                        {data.target_unit === 'angka' || data.target_unit === 'persen' || data.capaian_unit === 'angka' ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {data.target_unit === 'angka' || data.target_unit === 'persen' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="target_value">
                                            Target ({data.target_unit === 'persen' ? 'Persen' : 'Angka'})
                                        </Label>
                                        <Input
                                            id="target_value"
                                            type="number"
                                            step="any"
                                            value={data.target_value ?? ''}
                                            onChange={(event) =>
                                                setData(
                                                    'target_value',
                                                    event.target.value === '' ? null : Number(event.target.value),
                                                )
                                            }
                                            placeholder="Masukkan angka"
                                        />
                                        {errors.target_value && (
                                            <p className="text-sm text-red-600">{errors.target_value}</p>
                                        )}
                                    </div>
                                ) : null}

                                {data.capaian_unit === 'angka' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="capaian_value">Capaian (Angka)</Label>
                                        <Input
                                            id="capaian_value"
                                            type="number"
                                            step="any"
                                            value={data.capaian_value ?? ''}
                                            onChange={(event) =>
                                                setData(
                                                    'capaian_value',
                                                    event.target.value === '' ? null : Number(event.target.value),
                                                )
                                            }
                                            placeholder="Masukkan angka"
                                        />
                                        {errors.capaian_value && (
                                            <p className="text-sm text-red-600">{errors.capaian_value}</p>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

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
                                Save Item
                            </Button>
                            <Link href={`/ami-forms/${form.id}/sections/${section.id}/items`}>
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
