import { ArrowLeft } from 'lucide-react';

interface QuestionnaireFieldOption {
    id: number;
    label: string;
}

interface QuestionnaireField {
    id: number;
    type: 'input' | 'select' | 'text';
    label?: string | null;
    placeholder?: string | null;
    input_type?: string | null;
    content?: string | null;
    options: QuestionnaireFieldOption[];
}

interface Props {
    title: string;
    fields: QuestionnaireField[];
}

export default function QuestionnaireIntro({ title, fields }: Props) {
    const inputFields = fields.filter((field) => field.type !== 'text');
    const textFields = fields.filter((field) => field.type === 'text');

    return (
        <section className="bg-slate-50 py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
                            {title}
                        </h1>
                    </div>

                    {inputFields.length > 0 ? (
                        <div className="mt-6">
                            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-[200px_minmax(0,560px)] md:items-center md:gap-x-4 md:gap-y-4">
                                {inputFields.map((field) => {
                                    const inputPlaceholder = field.placeholder || 'Masukkan jawaban...';
                                    const selectPlaceholder = field.placeholder || 'Pilih opsi...';
                                    const inputType = field.input_type || 'text';
                                    const fieldLabel = field.label || '';

                                    return (
                                        <div key={field.id} className="contents">
                                            <label className="text-sm font-semibold text-slate-900">
                                                {fieldLabel}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        {selectPlaceholder}
                                                    </option>
                                                    {field.options.map((option) => (
                                                        <option key={option.id} value={option.label}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={inputType}
                                                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                    placeholder={inputPlaceholder}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {textFields.length > 0 ? (
                        <div className="mt-6 space-y-4">
                            {textFields.map((field) => (
                                <div key={field.id} className="text-sm text-slate-700">
                                    {field.label ? (
                                        <div className="mb-2 text-base font-semibold text-slate-900">
                                            {field.label}
                                        </div>
                                    ) : null}
                                    <div className="whitespace-pre-line leading-relaxed">
                                        {field.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
