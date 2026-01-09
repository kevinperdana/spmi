import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface AmiForm {
    id: number;
    title: string;
}

interface AmiFormItem {
    id: number;
    code: string | null;
    indicator: string;
    satuan_unit: string;
    target_unit: string;
    target_value: number | null;
    capaian_unit: string;
    capaian_value: number | null;
    order: number;
}

interface AmiFormSection {
    id: number;
    title: string;
    items: AmiFormItem[];
}

interface AmiFormItemResponse {
    value_bool: boolean | null;
    value_number: string | number | null;
    notes?: string | null;
}

interface AuditorResult {
    id: number;
    name: string | null;
    email: string;
    responses: Record<number, AmiFormItemResponse>;
}

interface Props {
    form: AmiForm;
    sections: AmiFormSection[];
    auditors: AuditorResult[];
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

const formatValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
};

const renderTarget = (item: AmiFormItem) => {
    if (item.target_unit === 'angka' || item.target_unit === 'persen') {
        const value = formatValue(item.target_value);
        if (item.target_unit === 'persen' && value !== '-') {
            return `${value}%`;
        }
        return value;
    }

    return 'Dokumen';
};

const renderAdminCapaian = (item: AmiFormItem) => {
    if (item.capaian_unit === 'angka') {
        return formatValue(item.capaian_value);
    }

    return 'Dokumen Tersedia';
};

const renderAuditorInput = (item: AmiFormItem, response?: AmiFormItemResponse) => {
    if (!response) return '-';

    if (item.satuan_unit === 'tersedia') {
        return response.value_bool ? 'Tersedia' : 'Belum tersedia';
    }

    return formatValue(response.value_number);
};

const renderNotes = (response?: AmiFormItemResponse) => {
    if (!response || !response.notes) return '-';
    return response.notes;
};

const renderPersentase = (item: AmiFormItem, response?: AmiFormItemResponse) => {
    if (!response) return '-';

    if (item.satuan_unit === 'tersedia') {
        if (response.value_bool === null) return '-';
        return response.value_bool ? '100%' : '0%';
    }

    if (!['angka', 'persen'].includes(item.target_unit) || item.capaian_unit !== 'angka') {
        return '-';
    }

    const target = item.target_value === null ? NaN : Number(item.target_value);
    const actual = response.value_number === null ? NaN : Number(response.value_number);

    if (!Number.isFinite(target) || target === 0 || !Number.isFinite(actual)) {
        return '-';
    }

    const percentage = (actual / target) * 100;
    return `${percentage.toFixed(2)}%`;
};

export default function Results({ form, sections, auditors }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Form AMI', href: '/ami-forms' },
        { title: 'Hasil', href: `/ami-forms/${form.id}/results` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil Form - ${form.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/ami-forms"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Hasil Form AMI
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {form.title}
                        </p>
                    </div>
                </div>

                {auditors.length === 0 ? (
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-8 text-center text-gray-500 dark:border-sidebar-border dark:bg-neutral-800">
                        Belum ada hasil isian auditor.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {auditors.map((auditor) => (
                            <div
                                key={auditor.id}
                                className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800"
                            >
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {auditor.name || 'Auditor'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {auditor.email}
                                    </p>
                                </div>
                                <div className="space-y-6 p-6">
                                    {sections.length === 0 ? (
                                        <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                            Belum ada item pada form ini.
                                        </div>
                                    ) : (
                                        sections.map((section) => (
                                            <div key={section.id}>
                                                {sections.length > 1 ? (
                                                    <h4 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                                                        {section.title}
                                                    </h4>
                                                ) : null}

                                                {section.items.length === 0 ? (
                                                    <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                                        Belum ada item di section ini.
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <table className="w-full min-w-[1120px] border-collapse text-left">
                                                            <thead className="bg-gray-50 text-sm text-gray-700 dark:bg-neutral-900/40 dark:text-gray-300">
                                                                <tr>
                                                                    <th className="px-4 py-3 font-semibold">No</th>
                                                                    <th className="px-4 py-3 font-semibold">Indikator</th>
                                                                    <th className="px-4 py-3 font-semibold">Isian Auditor</th>
                                                                    <th className="px-4 py-3 font-semibold">Satuan</th>
                                                                    <th className="px-4 py-3 font-semibold">Target</th>
                                                                    <th className="px-4 py-3 font-semibold">Capaian</th>
                                                                    <th className="px-4 py-3 font-semibold">Persentase Capaian</th>
                                                                    <th className="px-4 py-3 font-semibold">Keterangan</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {section.items.map((item) => {
                                                                    const response = auditor.responses[item.id];
                                                                    return (
                                                                        <tr
                                                                            key={item.id}
                                                                            className="border-t border-gray-200 dark:border-gray-700"
                                                                        >
                                                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                                                {item.code || '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                                {item.indicator}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                                {renderAuditorInput(item, response)}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                                                {unitLabel(item.satuan_unit)}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                                {renderTarget(item)}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                                {renderAdminCapaian(item)}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                                {renderPersentase(item, response)}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                                                {renderNotes(response)}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
