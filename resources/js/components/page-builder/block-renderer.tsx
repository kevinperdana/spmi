import { Block } from '@/types/page-builder';
import { Plus, Trash2, X } from 'lucide-react';

interface BlockRendererProps {
    block: Block;
    isEditing?: boolean;
    onSelect?: (blockId: string) => void;
    selectedBlockId?: string | null;
    onAddToColumn?: (rowId: string, columnId: string) => void;
    onAddToCard?: (cardId: string) => void;
    onRemoveBlock?: (blockId: string) => void;
    onUpdateBlock?: (id: string, data: Partial<Block['data']>) => void;
}

export function BlockRenderer({ block, isEditing = false, onSelect, selectedBlockId = null, onAddToColumn, onAddToCard, onRemoveBlock, onUpdateBlock }: BlockRendererProps) {
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

        case 'list':
            const ListTag = block.data.listType === 'numbered' ? 'ol' : 'ul';
            const listClass = block.data.listType === 'numbered' ? 'list-decimal' : 'list-disc';
            
            return (
                <div className={`${wrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <ListTag 
                        className={`${listClass} pl-6`}
                        style={{ 
                            color: block.data.color || 'inherit',
                            fontSize: block.data.fontSize || '16px',
                            lineHeight: block.data.lineHeight || '1.6'
                        }}
                    >
                        {block.data.items.map((item, index) => (
                            <li key={index} className="mb-2">{item}</li>
                        ))}
                    </ListTag>
                </div>
            );

        case 'image':
            const imageAlignment = block.data.alignment || 'left';
            const imageClass = imageAlignment === 'center' ? 'mx-auto' : imageAlignment === 'right' ? 'ml-auto' : '';
            const isCameraPlaceholder = block.data.src?.includes('data:image/svg+xml');
            
            return (
                <div className={`${wrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <img
                        src={block.data.src}
                        alt={block.data.alt || ''}
                        className={isCameraPlaceholder ? 'mx-auto' : imageClass}
                        style={{
                            width: isCameraPlaceholder ? '80px' : (block.data.width || 'auto'),
                            height: isCameraPlaceholder ? '80px' : (block.data.height || 'auto'),
                            objectFit: block.data.objectFit || 'cover',
                            borderRadius: block.data.borderRadius || '0',
                            display: 'block',
                            opacity: isCameraPlaceholder ? '0.4' : '1',
                        }}
                    />
                </div>
            );

        case 'gallery':
            const galleryStyle = block.data.style || 'grid-3';
            const gridCols = {
                'single': 'grid-cols-1',
                'grid-2': 'grid-cols-2',
                'grid-3': 'grid-cols-3'
            };
            
            return (
                <div className={`${wrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <div 
                        className={`grid ${gridCols[galleryStyle]}`}
                        style={{ gap: block.data.gap || '16px' }}
                    >
                        {block.data.images.map((image, index) => {
                            const isCameraPlaceholder = image.src?.includes('data:image/svg+xml');
                            return (
                                <div key={index} className="relative">
                                    <div className={`w-full h-64 rounded-lg ${isCameraPlaceholder ? 'bg-gray-100 dark:bg-gray-800 flex items-center justify-center' : ''}`}>
                                        <img
                                            src={image.src}
                                            alt={image.alt || ''}
                                            className={isCameraPlaceholder ? '' : 'w-full h-64 object-cover rounded-lg'}
                                            style={{
                                                width: isCameraPlaceholder ? '60px' : undefined,
                                                height: isCameraPlaceholder ? '60px' : undefined,
                                                opacity: isCameraPlaceholder ? '0.3' : '1',
                                            }}
                                        />
                                    </div>
                                    {image.caption && (
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                                            {image.caption}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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
            
            // Make sure href is absolute/standalone URL
            const normalizeButtonUrl = (url: string) => {
                if (!url) return url;
                // If URL doesn't start with http://, https://, //, or mailto:, add https://
                if (!url.match(/^(https?:\/\/|mailto:|tel:|#|\/\/)/)) {
                    return 'https://' + url;
                }
                return url;
            };

            return (
                <div className={`${wrapperClass} ${linkWrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <a
                        href={normalizeButtonUrl(block.data.href)}
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
            const CardWrapper = block.data.href && !isEditing ? 'a' : 'div';
            // Make sure href is absolute/standalone URL
            const normalizeUrl = (url: string) => {
                if (!url) return url;
                // If URL doesn't start with http://, https://, //, or mailto:, add https://
                if (!url.match(/^(https?:\/\/|mailto:|tel:|#|\/\/)/)) {
                    return 'https://' + url;
                }
                return url;
            };
            const cardProps = block.data.href && !isEditing ? {
                href: normalizeUrl(block.data.href),
                target: block.data.target || '_self',
                rel: block.data.target === '_blank' ? 'noopener noreferrer' : undefined,
            } : {};
            
            return (
                <CardWrapper
                    {...cardProps}
                    className={`${wrapperClass} mb-4 ${block.data.href && !isEditing ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                    onClick={(e) => {
                        // Only handle click if clicking on the card itself, not children
                        if (e.target === e.currentTarget) {
                            handleClick();
                        }
                    }}
                    style={{
                        display: 'block',
                        padding: block.data.padding || '16px',
                        background: block.data.background || '#ffffff',
                        color: block.data.textColor || 'inherit',
                        borderColor: block.data.borderColor || '#e5e7eb',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: block.data.borderRadius || '8px',
                        boxShadow: block.data.shadow || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        textDecoration: 'none',
                    }}
                >
                    {block.data.blocks && block.data.blocks.length > 0 ? (
                        <div className="[&>*:last-child_*]:!mb-0">
                            {block.data.blocks.map((childBlock, idx) => (
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
                                        onAddToCard={onAddToCard}
                                        onRemoveBlock={onRemoveBlock}
                                        onUpdateBlock={onUpdateBlock}
                                    />
                                </div>
                            ))}
                            {isEditing && onAddToCard && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCard(block.id);
                                    }}
                                    className="w-full py-0.5 text-xs text-gray-400 hover:text-blue-600 border border-dashed border-gray-200 rounded hover:border-blue-600 transition-colors"
                                >
                                    <Plus className="w-3 h-3 inline mr-1" />
                                    Add Element
                                </button>
                            )}
                        </div>
                    ) : (
                        isEditing && onAddToCard && (
                            <div className="flex items-center justify-center min-h-[80px]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCard(block.id);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-500 hover:text-blue-600 border border-dashed border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4 inline mr-2" />
                                    Add Element to Card
                                </button>
                            </div>
                        )
                    )}
                </CardWrapper>
            );

        case 'table':
            return (
                <div className={`${wrapperClass} mb-4`} onClick={(e) => handleClick(e)}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                            <thead>
                                <tr>
                                    {block.data.headers.map((header: string, colIdx: number) => (
                                        <th key={colIdx} className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-neutral-700 text-left relative group/header">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={header}
                                                    onChange={(e) => {
                                                        const newHeaders = [...block.data.headers];
                                                        newHeaders[colIdx] = e.target.value;
                                                        onUpdateBlock?.(block.id, { headers: newHeaders });
                                                    }}
                                                    className="w-full bg-transparent border-none outline-none font-semibold"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className="font-semibold">{header}</span>
                                            )}
                                            {isEditing && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newHeaders = block.data.headers.filter((_: any, i: number) => i !== colIdx);
                                                        const newRows = block.data.rows.map((row: string[]) => row.filter((_: any, i: number) => i !== colIdx));
                                                        onUpdateBlock?.(block.id, { headers: newHeaders, rows: newRows });
                                                    }}
                                                    className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover/header:opacity-100 transition-opacity"
                                                    title="Delete column"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </th>
                                    ))}
                                    {isEditing && (
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 bg-gray-50 dark:bg-neutral-700">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newHeaders = [...block.data.headers, `Column ${block.data.headers.length + 1}`];
                                                    const newRows = block.data.rows.map((row: any[]) => [...row, { text: '', href: '' }]);
                                                    onUpdateBlock?.(block.id, { headers: newHeaders, rows: newRows });
                                                }}
                                                className="text-blue-600 hover:text-blue-700"
                                                title="Add column"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {block.data.rows.map((row: any[], rowIdx: number) => (
                                    <tr key={rowIdx} className="group/row">
                                        {row.map((cell: any, colIdx: number) => {
                                            // Support both old string format and new object format
                                            const cellData = typeof cell === 'string' ? { text: cell, href: '' } : cell;
                                            const normalizeUrl = (url: string) => {
                                                if (!url) return url;
                                                if (!url.match(/^(https?:\/\/|mailto:|tel:|#|\/\/)/)) {
                                                    return 'https://' + url;
                                                }
                                                return url;
                                            };
                                            
                                            return (
                                                <td key={colIdx} className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                value={cellData.text}
                                                                onChange={(e) => {
                                                                    const newRows = [...block.data.rows];
                                                                    newRows[rowIdx][colIdx] = { ...cellData, text: e.target.value };
                                                                    onUpdateBlock?.(block.id, { rows: newRows });
                                                                }}
                                                                placeholder="Cell text"
                                                                className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={cellData.href || ''}
                                                                onChange={(e) => {
                                                                    const newRows = [...block.data.rows];
                                                                    newRows[rowIdx][colIdx] = { ...cellData, href: e.target.value };
                                                                    onUpdateBlock?.(block.id, { rows: newRows });
                                                                }}
                                                                placeholder="🔗 Link URL (optional)"
                                                                className="w-full bg-transparent border-none outline-none text-xs text-gray-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    ) : (
                                                        cellData.href ? (
                                                            <a 
                                                                href={normalizeUrl(cellData.href)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600"
                                                            >
                                                                {cellData.text}
                                                            </a>
                                                        ) : (
                                                            cellData.text
                                                        )
                                                    )}
                                                </td>
                                            );
                                        })}
                                        {isEditing && (
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newRows = block.data.rows.filter((_: any, i: number) => i !== rowIdx);
                                                        onUpdateBlock?.(block.id, { rows: newRows });
                                                    }}
                                                    className="text-red-600 hover:text-red-700 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {isEditing && (
                                    <tr>
                                        <td colSpan={block.data.headers.length + 1} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newRow = new Array(block.data.headers.length).fill(null).map(() => ({ text: '', href: '' }));
                                                    onUpdateBlock?.(block.id, { rows: [...block.data.rows, newRow] });
                                                }}
                                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1 mx-auto"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Row
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                            gap: block.data.gap || '8px',
                            padding: block.data.padding || '0',
                        }}
                    >
                    {block.data.columns.map((column) => (
                        <div
                            key={column.id}
                            className="relative p-1"
                            style={{
                                gridColumn: `span ${column.width}`,
                                minWidth: 0,
                            }}
                        >
                            {isEditing && (
                                <div className="mb-2 border border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-neutral-900" style={{ boxSizing: 'border-box' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToColumn?.(block.id, column.id);
                                        }}
                                        className="w-full py-0.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
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
                                        onAddToCard={onAddToCard}
                                        onRemoveBlock={onRemoveBlock}
                                        onUpdateBlock={onUpdateBlock}
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
