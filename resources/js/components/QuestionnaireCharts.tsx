interface ChartStat {
    id: number;
    label: string;
    count: number;
    percent: number;
}

interface ChartItem {
    id: number;
    question: string;
    description?: string | null;
    total: number;
    stats: ChartStat[];
}

interface ChartGroup {
    id: number;
    title: string;
    description?: string | null;
    items: ChartItem[];
}

interface Props {
    title: string;
    responseCount: number;
    groups: ChartGroup[];
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

const buildSegments = (stats: ChartStat[]) => {
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

export default function QuestionnaireCharts({ title, responseCount, groups }: Props) {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-slate-900">Hasil Kuesioner</h2>
                <p className="mt-2 text-sm text-slate-500">{title}</p>
                <p className="mt-1 text-xs text-slate-400">Total respon: {responseCount}</p>
            </div>

            {groups.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                    Belum ada data kuesioner untuk ditampilkan.
                </div>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {group.title}
                                </h3>
                                {group.description ? (
                                    <p className="text-sm text-slate-500">
                                        {group.description}
                                    </p>
                                ) : null}
                            </div>

                            {group.items.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                                    Belum ada pertanyaan kuesioner.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {group.items.map((item) => {
                                        const { segments, gradient, total } = buildSegments(item.stats);
                                        const summary = total > 0
                                            ? `Total jawaban: ${item.total}`
                                            : 'Belum ada jawaban untuk pertanyaan ini.';

                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
                                            >
                                                <div className="mb-3">
                                                    <div className="text-base font-semibold text-slate-900">
                                                        {item.question}
                                                    </div>
                                                    {item.description ? (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {item.description}
                                                        </p>
                                                    ) : null}
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {summary}
                                                    </p>
                                                </div>

                                                {item.stats.length === 0 ? (
                                                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
                                                        Belum ada data pilihan untuk pertanyaan ini.
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className="relative h-32 w-32">
                                                                <div
                                                                    className="absolute inset-0 rounded-full"
                                                                    style={{ background: gradient }}
                                                                />
                                                                <div className="absolute inset-4 rounded-full bg-white shadow-inner" />
                                                                <div className="absolute inset-0 flex items-center justify-center text-center text-[10px] font-semibold text-slate-600">
                                                                    {total > 0 ? 'Distribusi' : 'Belum ada'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid flex-1 gap-2 text-sm text-slate-600">
                                                            {segments.map((segment) => (
                                                                <div
                                                                    key={segment.id}
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
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
