import { useEffect, useState } from 'react';

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

interface Props {
    sections?: QuestionnaireSection[];
    items?: QuestionnaireItem[];
}

const typeHint = (type: QuestionnaireItem['type']) =>
    type === 'checkbox' ? 'Boleh lebih dari satu' : 'Pilih satu';

const ItemsList = ({ items }: { items: QuestionnaireItem[] }) => (
    <div className="space-y-6">
        {items.map((item) => (
            <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {item.question}
                        </h3>
                        {item.description ? (
                            <p className="mt-1 text-sm text-slate-600">
                                {item.description}
                            </p>
                        ) : null}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {typeHint(item.type)}
                    </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.options.map((option) => {
                        const inputId = `question-${item.id}-option-${option.id}`;
                        const inputName =
                            item.type === 'checkbox'
                                ? `items[${item.id}][]`
                                : `items[${item.id}]`;

                        return (
                            <label
                                key={option.id}
                                htmlFor={inputId}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-blue-300"
                            >
                                <input
                                    id={inputId}
                                    name={inputName}
                                    type={item.type}
                                    value={option.id}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <span className="font-medium">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);

export default function QuestionnaireItems({ sections = [], items = [] }: Props) {
    const [activeSectionId, setActiveSectionId] = useState<number | null>(
        sections[0]?.id ?? null
    );

    useEffect(() => {
        if (!sections.length) {
            setActiveSectionId(null);
            return;
        }

        if (activeSectionId === null || !sections.find((section) => section.id === activeSectionId)) {
            setActiveSectionId(sections[0].id);
        }
    }, [sections, activeSectionId]);

    if (!sections.length && !items.length) return null;

    if (!sections.length) {
        return (
            <section className="bg-slate-50 py-10">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Pertanyaan Kuesioner</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Pilih jawaban yang paling sesuai dengan kondisi Anda.
                        </p>
                    </div>

                    {items.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                            Belum ada item kuesioner.
                        </div>
                    ) : (
                        <ItemsList items={items} />
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-slate-50 py-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Pertanyaan Kuesioner</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Pilih jawaban yang paling sesuai dengan kondisi Anda.
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {sections.map((section) => {
                        const isActive = section.id === activeSectionId;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSectionId(section.id)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                                }`}
                            >
                                {section.title}
                            </button>
                        );
                    })}
                </div>

                {sections.map((section) => {
                    const isActive = section.id === activeSectionId;
                    return (
                        <div
                            key={section.id}
                            className={isActive ? 'block' : 'hidden'}
                            aria-hidden={!isActive}
                        >
                            {section.description ? (
                                <p className="mb-6 text-sm text-slate-600">{section.description}</p>
                            ) : null}

                            {section.items.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                                    Belum ada item untuk section ini.
                                </div>
                            ) : (
                                <ItemsList items={section.items} />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
