import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Type, AlignLeft, ImagePlus, Settings2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const LAYOUT_TYPES = [
    { value: 'full-width', label: 'Full Width', description: 'Main (12-col)', columns: 1, bars: [12] },
    { value: '2-equal', label: '2 Equal Columns', description: 'Left (6-col) + Right (6-col)', columns: 2, bars: [6, 6] },
    { value: '3-equal', label: '3 Equal Columns', description: '4-col + 4-col + 4-col', columns: 3, bars: [4, 4, 4] },
    { value: '4-equal', label: '4 Equal Columns', description: '3-col + 3-col + 3-col + 3-col', columns: 4, bars: [3, 3, 3, 3] },
    { value: '2-sidebar-left', label: '2 Columns (Sidebar Left)', description: 'Left (4-col) + Right (8-col)', columns: 2, bars: [4, 8] },
    { value: '2-sidebar-right', label: '2 Columns (Sidebar Right)', description: 'Left (8-col) + Right (4-col)', columns: 2, bars: [8, 4] },
];

interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
}

interface Column {
    id: string;
    width: number; // Desktop width (1-12)
    widthTablet?: number; // Tablet width (1-12)
    widthMobile?: number; // Mobile width (1-12)
    card: boolean; // Card or plain style
    // Margin
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    // Padding
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    elements: ColumnElement[];
    columns?: Column[]; // Optional nested columns
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

interface ContainerConfig {
    maxWidth?: string;
    horizontalPadding?: string;
    verticalPadding?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
}

interface Section {
    id: string;
    layout_type: string;
    background_config?: BackgroundConfig;
    container_config?: ContainerConfig;
    columns: Column[];
}

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    layout_type?: string;
    is_published: boolean;
    order: number;
}

interface Props {
    page: Page;
}

export default function Edit({ page }: Props) {
    const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<{ sectionIndex: number; colIndex: number } | null>(null);
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pages',
            href: '/pages',
        },
        {
            title: 'Edit',
            href: `/pages/${page.id}/edit`,
        },
    ];

    // Parse existing content - support both old formats and new sections format
    const parseContent = () => {
        if (!page.content) {
            return { sections: [] };
        }

        try {
            const parsed = JSON.parse(page.content);
            
            // Already in sections format
            if (parsed.sections && Array.isArray(parsed.sections)) {
                // Ensure all sections have required configs
                parsed.sections.forEach((section: any) => {
                    // Ensure background_config exists
                    if (!section.background_config) {
                        section.background_config = {
                            type: 'solid',
                            color: '#ffffff',
                            gradient: {
                                color1: '#3b82f6',
                                color2: '#8b5cf6',
                                angle: 90
                            }
                        };
                    }
                    // Ensure container_config exists
                    if (!section.container_config) {
                        section.container_config = {
                            maxWidth: 'max-w-7xl',
                            horizontalPadding: '16',
                            verticalPadding: '32',
                            paddingTop: '',
                            paddingBottom: '',
                            paddingLeft: '',
                            paddingRight: ''
                        };
                    }
                    // Ensure all columns have card property and responsive widths
                    section.columns.forEach((col: any) => {
                        if (col.card === undefined) col.card = false;
                        if (col.widthTablet === undefined) col.widthTablet = col.width || 12;
                        if (col.widthMobile === undefined) col.widthMobile = 12;
                    });
                });
                return parsed;
            }
            
            // Old rows format - convert to sections
            if (parsed.rows && Array.isArray(parsed.rows)) {
                const sections = parsed.rows.map((row: any) => ({
                    id: row.id || `section-${Date.now()}-${Math.random()}`,
                    layout_type: 'full-width',
                    background_config: {
                        type: 'solid',
                        color: '#ffffff',
                        gradient: {
                            color1: '#3b82f6',
                            color2: '#8b5cf6',
                            angle: 90
                        }
                    },
                    container_config: {
                        maxWidth: 'max-w-7xl',
                        horizontalPadding: '16',
                        verticalPadding: '32',
                        paddingTop: '',
                        paddingBottom: '',
                        paddingLeft: '',
                        paddingRight: ''
                    },
                    columns: (row.columns || []).map((col: any) => ({
                        ...col,
                        card: col.card || false,
                        widthTablet: col.widthTablet || col.width || 12,
                        widthMobile: col.widthMobile || 12
                    }))
                }));
                return { sections };
            }
            
            // Unknown format - create empty
            return { sections: [] };
        } catch {
            // Plain text - create single section with text element
            return {
                sections: [{
                    id: `section-${Date.now()}`,
                    layout_type: 'full-width',
                    columns: [{
                        id: `col-${Date.now()}`,
                        width: 12,
                        card: false,
                        elements: [{ type: 'text', value: page.content || '', color: '#4b5563', fontSize: 'text-base', align: 'left' }]
                    }]
                }]
            };
        }
    };

    const { data, setData, put, processing, errors } = useForm({
        title: page.title,
        slug: page.slug,
        content: parseContent(),
        is_published: page.is_published,
        order: page.order,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/pages/${page.id}`);
    };

    const addSection = (layoutType: string) => {
        const layout = LAYOUT_TYPES.find(l => l.value === layoutType);
        const widths = layout?.bars || [12];
        
        const columns: Column[] = Array.from({ length: widths.length }, (_, i) => ({
            id: `col-${Date.now()}-${i}`,
            width: widths[i] || 12,
            widthTablet: 12, // Default tablet: full width
            widthMobile: 12, // Default mobile: full width
            card: false,
            elements: [],
        }));
        
        const newSection: Section = {
            id: `section-${Date.now()}`,
            layout_type: layoutType,
            background_config: {
                type: 'solid',
                color: '#ffffff',
                gradient: {
                    color1: '#3b82f6',
                    color2: '#8b5cf6',
                    angle: 90
                }
            },
            container_config: {
                maxWidth: 'max-w-7xl',
                horizontalPadding: '16',
                verticalPadding: '32',
                paddingTop: '',
                paddingBottom: '',
                paddingLeft: '',
                paddingRight: ''
            },
            columns
        };
        setData('content', { sections: [...data.content.sections, newSection] });
    };

    const removeSection = (sectionIndex: number) => {
        const newSections = [...data.content.sections];
        newSections.splice(sectionIndex, 1);
        setData('content', { sections: newSections });
    };

    const addColumn = (sectionIndex: number) => {
        const newSections = [...data.content.sections];
        const newColumn: Column = { 
            id: `col-${Date.now()}`, 
            width: 6, 
            widthTablet: 12,
            widthMobile: 12,
            card: false, 
            elements: [] 
        };
        newSections[sectionIndex].columns.push(newColumn);
        setData('content', { sections: newSections });
    };

    const removeColumn = (sectionIndex: number, colIndex: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns.splice(colIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateColumnWidth = (sectionIndex: number, colIndex: number, width: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].width = width;
        setData('content', { sections: newSections });
    };

    const updateColumnWidthTablet = (sectionIndex: number, colIndex: number, width: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].widthTablet = width;
        setData('content', { sections: newSections });
    };

    const updateColumnWidthMobile = (sectionIndex: number, colIndex: number, width: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].widthMobile = width;
        setData('content', { sections: newSections });
    };

    const updateColumnSpacing = (sectionIndex: number, colIndex: number, field: string, value: string) => {
        const newSections = [...data.content.sections];
        (newSections[sectionIndex].columns[colIndex] as any)[field] = value;
        setData('content', { sections: newSections });
    };

    const addElementToColumn = (sectionIndex: number, colIndex: number, type: 'heading' | 'text' | 'image') => {
        const newSections = [...data.content.sections];
        const column = newSections[sectionIndex].columns[colIndex];
        if (!column.elements) column.elements = [];
        
        const newElement: ColumnElement = {
            type,
            value: '',
            color: type === 'heading' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : 'text-base',
            align: 'left'
        };
        column.elements.push(newElement);
        setData('content', { sections: newSections });
    };

    const updateElementInColumn = (sectionIndex: number, colIndex: number, elementIndex: number, field: keyof ColumnElement, value: string) => {
        const newSections = [...data.content.sections];
        (newSections[sectionIndex].columns[colIndex].elements[elementIndex] as any)[field] = value;
        setData('content', { sections: newSections });
    };

    const removeElementFromColumn = (sectionIndex: number, colIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].elements.splice(elementIndex, 1);
        setData('content', { sections: newSections });
    };

    const toggleColumnCard = (sectionIndex: number, colIndex: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].card = !newSections[sectionIndex].columns[colIndex].card;
        setData('content', { sections: newSections });
    };

    // Background & Container Config Functions
    const updateBackgroundConfig = (sectionIndex: number, field: string, value: any) => {
        const newSections = [...data.content.sections];
        if (!newSections[sectionIndex].background_config) {
            newSections[sectionIndex].background_config = {
                type: 'solid',
                color: '#ffffff',
                gradient: { color1: '#3b82f6', color2: '#8b5cf6', angle: 90 }
            };
        }
        (newSections[sectionIndex].background_config as any)[field] = value;
        setData('content', { sections: newSections });
    };

    const updateContainerConfig = (sectionIndex: number, field: string, value: string) => {
        const newSections = [...data.content.sections];
        if (!newSections[sectionIndex].container_config) {
            newSections[sectionIndex].container_config = {
                maxWidth: 'max-w-7xl',
                horizontalPadding: '16',
                verticalPadding: '32',
                paddingTop: '',
                paddingBottom: '',
                paddingLeft: '',
                paddingRight: ''
            };
        }
        (newSections[sectionIndex].container_config as any)[field] = value;
        setData('content', { sections: newSections });
    };

    // Nested Column Functions
    const addNestedColumn = (sectionIndex: number, colIndex: number) => {
        const newSections = [...data.content.sections];
        const column = newSections[sectionIndex].columns[colIndex];
        
        if (!column.columns) {
            column.columns = [];
        }
        
        const newNestedColumn: Column = {
            id: `nested-${Date.now()}`,
            width: 6,
            card: false,
            elements: [],
        };
        
        column.columns.push(newNestedColumn);
        setData('content', { sections: newSections });
    };

    const removeNestedColumn = (sectionIndex: number, colIndex: number, nestedColIndex: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].columns!.splice(nestedColIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateNestedColumnWidth = (sectionIndex: number, colIndex: number, nestedColIndex: number, width: number) => {
        const newSections = [...data.content.sections];
        newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].width = width;
        setData('content', { sections: newSections });
    };

    const addElementToNestedColumn = (sectionIndex: number, colIndex: number, nestedColIndex: number, type: 'heading' | 'text' | 'image') => {
        const newSections = [...data.content.sections];
        const nestedCol = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex];
        if (!nestedCol.elements) {
            nestedCol.elements = [];
        }
        const newElement: ColumnElement = {
            type,
            value: '',
            color: type === 'heading' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : 'text-base',
            align: 'left'
        };
        nestedCol.elements.push(newElement);
        setData('content', { sections: newSections });
    };

    const updateElementInNestedColumn = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, field: keyof ColumnElement, value: string) => {
        const newSections = [...data.content.sections];
        const nestedCol = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex];
        (nestedCol.elements[elementIndex] as any)[field] = value;
        setData('content', { sections: newSections });
    };

    const removeElementFromNestedColumn = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        const nestedCol = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex];
        nestedCol.elements.splice(elementIndex, 1);
        setData('content', { sections: newSections });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${page.title}`} />

            <div 
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4" 
                style={{ marginRight: selectedColumn ? '320px' : '0', transition: 'margin-right 0.3s ease' }}
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/pages">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Edit Page
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-6 space-y-6">
                            {/* Page Title */}
                            <div>
                                <Label htmlFor="title">Page Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter page title..."
                                    required
                                />
                                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            {/* Slug */}
                            <div>
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="page-url"
                                />
                                <p className="text-xs text-gray-500 mt-1">URL: /page/{data.slug}</p>
                                {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
                            </div>

                            {/* Order */}
                            <div>
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in navigation</p>
                            </div>

                            {/* Published */}
                            <div className="flex items-center">
                                <input
                                    id="is_published"
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <Label htmlFor="is_published" className="ml-2 mb-0">
                                    Publish this page
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Add Section Dropdown */}
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Label>Page Sections</Label>
                                <div className="relative">
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setShowLayoutDropdown(!showLayoutDropdown)}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Section
                                    </Button>
                                    
                                    {showLayoutDropdown && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setShowLayoutDropdown(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                                                <div className="p-2">
                                                    {LAYOUT_TYPES.map((layout) => (
                                                        <button
                                                            key={layout.value}
                                                            type="button"
                                                            onClick={() => {
                                                                addSection(layout.value);
                                                                setShowLayoutDropdown(false);
                                                            }}
                                                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-left mb-2"
                                                        >
                                                            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                                                                {layout.label}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                {layout.description}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {layout.bars.map((width, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="h-1.5 bg-blue-200 dark:bg-blue-700 rounded"
                                                                        style={{ flex: width }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {data.content.sections.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No sections yet. Click "Add Section" to start building your page.</p>
                                </div>
                            )}

                            {/* Sections */}
                            <div className="space-y-4">
                                {data.content.sections.map((section, sectionIndex) => {
                                    const layout = LAYOUT_TYPES.find(l => l.value === section.layout_type);
                                    return (
                        <div key={section.id} className="border-2 border-purple-300 rounded-xl p-4 bg-purple-50/30 dark:bg-purple-900/10">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <h4 className="font-semibold">Section {sectionIndex + 1}</h4>
                                                    <p className="text-xs text-gray-500">{layout?.label || 'Unknown Layout'}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="button" size="sm" variant="outline" onClick={() => addColumn(sectionIndex)}>
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Column
                                                    </Button>
                                                    <Button type="button" size="sm" variant="destructive" onClick={() => removeSection(sectionIndex)}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Background Configuration */}
                                            <div className="mb-4 p-3 bg-white rounded-lg border">
                                                <h5 className="text-sm font-semibold mb-2">Background</h5>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateBackgroundConfig(sectionIndex, 'type', 'solid')}
                                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                                                section.background_config?.type === 'solid'
                                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        >
                                                            Solid Color
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateBackgroundConfig(sectionIndex, 'type', 'gradient')}
                                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                                                section.background_config?.type === 'gradient'
                                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        >
                                                            Gradient
                                                        </button>
                                                    </div>

                                                    {section.background_config?.type === 'solid' && (
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                value={section.background_config.color || '#ffffff'}
                                                                onChange={(e) => updateBackgroundConfig(sectionIndex, 'color', e.target.value)}
                                                                className="w-16 h-8"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={section.background_config.color || '#ffffff'}
                                                                onChange={(e) => updateBackgroundConfig(sectionIndex, 'color', e.target.value)}
                                                                placeholder="#ffffff"
                                                                className="flex-1 text-sm"
                                                            />
                                                        </div>
                                                    )}

                                                    {section.background_config?.type === 'gradient' && (
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <Label className="text-xs mb-1 block">Color 1</Label>
                                                                    <div className="flex gap-1">
                                                                        <Input
                                                                            type="color"
                                                                            value={section.background_config.gradient?.color1 || '#3b82f6'}
                                                                            onChange={(e) => updateBackgroundConfig(sectionIndex, 'gradient', {
                                                                                ...section.background_config.gradient,
                                                                                color1: e.target.value
                                                                            })}
                                                                            className="w-12 h-7"
                                                                        />
                                                                        <Input
                                                                            type="text"
                                                                            value={section.background_config.gradient?.color1 || '#3b82f6'}
                                                                            onChange={(e) => updateBackgroundConfig(sectionIndex, 'gradient', {
                                                                                ...section.background_config.gradient,
                                                                                color1: e.target.value
                                                                            })}
                                                                            className="flex-1 text-xs"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs mb-1 block">Color 2</Label>
                                                                    <div className="flex gap-1">
                                                                        <Input
                                                                            type="color"
                                                                            value={section.background_config.gradient?.color2 || '#8b5cf6'}
                                                                            onChange={(e) => updateBackgroundConfig(sectionIndex, 'gradient', {
                                                                                ...section.background_config.gradient,
                                                                                color2: e.target.value
                                                                            })}
                                                                            className="w-12 h-7"
                                                                        />
                                                                        <Input
                                                                            type="text"
                                                                            value={section.background_config.gradient?.color2 || '#8b5cf6'}
                                                                            onChange={(e) => updateBackgroundConfig(sectionIndex, 'gradient', {
                                                                                ...section.background_config.gradient,
                                                                                color2: e.target.value
                                                                            })}
                                                                            className="flex-1 text-xs"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Angle: {section.background_config.gradient?.angle || 90}°</Label>
                                                                <Input
                                                                    type="range"
                                                                    min="0"
                                                                    max="360"
                                                                    step="1"
                                                                    value={section.background_config.gradient?.angle || 90}
                                                                    onChange={(e) => updateBackgroundConfig(sectionIndex, 'gradient', {
                                                                        ...section.background_config.gradient,
                                                                        angle: parseInt(e.target.value)
                                                                    })}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Container Configuration */}
                                            <div className="mb-4 p-3 bg-white rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold">Container Settings</h5>
                                                    <Settings2 className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs mb-1 block">Max Width</Label>
                                                        <select
                                                            value={section.container_config?.maxWidth || 'max-w-7xl'}
                                                            onChange={(e) => updateContainerConfig(sectionIndex, 'maxWidth', e.target.value)}
                                                            className="w-full text-xs px-2 py-1.5 rounded border"
                                                        >
                                                            <option value="max-w-full">Full Width</option>
                                                            <option value="max-w-7xl">7XL (1280px)</option>
                                                            <option value="max-w-6xl">6XL (1152px)</option>
                                                            <option value="max-w-5xl">5XL (1024px)</option>
                                                            <option value="max-w-4xl">4XL (896px)</option>
                                                            <option value="max-w-3xl">3XL (768px)</option>
                                                            <option value="max-w-2xl">2XL (672px)</option>
                                                            <option value="max-w-xl">XL (576px)</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs mb-1 block font-semibold text-gray-700">Vertical Padding (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={section.container_config?.verticalPadding || '32'}
                                                            onChange={(e) => updateContainerConfig(sectionIndex, 'verticalPadding', e.target.value)}
                                                            min="0"
                                                            placeholder="Default: 32"
                                                            className="text-xs"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs mb-1 block font-semibold text-gray-700">Horizontal Padding (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={section.container_config?.horizontalPadding || '16'}
                                                            onChange={(e) => updateContainerConfig(sectionIndex, 'horizontalPadding', e.target.value)}
                                                            min="0"
                                                            placeholder="Default: 16"
                                                            className="text-xs"
                                                        />
                                                    </div>

                                                    {/* Individual Padding Override */}
                                                    <div className="pt-2 border-t">
                                                        <Label className="text-xs mb-2 block font-semibold text-amber-700">Individual Padding (Override)</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <Label className="text-xs mb-1 block text-gray-600">Top (px)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={section.container_config?.paddingTop || ''}
                                                                    onChange={(e) => updateContainerConfig(sectionIndex, 'paddingTop', e.target.value)}
                                                                    min="0"
                                                                    placeholder="Auto"
                                                                    className="text-xs h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs mb-1 block text-gray-600">Right (px)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={section.container_config?.paddingRight || ''}
                                                                    onChange={(e) => updateContainerConfig(sectionIndex, 'paddingRight', e.target.value)}
                                                                    min="0"
                                                                    placeholder="Auto"
                                                                    className="text-xs h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs mb-1 block text-gray-600">Bottom (px)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={section.container_config?.paddingBottom || ''}
                                                                    onChange={(e) => updateContainerConfig(sectionIndex, 'paddingBottom', e.target.value)}
                                                                    min="0"
                                                                    placeholder="Auto"
                                                                    className="text-xs h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs mb-1 block text-gray-600">Left (px)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={section.container_config?.paddingLeft || ''}
                                                                    onChange={(e) => updateContainerConfig(sectionIndex, 'paddingLeft', e.target.value)}
                                                                    min="0"
                                                                    placeholder="Auto"
                                                                    className="text-xs h-8"
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1.5 italic">Leave empty to use vertical/horizontal padding values</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {section.columns.map((column, colIndex) => (
                                                    <div key={column.id} className={`border-2 rounded-lg p-3 ${
                                                        column.card 
                                                            ? 'border-green-300 bg-green-50/30' 
                                                            : 'border-gray-300 bg-white'
                                                    }`}>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h5 className="text-sm font-medium">Column {colIndex + 1}</h5>
                                                            <div className="flex gap-2 items-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleColumnCard(sectionIndex, colIndex)}
                                                                    className="text-xs px-2 py-1 rounded-md border transition-colors bg-white hover:bg-gray-50"
                                                                >
                                                                    {column.card ? '🎴 Card' : '📄 Plain'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedColumn({ sectionIndex, colIndex })}
                                                                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                                                                    title="Column Settings"
                                                                >
                                                                    <Settings2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                {section.columns.length > 1 && (
                                                                    <Button 
                                                                        type="button" 
                                                                        size="sm" 
                                                                        variant="ghost" 
                                                                        onClick={() => removeColumn(sectionIndex, colIndex)}
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Responsive Width Controls */}
                                                        <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div>
                                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                                        Desktop
                                                                    </label>
                                                                    <select
                                                                        value={column.width}
                                                                        onChange={(e) => updateColumnWidth(sectionIndex, colIndex, parseInt(e.target.value))}
                                                                        className="w-full text-xs px-2 py-1 rounded border bg-white"
                                                                    >
                                                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                            <option key={w} value={w}>{w}/12</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                                        Tablet
                                                                    </label>
                                                                    <select
                                                                        value={column.widthTablet || column.width}
                                                                        onChange={(e) => updateColumnWidthTablet(sectionIndex, colIndex, parseInt(e.target.value))}
                                                                        className="w-full text-xs px-2 py-1 rounded border bg-white"
                                                                    >
                                                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                            <option key={w} value={w}>{w}/12</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                                        Mobile
                                                                    </label>
                                                                    <select
                                                                        value={column.widthMobile || 12}
                                                                        onChange={(e) => updateColumnWidthMobile(sectionIndex, colIndex, parseInt(e.target.value))}
                                                                        className="w-full text-xs px-2 py-1 rounded border bg-white"
                                                                    >
                                                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                            <option key={w} value={w}>{w}/12</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Elements */}
                                                        <div className="space-y-2 mb-2">
                                                            {column.elements.map((element, elemIndex) => (
                                                                <div key={elemIndex} className="border rounded p-2">
                                                                    <div className="flex gap-2 mb-2">
                                                                        <div className="flex-1">
                                                                            {element.type === 'heading' && (
                                                                                <Input
                                                                                    value={element.value}
                                                                                    onChange={(e) => updateElementInColumn(sectionIndex, colIndex, elemIndex, 'value', e.target.value)}
                                                                                    placeholder="Heading text..."
                                                                                    className="text-sm"
                                                                                />
                                                                            )}
                                                                            {element.type === 'text' && (
                                                                                <Textarea
                                                                                    value={element.value}
                                                                                    onChange={(e) => updateElementInColumn(sectionIndex, colIndex, elemIndex, 'value', e.target.value)}
                                                                                    placeholder="Text content..."
                                                                                    rows={2}
                                                                                    className="text-sm"
                                                                                />
                                                                            )}
                                                                            {element.type === 'image' && (
                                                                                <Input
                                                                                    value={element.value}
                                                                                    onChange={(e) => updateElementInColumn(sectionIndex, colIndex, elemIndex, 'value', e.target.value)}
                                                                                    placeholder="Image URL..."
                                                                                    className="text-sm"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <Button 
                                                                            type="button" 
                                                                            size="sm" 
                                                                            variant="ghost"
                                                                            onClick={() => removeElementFromColumn(sectionIndex, colIndex, elemIndex)}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>

                                                                    {/* Styling */}
                                                                    <div className="flex gap-2 text-xs">
                                                                        <div className="flex items-center gap-1">
                                                                            <span>Color:</span>
                                                                            <input
                                                                                type="color"
                                                                                value={element.color}
                                                                                onChange={(e) => updateElementInColumn(sectionIndex, colIndex, elemIndex, 'color', e.target.value)}
                                                                                className="w-6 h-6 rounded border"
                                                                            />
                                                                        </div>
                                                                        <select
                                                                            value={element.align}
                                                                            onChange={(e) => updateElementInColumn(sectionIndex, colIndex, elemIndex, 'align', e.target.value)}
                                                                            className="px-1 py-0.5 rounded border"
                                                                        >
                                                                            <option value="left">Left</option>
                                                                            <option value="center">Center</option>
                                                                            <option value="right">Right</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Add Element Buttons */}
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                type="button" 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => addElementToColumn(sectionIndex, colIndex, 'heading')}
                                                            >
                                                                <Type className="w-3 h-3 mr-1" />
                                                                Heading
                                                            </Button>
                                                            <Button 
                                                                type="button" 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => addElementToColumn(sectionIndex, colIndex, 'text')}
                                                            >
                                                                <AlignLeft className="w-3 h-3 mr-1" />
                                                                Text
                                                            </Button>
                                                            <Button 
                                                                type="button" 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => addElementToColumn(sectionIndex, colIndex, 'image')}
                                                            >
                                                                <ImagePlus className="w-3 h-3 mr-1" />
                                                                Image
                                                            </Button>
                                                        </div>

                                                        {/* Nested Columns */}
                                                        {column.columns && column.columns.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                <div className="text-xs font-medium text-gray-600">Nested Columns:</div>
                                                                {column.columns.map((nestedCol, nestedColIndex) => (
                                                                    <div key={nestedCol.id} className="border border-blue-300 rounded-lg p-2 bg-blue-50/30">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-medium">Nested Col {nestedColIndex + 1}</span>
                                                                            <div className="flex gap-1 items-center">
                                                                                <select
                                                                                    value={nestedCol.width}
                                                                                    onChange={(e) => updateNestedColumnWidth(sectionIndex, colIndex, nestedColIndex, parseInt(e.target.value))}
                                                                                    className="text-xs px-1 py-0.5 rounded border"
                                                                                >
                                                                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                        <option key={w} value={w}>{w}/12</option>
                                                                                    ))}
                                                                                </select>
                                                                                {column.columns!.length > 1 && (
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        onClick={() => removeNestedColumn(sectionIndex, colIndex, nestedColIndex)}
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Nested Column Elements */}
                                                                        <div className="space-y-1.5 mb-2">
                                                                            {nestedCol.elements.map((element, elemIndex) => (
                                                                                <div key={elemIndex} className="border rounded p-1.5 bg-white">
                                                                                    <div className="flex gap-1 mb-1">
                                                                                        <div className="flex-1">
                                                                                            {element.type === 'heading' && (
                                                                                                <Input
                                                                                                    value={element.value}
                                                                                                    onChange={(e) => updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex, elemIndex, 'value', e.target.value)}
                                                                                                    placeholder="Heading text..."
                                                                                                    className="text-xs h-7"
                                                                                                />
                                                                                            )}
                                                                                            {element.type === 'text' && (
                                                                                                <Textarea
                                                                                                    value={element.value}
                                                                                                    onChange={(e) => updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex, elemIndex, 'value', e.target.value)}
                                                                                                    placeholder="Text content..."
                                                                                                    rows={2}
                                                                                                    className="text-xs"
                                                                                                />
                                                                                            )}
                                                                                            {element.type === 'image' && (
                                                                                                <Input
                                                                                                    value={element.value}
                                                                                                    onChange={(e) => updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex, elemIndex, 'value', e.target.value)}
                                                                                                    placeholder="Image URL..."
                                                                                                    className="text-xs h-7"
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                        <Button 
                                                                                            type="button" 
                                                                                            size="sm" 
                                                                                            variant="ghost"
                                                                                            onClick={() => removeElementFromNestedColumn(sectionIndex, colIndex, nestedColIndex, elemIndex)}
                                                                                        >
                                                                                            <X className="w-3 h-3" />
                                                                                        </Button>
                                                                                    </div>

                                                                                    {/* Styling */}
                                                                                    <div className="flex gap-1 text-xs">
                                                                                        <div className="flex items-center gap-1">
                                                                                            <span className="text-[10px]">Color:</span>
                                                                                            <input
                                                                                                type="color"
                                                                                                value={element.color}
                                                                                                onChange={(e) => updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex, elemIndex, 'color', e.target.value)}
                                                                                                className="w-5 h-5 rounded border"
                                                                                            />
                                                                                        </div>
                                                                                        <select
                                                                                            value={element.align}
                                                                                            onChange={(e) => updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex, elemIndex, 'align', e.target.value)}
                                                                                            className="text-[10px] px-1 py-0.5 rounded border"
                                                                                        >
                                                                                            <option value="left">Left</option>
                                                                                            <option value="center">Center</option>
                                                                                            <option value="right">Right</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Add Element to Nested Column */}
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => addElementToNestedColumn(sectionIndex, colIndex, nestedColIndex, 'heading')}
                                                                                className="text-xs h-6"
                                                                            >
                                                                                <Type className="w-2 h-2 mr-0.5" />
                                                                                H
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => addElementToNestedColumn(sectionIndex, colIndex, nestedColIndex, 'text')}
                                                                                className="text-xs h-6"
                                                                            >
                                                                                <AlignLeft className="w-2 h-2 mr-0.5" />
                                                                                T
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => addElementToNestedColumn(sectionIndex, colIndex, nestedColIndex, 'image')}
                                                                                className="text-xs h-6"
                                                                            >
                                                                                <ImagePlus className="w-2 h-2 mr-0.5" />
                                                                                I
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Add Nested Column Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => addNestedColumn(sectionIndex, colIndex)}
                                                            className="w-full mt-2 py-1.5 border border-dashed border-blue-300 rounded text-blue-600 hover:bg-blue-50 transition text-xs flex items-center justify-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Add Nested Column
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link href="/pages">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>

                {/* Right Panel - Column Settings */}
                {selectedColumn && data.content.sections[selectedColumn.sectionIndex]?.columns[selectedColumn.colIndex] && (
                    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto border-l">
                        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
                            <h3 className="font-semibold text-sm">Column Settings</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedColumn(null)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {(() => {
                                const column = data.content.sections[selectedColumn.sectionIndex].columns[selectedColumn.colIndex];
                                
                                return (
                                    <>
                                        {/* Margin Settings */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-gray-700">Margin</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-xs">Top (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.marginTop || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginTop', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Right (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.marginRight || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginRight', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Bottom (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.marginBottom || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginBottom', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Left (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.marginLeft || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginLeft', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Padding Settings */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-gray-700">Padding</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-xs">Top (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.paddingTop || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingTop', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Right (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.paddingRight || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingRight', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Bottom (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.paddingBottom || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingBottom', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Left (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={column.paddingLeft || ''}
                                                        onChange={(e) => updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingLeft', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
