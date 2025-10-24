import { usePageBuilder } from '@/contexts/page-builder-context';
import { Plus, LayoutGrid } from 'lucide-react';

interface LayoutOption {
    label: string;
    description: string;
    columns: number[];
}

const layouts: LayoutOption[] = [
    { label: 'Full Width', description: 'Main (12-col)', columns: [12] },
    { label: '2 Equal Columns', description: 'Left (6-col) + Right (6-col)', columns: [6, 6] },
    { label: '3 Equal Columns', description: '4-col + 4-col + 4-col', columns: [4, 4, 4] },
    { label: '4 Equal Columns', description: '3-col + 3-col + 3-col + 3-col', columns: [3, 3, 3, 3] },
    { label: 'Left Sidebar + Main', description: 'Sidebar (4-col) + Main (8-col)', columns: [4, 8] },
    { label: 'Main + Right Sidebar', description: 'Main (8-col) + Sidebar (4-col)', columns: [8, 4] },
    { label: 'Sidebar + Main + Sidebar', description: 'Left (3-col) + Main (6-col) + Right (3-col)', columns: [3, 6, 3] },
    { label: 'Left Sidebar + Main', description: 'Sidebar (3-col) + Main (9-col)', columns: [3, 9] },
    { label: 'Main + Right Sidebar', description: 'Main (9-col) + Sidebar (3-col)', columns: [9, 3] },
    { label: 'Narrow Sidebar Left', description: 'Sidebar (2-col) + Main (10-col)', columns: [2, 10] },
];

export function ElementPalette() {
    const { setPageLayout, sections } = usePageBuilder();

    return (
        <div className="w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Page Layouts
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose a layout structure for your page
                </p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                    {layouts.map((layout, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPageLayout(layout.columns)}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-left group"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800">
                                <LayoutGrid className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {layout.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {layout.description}
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {layout.columns.map((width, i) => (
                                        <div
                                            key={i}
                                            className="h-2 bg-purple-200 dark:bg-purple-700 rounded"
                                            style={{ flex: width }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
