import { useState } from 'react';
import { usePageBuilder } from '@/contexts/page-builder-context';
import { BlockRenderer } from './block-renderer';
import { ChevronUp, ChevronDown, Trash2, X, Plus } from 'lucide-react';
import { BlockType } from '@/types/page-builder';

export function Canvas() {
    const { sections, selectedBlockId, selectedSectionId, selectBlock, selectSection, removeBlock, moveBlock, addBlockToColumn, addBlock } = usePageBuilder();
    const [columnContext, setColumnContext] = useState<{ rowId: string; columnId: string } | null>(null);
    const [sectionContext, setSectionContext] = useState<string | null>(null);

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
        { type: 'row', label: 'Row (Columns)' },
        { type: 'spacer', label: 'Spacer' },
    ];

    return (
        <div className="flex-1 bg-gray-50 dark:bg-neutral-900 p-8 overflow-y-auto">
            {sections.length === 0 ? (
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
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-12 gap-4">
                              {sections.map((section) => (
                            <div 
                                key={section.id}
                                className={`col-span-${section.width} min-h-[400px]`}
                                style={{ gridColumn: `span ${section.width}` }}
                            >
                                <div 
                                    className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 min-h-[400px] border-2 transition-colors ${
                                        selectedSectionId === section.id 
                                            ? 'border-blue-500 dark:border-blue-400' 
                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    onClick={() => selectSection(section.id)}
                                >
                                    {section.blocks.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSectionContext(section.id);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    <Plus className="w-4 h-4 inline mr-2" />
                                                    Add Element
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {section.blocks.map((block, index) => (
                                                <div key={block.id} className="relative group">
                                                    {selectedBlockId === block.id && (
                                                        <div className="absolute -left-12 top-0 flex flex-col gap-1">
                                                            <button
                                                                onClick={() => moveBlock(section.id, index, index - 1)}
                                                                disabled={index === 0}
                                                                className="p-1 rounded bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-30"
                                                            >
                                                                <ChevronUp className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => moveBlock(section.id, index, index + 1)}
                                                                disabled={index === section.blocks.length - 1}
                                                                className="p-1 rounded bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-600 disabled:opacity-30"
                                                            >
                                                                <ChevronDown className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeBlock(block.id)}
                                                                className="p-1 rounded bg-white dark:bg-neutral-700 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900"
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
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSectionContext(section.id);
                                                    }}
                                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Element
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal for adding element to section */}
            {sectionContext && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSectionContext(null)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Element</h3>
                            <button
                                onClick={() => setSectionContext(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {elements.map((element) => (
                                <button
                                    key={element.type}
                                    onClick={() => {
                                        addBlock(sectionContext, element.type);
                                        setSectionContext(null);
                                    }}
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
