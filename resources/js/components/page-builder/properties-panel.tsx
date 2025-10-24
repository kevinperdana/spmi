import { useState } from 'react';
import { usePageBuilder } from '@/contexts/page-builder-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Block } from '@/types/page-builder';

export function PropertiesPanel() {
    const { blocks, selectedBlockId, updateBlock } = usePageBuilder();
    const [uploading, setUploading] = useState(false);
    
    // Find block recursively (including nested blocks)
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
    
    const selectedBlock = findBlock(blocks, selectedBlockId);

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
                            <Input
                                type="color"
                                value={selectedBlock.data.color || '#000000'}
                                onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                className="mt-1 h-10"
                            />
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
                            <Input
                                type="color"
                                value={selectedBlock.data.color || '#000000'}
                                onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                                className="mt-1 h-10"
                            />
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
            </div>
        </div>
    );
}
