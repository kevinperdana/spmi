import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

interface FollowupItem {
    id: number;
    code: string | null;
    indicator: string;
    notes: string | null;
    decision: string | null;
    target_time: string | null;
    responsible: string | null;
    status: string | null;
}

interface FollowupForm {
    id: number;
    title: string;
    items: FollowupItem[];
}

type FollowupFields = {
    decision: string;
    target_time: string;
    responsible: string;
    status: string;
};

interface Props {
    type: 'rtm' | 'rtl';
    title: string;
    forms: FollowupForm[];
}

export default function Index({ type, title, forms }: Props) {
    const initialValues = useMemo(() => {
        const values: Record<number, FollowupFields> = {};

        forms.forEach((form) => {
            form.items.forEach((item) => {
                values[item.id] = {
                    decision: item.decision ?? '',
                    target_time: item.target_time ?? '',
                    responsible: item.responsible ?? '',
                    status: item.status ?? '',
                };
            });
        });

        return values;
    }, [forms]);

    const [values, setValues] = useState(initialValues);
    const [savingId, setSavingId] = useState<number | null>(null);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleChange = (itemId: number, field: keyof FollowupFields, value: string) => {
        setValues((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || { decision: '', target_time: '', responsible: '', status: '' }), [field]: value },
        }));
    };

    const handleSave = (itemId: number) => {
        const payload = values[itemId];
        if (!payload) return;

        setSavingId(itemId);
        router.post(`/ami-form-followups/${itemId}`, { type, ...payload }, {
            preserveScroll: true,
            onFinish: () => setSavingId(null),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title, href: type === 'rtm' ? '/rtm' : '/rtl' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="rtm-print-root flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <style>{`
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 8mm;
                        }

                        body {
                            background: #ffffff !important;
                        }

                        [data-slot="sidebar"],
                        [data-slot="sidebar-header"] {
                            display: none !important;
                        }

                        [data-slot="sidebar-inset"] {
                            margin: 0 !important;
                            box-shadow: none !important;
                            background: #ffffff !important;
                        }

                        .rtm-print-actions {
                            display: none !important;
                        }

                        .rtm-print-root {
                            font-size: 11px;
                        }

                        .rtm-print-root table {
                            width: 100% !important;
                            min-width: 0 !important;
                            table-layout: fixed;
                        }

                        .rtm-print-root th,
                        .rtm-print-root td {
                            padding: 6px 8px !important;
                        }

                        .rtm-print-root thead th {
                            font-size: 10px;
                        }

                        .rtm-print-root td textarea,
                        .rtm-print-root td input {
                            width: 100% !important;
                            min-width: 0 !important;
                            font-size: 10px !important;
                            padding: 6px 8px !important;
                            border: none !important;
                            box-shadow: none !important;
                            background: transparent !important;
                        }

                        .rtm-print-root table {
                            page-break-inside: auto;
                        }

                        .rtm-print-root thead {
                            display: table-header-group;
                        }

                        .rtm-print-root tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                    }
                `}</style>

                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </h2>
                    </div>
                    <div className="rtm-print-actions flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => window.print()}>
                            Export PDF
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kelola tindak lanjut berdasarkan hasil AMI.
                </p>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800">
                    <div className="p-6">
                        {forms.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                Belum ada data AMI untuk ditampilkan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1200px] border-collapse text-left">
                                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-neutral-900/40 dark:text-gray-300">
                                        <tr>
                                            <th className="px-4 py-3">No.</th>
                                            <th className="px-4 py-3">Standar</th>
                                            <th className="px-4 py-3">Topik Diskusi</th>
                                            <th className="px-4 py-3">Tindakan / Keputusan</th>
                                            <th className="px-4 py-3">Target Waktu Selesai</th>
                                            <th className="px-4 py-3">Penanggung Jawab</th>
                                            <th className="px-4 py-3">Status Masalah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forms.map((form) => (
                                            <Fragment key={form.id}>
                                                <tr
                                                    className="bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-neutral-900/60 dark:text-gray-200"
                                                >
                                                    <td className="px-4 py-3" colSpan={7}>
                                                        {form.title}
                                                    </td>
                                                </tr>
                                                {form.items.map((item, index) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b border-gray-200 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                                                    >
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                            {item.code || index + 1}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                                            {item.indicator}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                            {item.notes || '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Textarea
                                                                value={values[item.id]?.decision ?? ''}
                                                                onChange={(event) => handleChange(item.id, 'decision', event.target.value)}
                                                                onBlur={() => handleSave(item.id)}
                                                                placeholder="Tulis tindakan/keputusan"
                                                                rows={2}
                                                                className="min-w-[220px]"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                value={values[item.id]?.target_time ?? ''}
                                                                onChange={(event) => handleChange(item.id, 'target_time', event.target.value)}
                                                                onBlur={() => handleSave(item.id)}
                                                                placeholder="Contoh: 1 tahun"
                                                                className="min-w-[160px]"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                value={values[item.id]?.responsible ?? ''}
                                                                onChange={(event) => handleChange(item.id, 'responsible', event.target.value)}
                                                                onBlur={() => handleSave(item.id)}
                                                                placeholder="Nama penanggung jawab"
                                                                className="min-w-[160px]"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                value={values[item.id]?.status ?? ''}
                                                                onChange={(event) => handleChange(item.id, 'status', event.target.value)}
                                                                onBlur={() => handleSave(item.id)}
                                                                placeholder="Status masalah"
                                                                className="min-w-[140px]"
                                                            />
                                                            {savingId === item.id ? (
                                                                <div className="mt-1 text-xs text-gray-400">Menyimpan...</div>
                                                            ) : null}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
