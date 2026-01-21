interface ResultStat {
    label: string;
    count: number;
    percent: number;
}

interface ResultGroup {
    id: number;
    title: string;
    total: number;
    item_count: number;
    stats: ResultStat[];
}

interface QuestionnaireResult {
    id: number;
    title: string;
    slug: string;
    response_count: number;
    groups: ResultGroup[];
}

interface Props {
    results: QuestionnaireResult[];
}

const CHART_COLORS = [
    '#2563eb',
    '#16a34a',
    '#f97316',
    '#e11d48',
    '#7c3aed',
    '#0ea5e9',
    '#14b8a6',
    '#f59e0b',
];

const buildSegments = (stats: ResultStat[]) => {
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    let acc = 0;

    const segments = stats.map((stat, index) => {
        const pct = total > 0 ? (stat.count / total) * 100 : 0;
        const start = acc;
        acc += pct;
        return {
            ...stat,
            color: CHART_COLORS[index % CHART_COLORS.length],
            pct,
            start,
            end: acc,
        };
    });

    const gradient = total
        ? `conic-gradient(${segments
              .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
              .join(', ')})`
        : 'conic-gradient(#e5e7eb 0% 100%)';

    return { segments, gradient, total };
};

export default function QuestionnaireResults({ results }: Props) {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-slate-900">Hasil Kuesioner</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Ringkasan persentase jawaban per kuesioner dan per section.
                </p>
            </div>

            {results.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                    Belum ada kuesioner untuk ditampilkan.
                </div>
            ) : (
                <div className="space-y-6">
                    {results.map((questionnaire) => (
                        <div
                            key={questionnaire.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {questionnaire.title}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Total respon masuk: {questionnaire.response_count}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                    /page/{questionnaire.slug}
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                {questionnaire.groups.map((group) => {
                                    const { segments, gradient, total } = buildSegments(group.stats);
                                    const summary = total > 0
                                        ? `${total} jawaban terkumpul`
                                        : 'Belum ada jawaban untuk section ini.';

                                    return (
                                        <div
                                            key={group.id}
                                            className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
                                        >
                                            <div className="mb-3">
                                                <div className="text-lg font-semibold text-slate-900">
                                                    {group.title}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {group.item_count} pertanyaan · {summary}
                                                </div>
                                            </div>

                                            {group.stats.length === 0 ? (
                                                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                                                    Belum ada data pilihan untuk section ini.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="relative h-40 w-40">
                                                            <div
                                                                className="absolute inset-0 rounded-full"
                                                                style={{ background: gradient }}
                                                            />
                                                            <div className="absolute inset-5 rounded-full bg-white shadow-inner" />
                                                            <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold text-slate-600">
                                                                {total > 0 ? 'Distribusi' : 'Belum ada'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid flex-1 gap-2 text-sm text-slate-600">
                                                        {segments.map((segment) => (
                                                            <div
                                                                key={segment.label}
                                                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2"
                                                            >
                                                                <span
                                                                    className="h-3 w-3 rounded-full"
                                                                    style={{ backgroundColor: segment.color }}
                                                                />
                                                                <span className="font-medium text-slate-700">
                                                                    {segment.label}
                                                                </span>
                                                                <span className="ml-auto text-slate-500">
                                                                    {segment.percent}%
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
