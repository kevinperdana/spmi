import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Image as ImageIcon, Plus, X, Type, AlignLeft, ImagePlus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface HomeSection {
    id: number;
    layout_type: string;
    section_type: string;
    background_color: string;
    background_config?: BackgroundConfig;
    content: {
        columns: Column[];
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
    { 
        value: 'full-width', 
        label: 'Full Width', 
        description: 'Main (12-col)',
        columns: 1,
        bars: [12]
    },
    { 
        value: '2-equal', 
        label: '2 Equal Columns', 
        description: 'Left (6-col) + Right (6-col)',
        columns: 2,
        bars: [6, 6]
    },
    { 
        value: '3-equal', 
        label: '3 Equal Columns', 
        description: '4-col + 4-col + 4-col',
        columns: 3,
        bars: [4, 4, 4]
    },
    { 
        value: '4-equal', 
        label: '4 Equal Columns', 
        description: '3-col + 3-col + 3-col + 3-col',
        columns: 4,
        bars: [3, 3, 3, 3]
    },
    { 
        value: '2-sidebar-left', 
        label: '2 Columns (Sidebar Left)', 
        description: 'Left (4-col) + Right (8-col)',
        columns: 2,
        bars: [4, 8]
    },
    { 
        value: '2-sidebar-right', 
        label: '2 Columns (Sidebar Right)', 
        description: 'Left (8-col) + Right (4-col)',
        columns: 2,
        bars: [8, 4]
    },
];

const SECTION_TYPES = [
    { value: 'plain', label: 'Plain', description: 'No background card' },
    { value: 'card', label: 'Card', description: 'White background card' },
];

interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
}

interface Column {
    card: boolean;
    elements: ColumnElement[];
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
    const [step, setStep] = useState(1);
    const [originalLayoutType] = useState(section.layout_type); // Track original layout
    const [originalColumns] = useState(section.content.columns); // Backup original columns
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
        },
        content: section.content,
        is_active: section.is_active,
    });

    const handleNext = () => {
        if (step === 1 && data.layout_type && data.section_type) {
            const layoutChanged = data.layout_type !== originalLayoutType;
            const backToOriginal = data.layout_type === originalLayoutType;
            const isCard = data.section_type === 'card';
            
            // If user reverted back to original layout, restore original columns
            if (backToOriginal && originalColumns && originalColumns.length > 0) {
                // Update card property based on current section_type
                const restoredColumns = originalColumns.map(col => ({
                    ...col,
                    card: isCard
                }));
                setData('content', { columns: restoredColumns });
            }
            // Reset columns if:
            // 1. No columns exist (new section), OR
            // 2. Layout type has been changed to a different layout
            else if (!data.content.columns || data.content.columns.length === 0 || layoutChanged) {
                const layout = LAYOUT_TYPES.find(l => l.value === data.layout_type);
                const numColumns = layout?.columns || 1;
                
                const columns: Column[] = Array.from({ length: numColumns }, () => ({
                    card: isCard,
                    elements: [],
                }));
                
                setData('content', { columns });
            }
            // If layout is same but section_type might have changed, update card property
            else if (data.content.columns && data.content.columns.length > 0) {
                const updatedColumns = data.content.columns.map(col => ({
                    ...col,
                    card: isCard
                }));
                setData('content', { columns: updatedColumns });
            }
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

    const addElement = (columnIndex: number, type: 'heading' | 'text' | 'image') => {
        const newColumns = [...data.content.columns];
        newColumns[columnIndex].elements.push({ type, value: '' });
        setData('content', { columns: newColumns });
    };

    const updateElement = (columnIndex: number, elementIndex: number, value: string) => {
        const newColumns = [...data.content.columns];
        newColumns[columnIndex].elements[elementIndex].value = value;
        setData('content', { columns: newColumns });
    };

    const removeElement = (columnIndex: number, elementIndex: number) => {
        const newColumns = [...data.content.columns];
        newColumns[columnIndex].elements.splice(elementIndex, 1);
        setData('content', { columns: newColumns });
    };

    const toggleColumnCard = (columnIndex: number) => {
        const newColumns = [...data.content.columns];
        newColumns[columnIndex].card = !newColumns[columnIndex].card;
        setData('content', { columns: newColumns });
    };

    const handleImageUpload = async (columnIndex: number, elementIndex: number) => {
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
                updateElement(columnIndex, elementIndex, result.url);
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
                                                {/* Icon */}
                                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="4" y="4" width="6" height="6" rx="1"/>
                                                        <rect x="14" y="4" width="6" height="6" rx="1"/>
                                                        <rect x="4" y="14" width="6" height="6" rx="1"/>
                                                        <rect x="14" y="14" width="6" height="6" rx="1"/>
                                                    </svg>
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                        {layout.label}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                        {layout.description}
                                                    </div>
                                                    {/* Visual bars */}
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
                                            {/* Visual preview */}
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

                                {/* Background Configuration */}
                            <div className="space-y-4">
                                <Label>Background</Label>
                                
                                {/* Type Selector */}
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

                                {/* Solid Color Picker */}
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

                                {/* Gradient Picker */}
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
                                        {/* Preview */}
                                        <div 
                                            className="h-16 rounded-lg border-2 border-gray-300"
                                            style={{
                                                background: `linear-gradient(${data.background_config.gradient?.angle}deg, ${data.background_config.gradient?.color1}, ${data.background_config.gradient?.color2})`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Columns Builder */}
                            <div className="space-y-6">
                                {data.content.columns.map((column, colIndex) => (
                                    <div key={colIndex} className={`border-2 rounded-xl p-6 ${
                                        column.card 
                                            ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' 
                                            : 'border-gray-300 border-dashed'
                                    }`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                Column {colIndex + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => toggleColumnCard(colIndex)}
                                                className="text-sm px-3 py-1 rounded-md border transition-colors"
                                            >
                                                {column.card ? '🎴 Card' : '📄 Plain'}
                                            </button>
                                        </div>

                                        {/* Elements */}
                                        <div className="space-y-3 mb-4">
                                            {column.elements.map((element, elemIndex) => (
                                                <div key={elemIndex} className="flex gap-2 items-start">
                                                    <div className="flex-1">
                                                        {element.type === 'heading' && (
                                                            <Input
                                                                value={element.value}
                                                                onChange={(e) => updateElement(colIndex, elemIndex, e.target.value)}
                                                                placeholder="Enter heading..."
                                                                className="font-semibold"
                                                            />
                                                        )}
                                                        {element.type === 'text' && (
                                                            <Textarea
                                                                value={element.value}
                                                                onChange={(e) => updateElement(colIndex, elemIndex, e.target.value)}
                                                                placeholder="Enter text content..."
                                                                rows={3}
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
                                                                            onClick={() => handleImageUpload(colIndex, elemIndex)}
                                                                            className="absolute top-2 right-2 bg-white rounded-md px-2 py-1 text-sm shadow"
                                                                        >
                                                                            Change
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleImageUpload(colIndex, elemIndex)}
                                                                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition"
                                                                    >
                                                                        <div className="text-center">
                                                                            <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                                                                            <span className="text-sm">Click to upload image</span>
                                                                        </div>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeElement(colIndex, elemIndex)}
                                                        className="text-red-600 hover:text-red-700 p-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Element Buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => addElement(colIndex, 'heading')}
                                                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                            >
                                                <Type className="w-4 h-4" />
                                                Add Heading
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addElement(colIndex, 'text')}
                                                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                            >
                                                <AlignLeft className="w-4 h-4" />
                                                Add Text
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addElement(colIndex, 'image')}
                                                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                            >
                                                <ImagePlus className="w-4 h-4" />
                                                Add Image
                                            </button>
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
