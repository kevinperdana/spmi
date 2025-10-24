import { Block } from '@/types/page-builder';
import { Plus, Trash2 } from 'lucide-react';

interface BlockRendererProps {
    block: Block;
    isEditing?: boolean;
    onSelect?: (blockId: string) => void;
    selectedBlockId?: string | null;
    onAddToColumn?: (rowId: string, columnId: string) => void;
    onRemoveBlock?: (blockId: string) => void;
}

export function BlockRenderer({ block, isEditing = false, onSelect, selectedBlockId = null, onAddToColumn, onRemoveBlock }: BlockRendererProps) {
    const isSelected = selectedBlockId === block.id;
    const handleClick = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        if (isEditing && onSelect) {
            onSelect(block.id);
        }
    };

    const wrapperClass = isEditing
        ? `cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}`
        : '';

    switch (block.type) {
        case 'heading':
            return (
                <div
                    className={wrapperClass}
                    onClick={(e) => handleClick(e)}
                    style={{
                        textAlign: block.data.alignment || 'left',
                        color: block.data.color || 'inherit',
                    }}
                >
                    {block.data.level === 'h1' && (
                        <h1 className="text-4xl font-bold mb-4">{block.data.text}</h1>
                    )}
                    {block.data.level === 'h2' && (
                        <h2 className="text-3xl font-bold mb-3">{block.data.text}</h2>
                    )}
                    {block.data.level === 'h3' && (
                        <h3 className="text-2xl font-bold mb-3">{block.data.text}</h3>
                    )}
                    {block.data.level === 'h4' && (
                        <h4 className="text-xl font-bold mb-2">{block.data.text}</h4>
                    )}
                    {block.data.level === 'h5' && (
                        <h5 className="text-lg font-bold mb-2">{block.data.text}</h5>
                    )}
                    {block.data.level === 'h6' && (
                        <h6 className="text-base font-bold mb-2">{block.data.text}</h6>
                    )}
                </div>
            );

        case 'text':
            return (
                <div
                    className={wrapperClass}
                    onClick={(e) => handleClick(e)}
                    style={{
                        fontSize: block.data.fontSize || '16px',
                        color: block.data.color || 'inherit',
                        textAlign: block.data.alignment || 'left',
                        lineHeight: block.data.lineHeight || '1.6',
                    }}
                >
                    <p className="mb-4">{block.data.content}</p>
                </div>
            );

        case 'image':
            const imageAlignment = block.data.alignment || 'left';
            const imageClass = imageAlignment === 'center' ? 'mx-auto' : imageAlignment === 'right' ? 'ml-auto' : '';
            
            return (
                <div className={`${wrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <img
                        src={block.data.src}
                        alt={block.data.alt || ''}
                        className={imageClass}
                        style={{
                            width: block.data.width || 'auto',
                            height: block.data.height || 'auto',
                            objectFit: block.data.objectFit || 'cover',
                            borderRadius: block.data.borderRadius || '0',
                            display: 'block',
                        }}
                    />
                </div>
            );

        case 'link':
            const linkAlignment = block.data.alignment || 'left';
            const linkWrapperClass = linkAlignment === 'center' ? 'text-center' : linkAlignment === 'right' ? 'text-right' : '';
            
            const variantClasses = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700',
                secondary: 'bg-gray-600 text-white hover:bg-gray-700',
                outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
                text: 'text-blue-600 hover:underline',
            };

            const sizeClasses = {
                sm: 'px-3 py-1.5 text-sm',
                md: 'px-4 py-2 text-base',
                lg: 'px-6 py-3 text-lg',
            };

            const variant = block.data.variant || 'primary';
            const size = block.data.size || 'md';

            return (
                <div className={`${wrapperClass} ${linkWrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <a
                        href={block.data.href}
                        target={block.data.target || '_self'}
                        className={`inline-block rounded-lg font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]}`}
                    >
                        {block.data.text}
                    </a>
                </div>
            );

        case 'spacer':
            return (
                <div
                    className={wrapperClass}
                    onClick={(e) => handleClick(e)}
                    style={{
                        height: block.data.height,
                        background: block.data.background || 'transparent',
                    }}
                />
            );

        case 'video':
            const aspectRatios = {
                '16/9': 'aspect-video',
                '4/3': 'aspect-[4/3]',
                '1/1': 'aspect-square',
            };
            const aspectRatio = block.data.aspectRatio || '16/9';

            return (
                <div className={`${wrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <div className={aspectRatios[aspectRatio]}>
                        <iframe
                            src={block.data.src}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                            allow={block.data.autoplay ? 'autoplay' : ''}
                        />
                    </div>
                </div>
            );

        case 'card':
            return (
                <div
                    className={`${wrapperClass} mb-4`}
                    onClick={(e) => {
                        // Only handle click if clicking on the card itself, not children
                        if (e.target === e.currentTarget) {
                            handleClick();
                        }
                    }}
                    style={{
                        padding: block.data.padding || '16px',
                        background: block.data.background || '#ffffff',
                        borderColor: block.data.borderColor || '#e5e7eb',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: block.data.borderRadius || '8px',
                        boxShadow: block.data.shadow || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    }}
                >
                    {block.data.blocks.map((childBlock) => (
                        <BlockRenderer
                            key={childBlock.id}
                            block={childBlock}
                            isEditing={isEditing}
                            onSelect={onSelect}
                            selectedBlockId={selectedBlockId}
                            onRemoveBlock={onRemoveBlock}
                        />
                    ))}
                </div>
            );

        case 'row':
            return (
                <div className="relative group mb-4">
                    {isEditing && isSelected && onRemoveBlock && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveBlock(block.id);
                            }}
                            className="absolute -top-8 right-0 p-1 rounded bg-white dark:bg-neutral-700 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete row"
                        >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                    )}
                    <div
                        className={wrapperClass}
                        onClick={(e) => {
                            // Only handle click if clicking on the row itself, not children
                            if (e.target === e.currentTarget) {
                                handleClick();
                            }
                        }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(12, 1fr)`,
                            gap: block.data.gap || '16px',
                            padding: block.data.padding || '0',
                        }}
                    >
                    {block.data.columns.map((column) => (
                        <div
                            key={column.id}
                            className="relative"
                            style={{
                                gridColumn: `span ${column.width}`,
                                minWidth: 0,
                            }}
                        >
                            {isEditing && (
                                <div className="mb-2 px-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-neutral-900" style={{ boxSizing: 'border-box' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToColumn?.(block.id, column.id);
                                        }}
                                        className="w-full py-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                                        title="Add element to column"
                                    >
                                        <Plus className="w-3 h-3 flex-shrink-0" />
                                    </button>
                                </div>
                            )}
                            {column.blocks.map((childBlock) => (
                                <div key={childBlock.id} className="relative group">
                                    {isEditing && selectedBlockId === childBlock.id && onRemoveBlock && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveBlock(childBlock.id);
                                            }}
                                            className="absolute -right-8 top-0 p-1 rounded bg-white dark:bg-neutral-700 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900 z-10"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    )}
                                    <BlockRenderer
                                        block={childBlock}
                                        isEditing={isEditing}
                                        onSelect={onSelect}
                                        selectedBlockId={selectedBlockId}
                                        onAddToColumn={onAddToColumn}
                                        onRemoveBlock={onRemoveBlock}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
}
