import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Type, AlignLeft, ImagePlus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface HomeSection {
    id: number;
    title?: string;
    layout_type: string;
    section_type: string;
    background_color: string;
    background_config?: BackgroundConfig;
    content: {
        rows?: Row[];
        columns?: any[];
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

interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
}

interface Column {
    id: string;
    width: number; // 1-12 (Tailwind grid)
    card: boolean;
    columns: Column[]; // Nested columns (must have, no direct elements)
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

export default function Edit({ section }: Props) {
    // Convert legacy structure if needed
    const convertLegacyContent = () => {
        if (section.content.rows && section.content.rows.length > 0) {
            return section.content;
        }
        
        // Legacy: columns with direct elements -> convert to nested structure
        if (section.content.columns && section.content.columns.length > 0) {
            const convertedColumns = section.content.columns.map((col: any, index) => {
                if (col.elements && !col.columns) {
                    // Old structure: wrap elements in nested column
                    return {
                        id: col.id || `col-${Date.now()}-${index}`,
                        width: col.width || 6,
                        card: col.card || false,
                        columns: [{
                            id: `nested-${Date.now()}-${index}`,
                            width: 12,
                            card: col.card || false,
                            elements: col.elements
                        }]
                    };
                }
                return col;
            });
            
            return {
                rows: [{
                    id: `row-${Date.now()}`,
                    columns: convertedColumns
                }]
            };
        }
        
        // Empty: create default structure
        return {
            rows: [{
                id: `row-${Date.now()}`,
                columns: [{
                    id: `col-${Date.now()}`,
                    width: 12,
                    card: section.section_type === 'card',
                    columns: []
                }]
            }]
        };
    };

    const [step, setStep] = useState(2); // Start at step 2 (content editing)
    const { data, setData, put, processing, errors } = useForm({
        title: section.title || 'Untitled Section',
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

    const handleNext = () => {
        if (step === 1 && data.layout_type && data.section_type) {
            const layout = LAYOUT_TYPES.find(l => l.value === data.layout_type);
            const numColumns = layout?.columns || 1;
            const isCard = data.section_type === 'card';
            const widths = layout?.bars || [12];
            
            const columns: Column[] = Array.from({ length: numColumns }, (_, i) => ({
                id: `col-${Date.now()}-${i}`,
                width: widths[i] || 12,
                card: isCard,
                columns: [], // Start with empty nested columns
            }));
            
            const initialRow: Row = {
                id: `row-${Date.now()}`,
                columns
            };
            
            setData('content', { rows: [initialRow] });
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        }
    };

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
            columns: [] // Main columns are containers only
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
        // Keep nested columns always plain (card: false)
        if (newRows[rowIndex].columns[colIndex].columns) {
            newRows[rowIndex].columns[colIndex].columns.forEach((nestedCol: any) => {
                nestedCol.card = false;
            });
        }
        setData('content', { rows: newRows });
    };


    // Nested columns handlers
    const addNestedColumn = (rowIndex: number, colIndex: number) => {
        const newRows = [...data.content.rows];
        const column = newRows[rowIndex].columns[colIndex];
        
        // Nested columns are always plain
        const newNestedColumn = {
            id: `nested-${Date.now()}`,
            width: 6,
            card: false, // Always plain
            elements: [], // Nested columns have elements
        };
        
        column.columns.push(newNestedColumn as any);
        setData('content', { rows: newRows });
    };

    const removeNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].columns.splice(nestedColIndex, 1);
        setData('content', { rows: newRows });
    };

    const updateNestedColumnWidth = (rowIndex: number, colIndex: number, nestedColIndex: number, width: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].columns[nestedColIndex].width = width;
        setData('content', { rows: newRows });
    };

    const addElementToNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number, type: 'heading' | 'text' | 'image') => {
        const newRows = [...data.content.rows];
        const nestedCol = newRows[rowIndex].columns[colIndex].columns[nestedColIndex] as any;
        if (!nestedCol.elements) {
            nestedCol.elements = [];
        }
        const newElement: ColumnElement = {
            type,
            value: '',
            color: type === 'heading' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : 'text-lg',
            align: 'left',
            marginTop: '0',
            marginBottom: '16',
            marginLeft: '0',
            marginRight: '0',
            paddingTop: '0',
            paddingBottom: '0',
            paddingLeft: '0',
            paddingRight: '0'
        };
        nestedCol.elements.push(newElement);
        setData('content', { rows: newRows });
    };

    const updateElementInNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, field: 'value' | 'color' | 'fontSize' | 'align' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight' | 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight', value: string) => {
        const newRows = [...data.content.rows];
        const nestedCol = newRows[rowIndex].columns[colIndex].columns[nestedColIndex] as any;
        nestedCol.elements[elementIndex][field] = value;
        setData('content', { rows: newRows });
    };

    const removeElementFromNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
        const newRows = [...data.content.rows];
        const nestedCol = newRows[rowIndex].columns[colIndex].columns[nestedColIndex] as any;
        nestedCol.elements.splice(elementIndex, 1);
        setData('content', { rows: newRows });
    };

    const handleNestedImageUpload = async (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
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
                updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elementIndex, 'value', result.url);
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

                <div className="space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            1
                        </div>
                        <div className="w-20 h-1 bg-gray-200">
                            <div className={`h-full transition-all ${
                                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                            }`} style={{ width: step >= 2 ? '100%' : '0%' }} />
                        </div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            2
                        </div>
                    </div>

                    {/* Step 1: Layout & Section Type Selection */}
                    {step === 1 && (
                        <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <div className="p-6 space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Choose Layout Configuration</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Select layout type and section style</p>
                                </div>

                                {/* Layout Type Selection */}
                                <div className="space-y-3">
                                    <Label className="text-base">Choose a layout structure</Label>
                                    <div className="space-y-3">
                                        {LAYOUT_TYPES.map((layout) => (
                                            <button
                                                key={layout.value}
                                                type="button"
                                                onClick={() => setData('layout_type', layout.value)}
                                                className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-4 ${
                                                    data.layout_type === layout.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="4" y="4" width="6" height="6" rx="1"/>
                                                        <rect x="14" y="4" width="6" height="6" rx="1"/>
                                                        <rect x="4" y="14" width="6" height="6" rx="1"/>
                                                        <rect x="14" y="14" width="6" height="6" rx="1"/>
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                        {layout.label}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                        {layout.description}
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {layout.bars.map((width, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="h-2 bg-purple-200 dark:bg-purple-700 rounded-full"
                                                                style={{ width: `${(width / 12) * 100}%` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.layout_type && (
                                        <p className="text-sm text-red-600">{errors.layout_type}</p>
                                    )}
                                </div>

                                {/* Section Type Selection */}
                                <div className="space-y-3">
                                    <Label className="text-base">Choose section style</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {SECTION_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setData('section_type', type.value)}
                                                className={`p-5 border-2 rounded-xl text-left transition-all ${
                                                    data.section_type === type.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    {type.label}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    {type.description}
                                                </div>
                                                <div className={`h-16 rounded-lg border-2 ${
                                                    type.value === 'card' 
                                                        ? 'bg-white border-gray-300 shadow-sm' 
                                                        : 'bg-transparent border-dashed border-gray-300'
                                                }`}>
                                                    <div className="h-full flex items-center justify-center">
                                                        {type.value === 'card' ? (
                                                            <div className="space-y-1.5 w-3/4">
                                                                <div className="h-2 bg-gray-200 rounded"></div>
                                                                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1.5 w-3/4">
                                                                <div className="h-2 bg-gray-300 rounded"></div>
                                                                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.section_type && (
                                        <p className="text-sm text-red-600">{errors.section_type}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                        type="button" 
                                        onClick={handleNext}
                                        disabled={!data.layout_type || !data.section_type}
                                    >
                                        Next: Add Content
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Content Form */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <div className="p-6 space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Content</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            {LAYOUT_TYPES.find(l => l.value === data.layout_type)?.label || 'Layout'}
                                            {' • '}
                                            {data.section_type === 'card' ? 'Card style' : 'Plain style'}
                                        </p>
                                    </div>

                                    {/* Section Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Section Title</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter section title..."
                                            className="w-full"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600">{errors.title}</p>
                                        )}
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
                                        {data.content.rows.map((row, rowIndex) => (
                                            <div key={row.id} className="border-2 border-purple-300 rounded-xl p-6 bg-purple-50/30 dark:bg-purple-900/10">
                                                <div className="flex items-center justify-end mb-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => addColumn(rowIndex)}
                                                            className="text-sm px-3 py-1 rounded-md border border-green-500 text-green-700 hover:bg-green-50 transition-colors flex items-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Add Column
                                                        </button>
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

                                                            {/* Nested Columns Section */}
                                                            {column.columns.length > 0 ? (
                                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Nested Columns:</h5>
                                                                    <div className="space-y-3">
                                                                        {column.columns.map((nestedCol, nestedColIndex) => (
                                                                            <div key={nestedCol.id} className={`border rounded-lg p-3 ${
                                                                                nestedCol.card 
                                                                                    ? 'border-green-400 bg-white shadow-sm' 
                                                                                    : 'border-gray-200 bg-gray-50'
                                                                            }`}>
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-xs font-medium">Nested Col {nestedColIndex + 1}</span>
                                                                                    <div className="flex gap-1 items-center">
                                                                                        <select
                                                                                            value={nestedCol.width}
                                                                                            onChange={(e) => updateNestedColumnWidth(rowIndex, colIndex, nestedColIndex, parseInt(e.target.value))}
                                                                                            className="text-xs px-1 py-0.5 rounded border"
                                                                                        >
                                                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                                <option key={w} value={w}>{w}/12</option>
                                                                                            ))}
                                                                                        </select>
                                                                                        {column.columns!.length > 1 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeNestedColumn(rowIndex, colIndex, nestedColIndex)}
                                                                                                className="text-xs px-1 py-0.5 rounded border border-red-400 text-red-700"
                                                                                            >
                                                                                                <X className="w-2 h-2" />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Nested Column Elements */}
                                                                                <div className="space-y-1.5 mb-2">
                                                                                    {nestedCol.elements.map((element, elemIndex) => (
                                                                                        <div key={elemIndex} className="space-y-1">
                                                                                            <div className="flex gap-1 items-start">
                                                                                                <div className="flex-1">
                                                                                                    {element.type === 'heading' && (
                                                                                                        <Input
                                                                                                            value={element.value}
                                                                                                            onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'value', e.target.value)}
                                                                                                            placeholder="Heading..."
                                                                                                            className="text-xs h-7"
                                                                                                        />
                                                                                                    )}
                                                                                                    {element.type === 'text' && (
                                                                                                        <Textarea
                                                                                                            value={element.value}
                                                                                                            onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'value', e.target.value)}
                                                                                                            placeholder="Text..."
                                                                                                            rows={1}
                                                                                                            className="text-xs"
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
                                                                                                                        onClick={() => handleNestedImageUpload(rowIndex, colIndex, nestedColIndex, elemIndex)}
                                                                                                                        className="absolute top-0.5 right-0.5 bg-white rounded px-1 py-0.5 text-xs shadow"
                                                                                                                    >
                                                                                                                        Change
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => handleNestedImageUpload(rowIndex, colIndex, nestedColIndex, elemIndex)}
                                                                                                                    className="w-full h-16 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs"
                                                                                                                >
                                                                                                                    Upload
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => removeElementFromNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex)}
                                                                                                    className="text-red-600 p-0.5"
                                                                                                >
                                                                                                    <X className="w-2 h-2" />
                                                                                                </button>
                                                                                            </div>
                                                                                            
                                                                                            {/* Styling Options for Heading and Text */}
                                                                                            {(element.type === 'heading' || element.type === 'text') && (
                                                                                                <div className="space-y-1">
                                                                                                    <div className="flex gap-1 items-center pl-1">
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <label className="text-[10px] text-gray-600">Color:</label>
                                                                                                            <input
                                                                                                                type="color"
                                                                                                                value={element.color || '#000000'}
                                                                                                                onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'color', e.target.value)}
                                                                                                                className="w-6 h-5 rounded border cursor-pointer"
                                                                                                            />
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                value={element.color || '#000000'}
                                                                                                                onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'color', e.target.value)}
                                                                                                                placeholder="#000000"
                                                                                                                className="text-[10px] px-1 py-0.5 rounded border w-16"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <label className="text-[10px] text-gray-600">Size:</label>
                                                                                                            <select
                                                                                                                value={element.fontSize || (element.type === 'heading' ? 'text-3xl' : 'text-lg')}
                                                                                                                onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'fontSize', e.target.value)}
                                                                                                                className="text-[10px] px-1 py-0.5 rounded border"
                                                                                                            >
                                                                                                                {element.type === 'heading' ? (
                                                                                                                    <>
                                                                                                                        <option value="text-xl">XL</option>
                                                                                                                        <option value="text-2xl">2XL</option>
                                                                                                                        <option value="text-3xl">3XL</option>
                                                                                                                        <option value="text-4xl">4XL</option>
                                                                                                                        <option value="text-5xl">5XL</option>
                                                                                                                        <option value="text-6xl">6XL</option>
                                                                                                                    </>
                                                                                                                ) : (
                                                                                                                    <>
                                                                                                                        <option value="text-xs">XS</option>
                                                                                                                        <option value="text-sm">SM</option>
                                                                                                                        <option value="text-base">Base</option>
                                                                                                                        <option value="text-lg">LG</option>
                                                                                                                        <option value="text-xl">XL</option>
                                                                                                                        <option value="text-2xl">2XL</option>
                                                                                                                    </>
                                                                                                                )}
                                                                                                            </select>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex gap-1 items-center pl-1">
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <label className="text-[10px] text-gray-600">Align:</label>
                                                                                                            <select
                                                                                                                value={element.align || 'left'}
                                                                                                                onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'align', e.target.value)}
                                                                                                                className="text-[10px] px-1 py-0.5 rounded border"
                                                                                                            >
                                                                                                                <option value="left">Left</option>
                                                                                                                <option value="center">Center</option>
                                                                                                                <option value="right">Right</option>
                                                                                                            </select>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="pl-1">
                                                                                                        <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Margin:</label>
                                                                                                        <div className="flex gap-1 items-center">
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Top</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.marginTop || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'marginTop', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Right</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.marginRight || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'marginRight', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Bottom</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.marginBottom || '16'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'marginBottom', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Left</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.marginLeft || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'marginLeft', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="pl-1">
                                                                                                        <label className="text-[10px] text-gray-600 font-semibold block mb-0.5">Padding:</label>
                                                                                                        <div className="flex gap-1 items-center">
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Top</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.paddingTop || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'paddingTop', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Right</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.paddingRight || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'paddingRight', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Bottom</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.paddingBottom || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'paddingBottom', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="flex flex-col items-center">
                                                                                                                <span className="text-[9px] text-gray-500 mb-0.5">Left</span>
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    value={element.paddingLeft || '0'}
                                                                                                                    onChange={(e) => updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex, 'paddingLeft', e.target.value)}
                                                                                                                    className="text-[10px] px-1 py-0.5 rounded border w-12 text-center"
                                                                                                                    min="0"
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>

                                                                                {/* Add Element to Nested Column */}
                                                                                <div className="flex gap-0.5 flex-wrap">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => addElementToNestedColumn(rowIndex, colIndex, nestedColIndex, 'heading')}
                                                                                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs border rounded hover:bg-gray-50"
                                                                                    >
                                                                                        <Type className="w-2 h-2" />
                                                                                        H
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => addElementToNestedColumn(rowIndex, colIndex, nestedColIndex, 'text')}
                                                                                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs border rounded hover:bg-gray-50"
                                                                                    >
                                                                                        <AlignLeft className="w-2 h-2" />
                                                                                        T
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => addElementToNestedColumn(rowIndex, colIndex, nestedColIndex, 'image')}
                                                                                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs border rounded hover:bg-gray-50"
                                                                                    >
                                                                                        <ImagePlus className="w-2 h-2" />
                                                                                        I
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-500 text-sm">
                                                                    No nested columns yet. Click "Add Nested Column" below to start.
                                                                </div>
                                                            )}

                                                            {/* Add Nested Column Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => addNestedColumn(rowIndex, colIndex)}
                                                                className="w-full mt-3 py-2 border border-dashed border-green-300 rounded text-green-700 hover:bg-green-50 transition text-xs flex items-center justify-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Add Nested Column
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
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

                            <div className="flex justify-between gap-2">
                                <Button type="button" variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                                <div className="flex gap-2">
                                    <Link href="/home-sections">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                <Button type="submit" disabled={processing}>
                                    Update Section
                                </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
