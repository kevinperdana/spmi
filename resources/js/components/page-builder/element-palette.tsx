import { usePageBuilder } from '@/contexts/page-builder-context';
import { BlockType } from '@/types/page-builder';
import { Heading, Type, Image, Link2, Square, Video, Columns, Plus } from 'lucide-react';

const elements: Array<{ type: BlockType; icon: any; label: string; description: string }> = [
    { type: 'heading', icon: Heading, label: 'Heading', description: 'H1-H6 titles' },
    { type: 'text', icon: Type, label: 'Text', description: 'Paragraph text' },
    { type: 'image', icon: Image, label: 'Image', description: 'Add image' },
    { type: 'link', icon: Link2, label: 'Button', description: 'Link or button' },
    { type: 'row', icon: Columns, label: 'Row', description: '2 columns layout' },
    { type: 'spacer', icon: Square, label: 'Spacer', description: 'Empty space' },
    { type: 'video', icon: Video, label: 'Video', description: 'Embed video' },
];

export function ElementPalette() {
    const { addBlock } = usePageBuilder();

    return (
        <div className="w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Elements
            </h3>
            <div className="space-y-2">
                {elements.map((element) => {
                    const Icon = element.icon;
                    return (
                        <button
                            key={element.type}
                            onClick={() => addBlock(element.type)}
                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-left group"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
                                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {element.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {element.description}
                                </div>
                            </div>
                            <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
