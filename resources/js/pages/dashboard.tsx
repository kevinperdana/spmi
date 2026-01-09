import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface AmiFormItemResponse {
    value_bool: boolean | null;
    value_number: string | number | null;
    notes?: string | null;
}

interface AmiFormItem {
    id: number;
    code: string | null;
    indicator: string;
    satuan_unit: string;
    response: AmiFormItemResponse | null;
}

interface AmiFormSection {
    id: number;
    title: string;
    items: AmiFormItem[];
}

interface AmiForm {
    id: number;
    title: string;
    sections: AmiFormSection[];
}

interface Props {
    forms?: AmiForm[];
}

const unitLabel = (unit: string) => {
    switch (unit) {
        case 'tersedia':
            return 'Tersedia';
        case 'persen':
            return '%';
        case 'ipk':
            return 'IPK';
        case 'tahun':
            return 'Tahun';
        default:
            return unit;
    }
};

export default function Dashboard({ forms = [] }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isAuditor = auth.user?.role === 'auditor';

    const initialResponses = useMemo(() => {
        const entries: Record<number, { valueBool: boolean; valueNumber: string; notes: string }> = {};
        forms.forEach((form) => {
            form.sections.forEach((section) => {
                section.items.forEach((item) => {
                    const valueBool = item.response?.value_bool ?? false;
                    const valueNumber = item.response?.value_number ?? '';
                    const notes = item.response?.notes ?? '';
                    entries[item.id] = {
                        valueBool,
                        valueNumber: valueNumber === null ? '' : String(valueNumber),
                        notes,
                    };
                });
            });
        });
        return entries;
    }, [forms]);

    const [responses, setResponses] = useState(initialResponses);
    const [savingId, setSavingId] = useState<number | null>(null);

    useEffect(() => {
        setResponses(initialResponses);
    }, [initialResponses]);

    const handleCheckboxChange = (itemId: number, checked: boolean) => {
        setResponses((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || { valueNumber: '', notes: '' }), valueBool: checked },
        }));
    };

    const handleNumberChange = (itemId: number, value: string) => {
        setResponses((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || { valueBool: false, notes: '' }), valueNumber: value },
        }));
    };

    const handleNotesChange = (itemId: number, value: string) => {
        setResponses((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || { valueBool: false, valueNumber: '' }), notes: value },
        }));
    };

    const handleSave = (item: AmiFormItem) => {
        setSavingId(item.id);
        const rawValue = responses[item.id]?.valueNumber;
        const numberValue = rawValue === '' || rawValue === undefined ? null : Number(rawValue);
        const notesValue = responses[item.id]?.notes ?? '';
        const payload = item.satuan_unit === 'tersedia'
            ? { value_bool: responses[item.id]?.valueBool ?? false }
            : { value_number: numberValue };
        const payloadWithNotes = {
            ...payload,
            notes: notesValue === '' ? null : notesValue,
        };

        router.post(`/ami-form-items/${item.id}/responses`, payloadWithNotes, {
            preserveScroll: true,
            onFinish: () => setSavingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {isAuditor ? (
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {forms.length === 0 ? (
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-8 text-center text-gray-500 dark:border-sidebar-border dark:bg-neutral-800">
                            Belum ada form AMI untuk diisi.
                        </div>
                    ) : (
                        forms.map((form) => (
                            <div
                                key={form.id}
                                className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800"
                            >
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        {form.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Isi capaian per indikator sesuai satuan.
                                    </p>
                                </div>
                                <div className="space-y-6 p-6">
                                    {form.sections.map((section) => (
                                        <div key={section.id}>
                                            {form.sections.length > 1 ? (
                                                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {section.title}
                                                </h3>
                                            ) : null}
                                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                                <table className="w-full min-w-[860px] border-collapse text-left">
                                                    <thead className="bg-gray-50 text-sm text-gray-700 dark:bg-neutral-900/40 dark:text-gray-300">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold">No</th>
                                                            <th className="px-4 py-3 font-semibold">Indikator</th>
                                                            <th className="px-4 py-3 font-semibold">Input</th>
                                                            <th className="px-4 py-3 font-semibold">Keterangan</th>
                                                            <th className="px-4 py-3 font-semibold">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {section.items.map((item) => {
                                                            const isChecklist = item.satuan_unit === 'tersedia';
                                                            return (
                                                                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                                        {item.code || '-'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                        {item.indicator}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                        {isChecklist ? (
                                                                            <label className="inline-flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={responses[item.id]?.valueBool ?? false}
                                                                                    onChange={(event) => handleCheckboxChange(item.id, event.target.checked)}
                                                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                                />
                                                                                <span className="text-sm text-gray-700 dark:text-gray-200">
                                                                                    {unitLabel(item.satuan_unit)}
                                                                                </span>
                                                                            </label>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <Input
                                                                                    type="number"
                                                                                    step="any"
                                                                                    value={responses[item.id]?.valueNumber ?? ''}
                                                                                    onChange={(event) => handleNumberChange(item.id, event.target.value)}
                                                                                    placeholder="Masukkan angka"
                                                                                    className="max-w-[180px]"
                                                                                />
                                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                    {unitLabel(item.satuan_unit)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                        <Input
                                                                            value={responses[item.id]?.notes ?? ''}
                                                                            onChange={(event) => handleNotesChange(item.id, event.target.value)}
                                                                            placeholder="Tambahkan keterangan"
                                                                            className="min-w-[180px] max-w-[260px]"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleSave(item)}
                                                                            disabled={savingId === item.id}
                                                                        >
                                                                            {savingId === item.id ? 'Saving...' : 'Simpan'}
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
