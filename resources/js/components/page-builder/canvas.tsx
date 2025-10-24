import { useState } from 'react';
import { usePageBuilder } from '@/contexts/page-builder-context';
import { BlockRenderer } from './block-renderer';
import { ChevronUp, ChevronDown, Trash2, X } from 'lucide-react';
import { BlockType } from '@/types/page-builder';

export function Canvas() {
    const { blocks, selectedBlockId, selectBlock, removeBlock, moveBlock, addBlockToColumn } = usePageBuilder();
    const [columnContext, setColumnContext] = useState<{ rowId: string; columnId: string } | null>(null);

    const selectedIndex = blocks.findIndex(b => b.id === selectedBlockId);

    const handleAddToColumn = (rowId: string, columnId: string) => {
        setColumnContext({ rowId, columnId });
    };

    const handleAddElement = (type: BlockType) => {
        if (columnContext) {
            addBlockToColumn(columnContext.rowId, columnContext.columnId, type);
            setColumnContext(null);
        }
    };

    const elements: Array<{ type: BlockType; label: string }> = [
        { type: 'heading', label: 'Heading' },
        { type: 'text', label: 'Text' },
        { type: 'image', label: 'Image' },
        { type: 'link', label: 'Button' },
        { type: 'spacer', label: 'Spacer' },
    ];

    return (
        <div className="flex-1 bg-gray-50 dark:bg-neutral-900 p-8 overflow-y-auto">
            {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="text-gray-400 dark:text-gray-500 mb-2">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                            No content yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Click elements from the left to add content
                        </p>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 min-h-[600px]">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="relative group">
                            {selectedBlockId === block.id && (
                                <div className="absolute -left-12 top-0 flex flex-col gap-1">
                                    <button
                                        onClick={() => moveBlock(index, index - 1)}
                                        disabled={index === 0}
                                        className="p-1 rounded bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move up"
                                    >
                                        <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </button>
                                    <button
                                        onClick={() => moveBlock(index, index + 1)}
                                        disabled={index === blocks.length - 1}
                                        className="p-1 rounded bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move down"
                                    >
                                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    </button>
                                    <button
                                        onClick={() => removeBlock(block.id)}
                                        className="p-1 rounded bg-white dark:bg-neutral-700 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            )}
                            <BlockRenderer
                                block={block}
                                isEditing={true}
                                onSelect={selectBlock}
                                selectedBlockId={selectedBlockId}
                                onAddToColumn={handleAddToColumn}
                                onRemoveBlock={removeBlock}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for adding to column */}
            {columnContext && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setColumnContext(null)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Element to Column</h3>
                            <button
                                onClick={() => setColumnContext(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {elements.map((element) => (
                                <button
                                    key={element.type}
                                    onClick={() => handleAddElement(element.type)}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-left"
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {element.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
