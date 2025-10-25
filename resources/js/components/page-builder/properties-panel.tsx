import { useState } from 'react';
import { usePageBuilder } from '@/contexts/page-builder-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Block } from '@/types/page-builder';

export function PropertiesPanel() {
    const { sections, selectedBlockId, updateBlock } = usePageBuilder();
    const [uploading, setUploading] = useState(false);
    
    // Find block recursively (including nested blocks in sections)
    const findBlock = (blocks: Block[], id: string | null): Block | undefined => {
        if (!id) return undefined;
        
        for (const block of blocks) {
            if (block.id === id) return block;
            
            // Search in row columns
            if (block.type === 'row') {
                for (const col of block.data.columns) {
                    const found = findBlock(col.blocks, id);
                    if (found) return found;
                }
            }
            
            // Search in card blocks
            if (block.type === 'card') {
                const found = findBlock(block.data.blocks, id);
                if (found) return found;
            }
        }
        
        return undefined;
    };
    
    // Search through all sections to find the selected block
    const findBlockInSections = (id: string | null): Block | undefined => {
        if (!id) return undefined;
        
        for (const section of sections) {
            const found = findBlock(section.blocks, id);
            if (found) return found;
        }
        
        return undefined;
    };
    
    const selectedBlock = findBlockInSections(selectedBlockId);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedBlock) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Get CSRF token from meta tag
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            
            if (response.ok && data.url) {
                updateBlock(selectedBlock.id, { src: data.url });
            } else {
                throw new Error(data.message || 'Failed to upload image');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (!selectedBlock) {
        return (
            <div className="w-80 bg-white dark:bg-neutral-800 border-l border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-center h-full text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select an element to edit its properties
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white dark:bg-neutral-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Properties
            </h3>

            <div className="space-y-4">
                {selectedBlock.type === 'heading' && (
                    <>
                        <div>
                            <Label>Text</Label>
                            <Input
                                value={selectedBlock.data.text}
                                onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Level</Label>
                            <select
                                value={selectedBlock.data.level}
                                onChange={(e) => updateBlock(selectedBlock.id, { level: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="h1">H1</option>
                                <option value="h2">H2</option>
                                <option value="h3">H3</option>
                                <option value="h4">H4</option>
                                <option value="h5">H5</option>
                                <option value="h6">H6</option>
                            </select>
                        </div>
                        <div>
                            <Label>Alignment</Label>
                            <select
                                value={selectedBlock.data.alignment || 'left'}
                                onChange={(e) => updateBlock(selectedBlock.id, { alignment: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div>
                            <Label>Color</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={selectedBlock.data.color || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                    className="h-10 w-16 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={selectedBlock.data.color || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                    placeholder="#000000"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'text' && (
                    <>
                        <div>
                            <Label>Content</Label>
                            <Textarea
                                value={selectedBlock.data.content}
                                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                rows={6}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Font Size</Label>
                            <Input
                                value={selectedBlock.data.fontSize || '16px'}
                                onChange={(e) => updateBlock(selectedBlock.id, { fontSize: e.target.value })}
                                placeholder="16px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Alignment</Label>
                            <select
                                value={selectedBlock.data.alignment || 'left'}
                                onChange={(e) => updateBlock(selectedBlock.id, { alignment: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                                <option value="justify">Justify</option>
                            </select>
                        </div>
                        <div>
                            <Label>Color</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={selectedBlock.data.color || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                    className="h-10 w-16 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={selectedBlock.data.color || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                    placeholder="#000000"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'list' && (
                    <>
                        <div>
                            <Label>List Type</Label>
                            <select
                                value={selectedBlock.data.listType || 'bullet'}
                                onChange={(e) => updateBlock(selectedBlock.id, { listType: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="bullet">Bullet List</option>
                                <option value="numbered">Numbered List</option>
                            </select>
                        </div>
                        <div>
                            <Label>Items (one per line)</Label>
                            <Textarea
                                value={selectedBlock.data.items.join('\n')}
                                onChange={(e) => updateBlock(selectedBlock.id, { items: e.target.value.split('\n') })}
                                rows={6}
                                className="mt-1"
                                placeholder="Item 1\nItem 2\nItem 3"
                            />
                        </div>
                        <div>
                            <Label>Font Size</Label>
                            <Input
                                value={selectedBlock.data.fontSize || '16px'}
                                onChange={(e) => updateBlock(selectedBlock.id, { fontSize: e.target.value })}
                                placeholder="16px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Line Height / Spacing</Label>
                            <Input
                                value={selectedBlock.data.lineHeight || '1.6'}
                                onChange={(e) => updateBlock(selectedBlock.id, { lineHeight: e.target.value })}
                                placeholder="1.6"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Color</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={selectedBlock.data.color || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                    className="h-10 w-16 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={selectedBlock.data.color || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                    placeholder="#000000"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'gallery' && (
                    <>
                        <div>
                            <Label>Gallery Style</Label>
                            <select
                                value={selectedBlock.data.style || 'grid-3'}
                                onChange={(e) => updateBlock(selectedBlock.id, { style: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="single">Single Column</option>
                                <option value="grid-2">2 Columns Grid</option>
                                <option value="grid-3">3 Columns Grid</option>
                            </select>
                        </div>
                        <div>
                            <Label>Gap Between Images</Label>
                            <Input
                                value={selectedBlock.data.gap || '16px'}
                                onChange={(e) => updateBlock(selectedBlock.id, { gap: e.target.value })}
                                placeholder="16px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Images</Label>
                            <div className="space-y-3 mt-2">
                                {selectedBlock.data.images.map((image: any, index: number) => (
                                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Image {index + 1}</span>
                                            <button
                                                onClick={() => {
                                                    const newImages = selectedBlock.data.images.filter((_: any, i: number) => i !== index);
                                                    updateBlock(selectedBlock.id, { images: newImages });
                                                }}
                                                className="text-red-600 hover:text-red-700 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="text-xs">Upload Image</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('image', file);

                                                    try {
                                                        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                                                        const response = await fetch('/upload-image', {
                                                            method: 'POST',
                                                            body: formData,
                                                            headers: {
                                                                'X-CSRF-TOKEN': token || '',
                                                                'Accept': 'application/json',
                                                            },
                                                        });

                                                        const data = await response.json();
                                                        if (response.ok && data.url) {
                                                            const newImages = [...selectedBlock.data.images];
                                                            newImages[index] = { ...newImages[index], src: data.url };
                                                            updateBlock(selectedBlock.id, { images: newImages });
                                                        }
                                                    } catch (error) {
                                                        console.error('Upload failed:', error);
                                                    }
                                                }}
                                                className="mt-1 text-xs"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <Label className="text-xs">Or Image URL</Label>
                                            <Input
                                                value={image.src}
                                                onChange={(e) => {
                                                    const newImages = [...selectedBlock.data.images];
                                                    newImages[index] = { ...newImages[index], src: e.target.value };
                                                    updateBlock(selectedBlock.id, { images: newImages });
                                                }}
                                                placeholder="https://..."
                                                className="mt-1"
                                            />
                                        </div>
                                        <Input
                                            value={image.caption || ''}
                                            onChange={(e) => {
                                                const newImages = [...selectedBlock.data.images];
                                                newImages[index] = { ...newImages[index], caption: e.target.value };
                                                updateBlock(selectedBlock.id, { images: newImages });
                                            }}
                                            placeholder="Caption (optional)"
                                            className="text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    const newImages = [
                                        ...selectedBlock.data.images,
                                        { src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"%3E%3C/path%3E%3Ccircle cx="12" cy="13" r="4"%3E%3C/circle%3E%3C/svg%3E', alt: '', caption: '' }
                                    ];
                                    updateBlock(selectedBlock.id, { images: newImages });
                                }}
                                className="mt-2 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Add Image
                            </button>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'image' && (
                    <>
                        <div>
                            <Label>Upload Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="mt-1"
                            />
                            {uploading && (
                                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                    Uploading...
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Or Image URL</Label>
                            <Input
                                value={selectedBlock.data.src}
                                onChange={(e) => updateBlock(selectedBlock.id, { src: e.target.value })}
                                placeholder="https://..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Alt Text</Label>
                            <Input
                                value={selectedBlock.data.alt || ''}
                                onChange={(e) => updateBlock(selectedBlock.id, { alt: e.target.value })}
                                placeholder="Image description"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Width</Label>
                            <Input
                                value={selectedBlock.data.width || '100%'}
                                onChange={(e) => updateBlock(selectedBlock.id, { width: e.target.value })}
                                placeholder="100% or 400px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Border Radius</Label>
                            <Input
                                value={selectedBlock.data.borderRadius || '0'}
                                onChange={(e) => updateBlock(selectedBlock.id, { borderRadius: e.target.value })}
                                placeholder="8px"
                                className="mt-1"
                            />
                        </div>
                    </>
                )}

                {selectedBlock.type === 'link' && (
                    <>
                        <div>
                            <Label>Text</Label>
                            <Input
                                value={selectedBlock.data.text}
                                onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>URL</Label>
                            <Input
                                value={selectedBlock.data.href}
                                onChange={(e) => updateBlock(selectedBlock.id, { href: e.target.value })}
                                placeholder="https://..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Style</Label>
                            <select
                                value={selectedBlock.data.variant || 'primary'}
                                onChange={(e) => updateBlock(selectedBlock.id, { variant: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                                <option value="outline">Outline</option>
                                <option value="text">Text Link</option>
                            </select>
                        </div>
                        <div>
                            <Label>Size</Label>
                            <select
                                value={selectedBlock.data.size || 'md'}
                                onChange={(e) => updateBlock(selectedBlock.id, { size: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="sm">Small</option>
                                <option value="md">Medium</option>
                                <option value="lg">Large</option>
                            </select>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'spacer' && (
                    <>
                        <div>
                            <Label>Height</Label>
                            <Input
                                value={selectedBlock.data.height}
                                onChange={(e) => updateBlock(selectedBlock.id, { height: e.target.value })}
                                placeholder="40px"
                                className="mt-1"
                            />
                        </div>
                    </>
                )}

                {selectedBlock.type === 'video' && (
                    <>
                        <div>
                            <Label>Video URL</Label>
                            <Input
                                value={selectedBlock.data.src}
                                onChange={(e) => updateBlock(selectedBlock.id, { src: e.target.value })}
                                placeholder="YouTube or Vimeo embed URL"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Aspect Ratio</Label>
                            <select
                                value={selectedBlock.data.aspectRatio || '16/9'}
                                onChange={(e) => updateBlock(selectedBlock.id, { aspectRatio: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="16/9">16:9</option>
                                <option value="4/3">4:3</option>
                                <option value="1/1">1:1</option>
                            </select>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'card' && (
                    <>
                        <div>
                            <Label>Link URL (Optional)</Label>
                            <Input
                                value={selectedBlock.data.href || ''}
                                onChange={(e) => updateBlock(selectedBlock.id, { href: e.target.value })}
                                placeholder="https://example.com"
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for no link</p>
                        </div>
                        <div>
                            <Label>Link Target</Label>
                            <select
                                value={selectedBlock.data.target || '_self'}
                                onChange={(e) => updateBlock(selectedBlock.id, { target: e.target.value as any })}
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                            >
                                <option value="_self">Same Tab</option>
                                <option value="_blank">New Tab</option>
                            </select>
                        </div>
                        <div>
                            <Label>Background Color</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={selectedBlock.data.background || '#ffffff'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { background: e.target.value })}
                                    className="h-10 w-16 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={selectedBlock.data.background || '#ffffff'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { background: e.target.value })}
                                    placeholder="#ffffff"
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Text Color</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={selectedBlock.data.textColor || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { textColor: e.target.value })}
                                    className="h-10 w-16 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={selectedBlock.data.textColor || '#000000'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { textColor: e.target.value })}
                                    placeholder="#000000"
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Padding</Label>
                            <Input
                                value={selectedBlock.data.padding || '16px'}
                                onChange={(e) => updateBlock(selectedBlock.id, { padding: e.target.value })}
                                placeholder="16px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Border Radius</Label>
                            <Input
                                value={selectedBlock.data.borderRadius || '8px'}
                                onChange={(e) => updateBlock(selectedBlock.id, { borderRadius: e.target.value })}
                                placeholder="8px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Border Color</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    type="color"
                                    value={selectedBlock.data.borderColor || '#e5e7eb'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { borderColor: e.target.value })}
                                    className="h-10 w-16 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={selectedBlock.data.borderColor || '#e5e7eb'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { borderColor: e.target.value })}
                                    placeholder="#e5e7eb"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </>
                )}

                {selectedBlock.type === 'row' && (
                    <>
                        <div>
                            <Label>Number of Columns</Label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={selectedBlock.data.columns.length}
                                onChange={(e) => {
                                    const newCount = parseInt(e.target.value) || 1;
                                    const currentColumns = selectedBlock.data.columns;
                                    const currentCount = currentColumns.length;
                                    
                                    let newColumns;
                                    if (newCount > currentCount) {
                                        // Add new columns
                                        const columnsToAdd = newCount - currentCount;
                                        const widthPerColumn = Math.floor(12 / newCount);
                                        newColumns = [
                                            ...currentColumns.map(col => ({ ...col, width: widthPerColumn })),
                                            ...Array(columnsToAdd).fill(null).map(() => ({
                                                id: Math.random().toString(36).substr(2, 9),
                                                width: widthPerColumn,
                                                blocks: []
                                            }))
                                        ];
                                    } else {
                                        // Remove columns from the end
                                        newColumns = currentColumns.slice(0, newCount);
                                        const widthPerColumn = Math.floor(12 / newCount);
                                        newColumns = newColumns.map(col => ({ ...col, width: widthPerColumn }));
                                    }
                                    
                                    updateBlock(selectedBlock.id, { columns: newColumns });
                                }}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1-12 columns</p>
                        </div>
                        <div>
                            <Label>Gap Between Columns</Label>
                            <Input
                                value={selectedBlock.data.gap || '8px'}
                                onChange={(e) => updateBlock(selectedBlock.id, { gap: e.target.value })}
                                placeholder="8px"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Padding</Label>
                            <Input
                                value={selectedBlock.data.padding || '0'}
                                onChange={(e) => updateBlock(selectedBlock.id, { padding: e.target.value })}
                                placeholder="0"
                                className="mt-1"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
