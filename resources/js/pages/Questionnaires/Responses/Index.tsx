import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface PageInfo {
    id: number;
    title: string;
}

interface QuestionnaireField {
    id: number;
    label: string | null;
    type: 'input' | 'select';
}

interface QuestionnaireOption {
    id: number;
    label: string;
}

interface QuestionnaireItem {
    id: number;
    question: string;
    description?: string | null;
    type: 'checkbox' | 'radio';
    options: QuestionnaireOption[];
}

interface QuestionnaireSection {
    id: number;
    title: string;
    description?: string | null;
    items: QuestionnaireItem[];
}

interface QuestionnaireResponse {
    id: number;
    created_at: string | null;
    fields: Record<number, string>;
    items: Record<number, string[]>;
}

interface Props {
    page: PageInfo;
    fields: QuestionnaireField[];
    sections: QuestionnaireSection[];
    items: QuestionnaireItem[];
    responses: QuestionnaireResponse[];
}

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const formatAnswer = (response: QuestionnaireResponse, itemId: number) => {
    const answers = response.items[itemId] || [];
    return answers.length ? answers.join(', ') : '-';
};

export default function Index({ page, fields, sections, items, responses }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kuesioner', href: '/questionnaires' },
        { title: 'Hasil', href: `/questionnaires/${page.id}/responses` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil Kuesioner - ${page.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/questionnaires"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Hasil Kuesioner
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {page.title}
                        </p>
                    </div>
                </div>

                {responses.length === 0 ? (
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-8 text-center text-gray-500 dark:border-sidebar-border dark:bg-neutral-800">
                        Belum ada hasil kuesioner yang masuk.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {responses.map((response, index) => (
                            <div
                                key={response.id}
                                className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-800"
                            >
                                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Responden #{responses.length - index}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Dikirim {formatDate(response.created_at)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400">ID #{response.id}</span>
                                    </div>
                                </div>

                                {fields.length > 0 ? (
                                    <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                                        <h4 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                                            Form Awal
                                        </h4>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {fields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-neutral-900"
                                                >
                                                    <div className="text-xs font-semibold uppercase text-gray-500">
                                                        {field.label || 'Field'}
                                                    </div>
                                                    <div className="mt-1">
                                                        {response.fields[field.id] || '-'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="space-y-6 p-6">
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Pertanyaan Kuesioner
                                    </h4>

                                    {sections.length > 0 ? (
                                        sections.map((section) => (
                                            <div key={section.id} className="space-y-3">
                                                {sections.length > 1 ? (
                                                    <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {section.title}
                                                    </h5>
                                                ) : null}
                                                {section.description ? (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {section.description}
                                                    </p>
                                                ) : null}
                                                {section.items.length === 0 ? (
                                                    <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                                        Belum ada item di section ini.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {section.items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm dark:border-gray-700 dark:bg-neutral-900"
                                                            >
                                                                <div className="font-semibold">
                                                                    {item.question}
                                                                </div>
                                                                {item.description ? (
                                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        {item.description}
                                                                    </p>
                                                                ) : null}
                                                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                                                                    <span className="font-medium">Jawaban:</span>{' '}
                                                                    {formatAnswer(response, item.id)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="space-y-3">
                                            {items.length === 0 ? (
                                                <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                                    Belum ada item kuesioner.
                                                </div>
                                            ) : (
                                                items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-sm dark:border-gray-700 dark:bg-neutral-900"
                                                    >
                                                        <div className="font-semibold">
                                                            {item.question}
                                                        </div>
                                                        {item.description ? (
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                {item.description}
                                                            </p>
                                                        ) : null}
                                                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                                                            <span className="font-medium">Jawaban:</span>{' '}
                                                            {formatAnswer(response, item.id)}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
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
