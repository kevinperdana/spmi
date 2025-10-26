import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Type, AlignLeft, ImagePlus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
}

interface Column {
    id: string;
    width: number; // 1-12 (Tailwind grid)
    card: boolean;
    elements: ColumnElement[];
}

interface Row {
    id: string;
    columns: Column[];
}

interface BackgroundConfig {
    type: 'solid' | 'gradient';
    color?: string;
    gradient?: {
        color1: string;
        color2: string;
        angle: number;
    };
}

interface HomeSection {
    id: number;
    layout_type: string;
    section_type: string;
    background_color: string;
    background_config?: BackgroundConfig;
    content: {
        rows?: Row[];
        columns?: Column[]; // Legacy support
    };
    order: number;
    is_active: boolean;
}

interface Props {
    section: HomeSection;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home Sections',
        href: '/home-sections',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

const LAYOUT_TYPES = [
    { value: 'full-width', label: 'Full Width', description: 'Main (12-col)', columns: 1, bars: [12] },
    { value: '2-equal', label: '2 Equal Columns', description: 'Left (6-col) + Right (6-col)', columns: 2, bars: [6, 6] },
    { value: '3-equal', label: '3 Equal Columns', description: '4-col + 4-col + 4-col', columns: 3, bars: [4, 4, 4] },
    { value: '4-equal', label: '4 Equal Columns', description: '3-col + 3-col + 3-col + 3-col', columns: 4, bars: [3, 3, 3, 3] },
    { value: '2-sidebar-left', label: '2 Columns (Sidebar Left)', description: 'Left (4-col) + Right (8-col)', columns: 2, bars: [4, 8] },
    { value: '2-sidebar-right', label: '2 Columns (Sidebar Right)', description: 'Left (8-col) + Right (4-col)', columns: 2, bars: [8, 4] },
];

const SECTION_TYPES = [
    { value: 'plain', label: 'Plain', description: 'No background card' },
    { value: 'card', label: 'Card', description: 'White background card' },
];

export default function Edit({ section }: Props) {
    // Convert legacy columns structure to new rows structure if needed
    const convertLegacyContent = () => {
        if (section.content.rows && section.content.rows.length > 0) {
            return section.content;
        }
        
        // Legacy columns - convert to rows structure
        if (section.content.columns && section.content.columns.length > 0) {
            const legacyColumns = section.content.columns.map((col, index) => ({
                id: `col-${Date.now()}-${index}`,
                width: 6, // Default width for legacy columns
                card: col.card,
                elements: col.elements
            }));
            
            return {
                rows: [{
                    id: `row-${Date.now()}`,
                    columns: legacyColumns
                }]
            };
        }
        
        // Empty content
        return {
            rows: [{
                id: `row-${Date.now()}`,
                columns: [{
                    id: `col-${Date.now()}`,
                    width: 12,
                    card: section.section_type === 'card',
                    elements: []
                }]
            }]
        };
    };

    const { data, setData, put, processing, errors } = useForm({
        layout_type: section.layout_type,
        section_type: section.section_type,
        background_color: section.background_color,
        background_config: section.background_config || {
            type: 'solid',
            color: section.background_color || '#ffffff',
            gradient: {
                color1: '#3b82f6',
                color2: '#8b5cf6',
                angle: 90
            }
        } as BackgroundConfig,
        content: convertLegacyContent(),
        is_active: section.is_active,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/home-sections/${section.id}`);
    };

    const addRow = () => {
        const newRow: Row = {
            id: `row-${Date.now()}`,
            columns: [{
                id: `col-${Date.now()}`,
                width: 12,
                card: data.section_type === 'card',
                elements: []
            }]
        };
        setData('content', { rows: [...data.content.rows, newRow] });
    };

    const removeRow = (rowIndex: number) => {
        const newRows = [...data.content.rows];
        newRows.splice(rowIndex, 1);
        setData('content', { rows: newRows });
    };

    const addColumn = (rowIndex: number) => {
        const newRows = [...data.content.rows];
        const newColumn: Column = {
            id: `col-${Date.now()}`,
            width: 6,
            card: data.section_type === 'card',
            elements: []
        };
        newRows[rowIndex].columns.push(newColumn);
        setData('content', { rows: newRows });
    };

    const removeColumn = (rowIndex: number, colIndex: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns.splice(colIndex, 1);
        setData('content', { rows: newRows });
    };

    const updateColumnWidth = (rowIndex: number, colIndex: number, width: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].width = width;
        setData('content', { rows: newRows });
    };

    const toggleColumnCard = (rowIndex: number, colIndex: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].card = !newRows[rowIndex].columns[colIndex].card;
        setData('content', { rows: newRows });
    };

    const addElement = (rowIndex: number, colIndex: number, type: 'heading' | 'text' | 'image') => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].elements.push({ type, value: '' });
        setData('content', { rows: newRows });
    };

    const updateElement = (rowIndex: number, colIndex: number, elementIndex: number, value: string) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].elements[elementIndex].value = value;
        setData('content', { rows: newRows });
    };

    const removeElement = (rowIndex: number, colIndex: number, elementIndex: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].elements.splice(elementIndex, 1);
        setData('content', { rows: newRows });
    };

    const handleImageUpload = async (rowIndex: number, colIndex: number, elementIndex: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/upload-image', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                const result = await response.json();
                updateElement(rowIndex, colIndex, elementIndex, result.url);
            } catch (error) {
                console.error('Upload failed:', error);
            }
        };
        
        input.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Section" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/home-sections">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Edit Section
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-6 space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Content</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {LAYOUT_TYPES.find(l => l.value === data.layout_type)?.label || 'Layout'}
                                    {' • '}
                                    {data.section_type === 'card' ? 'Card style' : 'Plain style'}
                                </p>
                            </div>

                            {/* Background Configuration */}
                            <div className="space-y-4">
                                <Label>Background</Label>
                                
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('background_config', { ...data.background_config, type: 'solid' })}
                                        className={`px-4 py-2 rounded-md border transition-colors ${
                                            data.background_config.type === 'solid'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        Solid Color
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('background_config', { ...data.background_config, type: 'gradient' })}
                                        className={`px-4 py-2 rounded-md border transition-colors ${
                                            data.background_config.type === 'gradient'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        Gradient
                                    </button>
                                </div>

                                {data.background_config.type === 'solid' && (
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={data.background_config.color}
                                            onChange={(e) => setData('background_config', { 
                                                ...data.background_config, 
                                                color: e.target.value 
                                            })}
                                            className="w-20 h-10"
                                        />
                                        <Input
                                            type="text"
                                            value={data.background_config.color}
                                            onChange={(e) => setData('background_config', { 
                                                ...data.background_config, 
                                                color: e.target.value 
                                            })}
                                            placeholder="#ffffff"
                                            className="flex-1"
                                        />
                                    </div>
                                )}

                                {data.background_config.type === 'gradient' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-sm">Color 1</Label>
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        type="color"
                                                        value={data.background_config.gradient?.color1}
                                                        onChange={(e) => setData('background_config', {
                                                            ...data.background_config,
                                                            gradient: { ...data.background_config.gradient!, color1: e.target.value }
                                                        })}
                                                        className="w-16 h-10"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.background_config.gradient?.color1}
                                                        onChange={(e) => setData('background_config', {
                                                            ...data.background_config,
                                                            gradient: { ...data.background_config.gradient!, color1: e.target.value }
                                                        })}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm">Color 2</Label>
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        type="color"
                                                        value={data.background_config.gradient?.color2}
                                                        onChange={(e) => setData('background_config', {
                                                            ...data.background_config,
                                                            gradient: { ...data.background_config.gradient!, color2: e.target.value }
                                                        })}
                                                        className="w-16 h-10"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={data.background_config.gradient?.color2}
                                                        onChange={(e) => setData('background_config', {
                                                            ...data.background_config,
                                                            gradient: { ...data.background_config.gradient!, color2: e.target.value }
                                                        })}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm">Angle: {data.background_config.gradient?.angle}°</Label>
                                            <Input
                                                type="range"
                                                min="0"
                                                max="360"
                                                step="1"
                                                value={data.background_config.gradient?.angle}
                                                onChange={(e) => setData('background_config', {
                                                    ...data.background_config,
                                                    gradient: { ...data.background_config.gradient!, angle: parseInt(e.target.value) }
                                                })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div 
                                            className="h-16 rounded-lg border-2 border-gray-300"
                                            style={{
                                                background: `linear-gradient(${data.background_config.gradient?.angle}deg, ${data.background_config.gradient?.color1}, ${data.background_config.gradient?.color2})`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Rows and Columns Builder */}
                            <div className="space-y-8">
                                {data.content.rows && data.content.rows.length > 0 ? data.content.rows.map((row, rowIndex) => (
                                    <div key={row.id} className="border-2 border-purple-300 rounded-xl p-6 bg-purple-50/30 dark:bg-purple-900/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                Row {rowIndex + 1}
                                            </h3>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => addColumn(rowIndex)}
                                                    className="text-sm px-3 py-1 rounded-md border border-green-500 text-green-700 hover:bg-green-50 transition-colors flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Add Column
                                                </button>
                                                {data.content.rows.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(rowIndex)}
                                                        className="text-sm px-3 py-1 rounded-md border border-red-500 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Remove Row
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Columns in Row */}
                                        <div className="space-y-4">
                                            {row.columns.map((column, colIndex) => (
                                                <div key={column.id} className={`border-2 rounded-lg p-4 ${
                                                    column.card 
                                                        ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' 
                                                        : 'border-gray-300 border-dashed bg-white'
                                                }`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                                                            Column {colIndex + 1}
                                                        </h4>
                                                        <div className="flex gap-2 items-center">
                                                            <select
                                                                value={column.width}
                                                                onChange={(e) => updateColumnWidth(rowIndex, colIndex, parseInt(e.target.value))}
                                                                className="text-xs px-2 py-1 rounded border"
                                                            >
                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                    <option key={w} value={w}>{w}/12</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleColumnCard(rowIndex, colIndex)}
                                                                className="text-xs px-2 py-1 rounded-md border transition-colors"
                                                            >
                                                                {column.card ? '🎴 Card' : '📄 Plain'}
                                                            </button>
                                                            {row.columns.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeColumn(rowIndex, colIndex)}
                                                                    className="text-xs px-2 py-1 rounded-md border border-red-400 text-red-700 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Elements */}
                                                    <div className="space-y-2 mb-3">
                                                        {column.elements.map((element, elemIndex) => (
                                                            <div key={elemIndex} className="flex gap-2 items-start">
                                                                <div className="flex-1">
                                                                    {element.type === 'heading' && (
                                                                        <Input
                                                                            value={element.value}
                                                                            onChange={(e) => updateElement(rowIndex, colIndex, elemIndex, e.target.value)}
                                                                            placeholder="Enter heading..."
                                                                            className="font-semibold text-sm"
                                                                        />
                                                                    )}
                                                                    {element.type === 'text' && (
                                                                        <Textarea
                                                                            value={element.value}
                                                                            onChange={(e) => updateElement(rowIndex, colIndex, elemIndex, e.target.value)}
                                                                            placeholder="Enter text content..."
                                                                            rows={2}
                                                                            className="text-sm"
                                                                        />
                                                                    )}
                                                                    {element.type === 'image' && (
                                                                        <div>
                                                                            {element.value ? (
                                                                                <div className="relative">
                                                                                    <img 
                                                                                        src={element.value} 
                                                                                        alt="Preview" 
                                                                                        className="w-full rounded border"
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleImageUpload(rowIndex, colIndex, elemIndex)}
                                                                                        className="absolute top-1 right-1 bg-white rounded px-2 py-0.5 text-xs shadow"
                                                                                    >
                                                                                        Change
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleImageUpload(rowIndex, colIndex, elemIndex)}
                                                                                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition"
                                                                                >
                                                                                    <div className="text-center">
                                                                                        <ImagePlus className="w-6 h-6 mx-auto mb-1" />
                                                                                        <span className="text-xs">Upload image</span>
                                                                                    </div>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeElement(rowIndex, colIndex, elemIndex)}
                                                                    className="text-red-600 hover:text-red-700 p-1"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Add Element Buttons */}
                                                    <div className="flex gap-1 flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => addElement(rowIndex, colIndex, 'heading')}
                                                            className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition"
                                                        >
                                                            <Type className="w-3 h-3" />
                                                            Heading
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => addElement(rowIndex, colIndex, 'text')}
                                                            className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition"
                                                        >
                                                            <AlignLeft className="w-3 h-3" />
                                                            Text
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => addElement(rowIndex, colIndex, 'image')}
                                                            className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition"
                                                        >
                                                            <ImagePlus className="w-3 h-3" />
                                                            Image
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No rows available. Click "Add New Row" to start.
                                    </div>
                                )}
                                
                                {/* Add Row Button */}
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-700 hover:bg-purple-50 transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add New Row
                                </button>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active" className="font-normal">
                                    Active (Show on homepage)
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link href="/home-sections">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Update Section
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
