import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Type, AlignLeft, ImagePlus, Settings2, Monitor, Tablet, Smartphone, Square, FileText, ListIcon, Grid } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import StylePanel from '@/components/HomeSections/StylePanel';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home Sections',
        href: '/home-sections',
    },
    {
        title: 'Create',
        href: '/home-sections/create',
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
    type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery';
    value: string;
    items?: string[];
    listType?: 'bullet' | 'number';
    listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
    // Gallery properties
    images?: Array<{ url: string; caption?: string }>;
    galleryColumns?: number;
    galleryGap?: string;
    imageHeight?: string;
    captionFontSize?: string;
    captionColor?: string;
    captionAlign?: 'left' | 'center' | 'right';
    showCaptions?: boolean;
    // Common properties
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
    lineHeight?: string;
    letterSpacing?: string;
    borderRadius?: string;
    backgroundColor?: string;
    href?: string;
    target?: '_blank' | '_self';
    imageWidth?: string;
    aspectRatio?: string;
    objectFit?: string;
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
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    elements: ColumnElement[]; // Direct elements in column
    columns?: Column[]; // Optional nested columns
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

interface ContainerConfig {
    maxWidth?: string;
    horizontalPadding?: string;
    verticalPadding?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
}

export default function Create() {
    const [step, setStep] = useState(1);
    const [selectedElement, setSelectedElement] = useState<{
        type: 'column' | 'element' | 'nested-column' | 'nested-element' | 'container';
        rowIndex: number;
        colIndex: number;
        elementIndex?: number;
        nestedColIndex?: number;
    } | null>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        layout_type: '' as string,
        section_type: 'plain' as string, // Default to plain, column can toggle card individually
        background_color: '#ffffff',
        background_config: {
            type: 'solid',
            color: '#ffffff',
            gradient: {
                color1: '#3b82f6',
                color2: '#8b5cf6',
                angle: 90
            }
        } as BackgroundConfig,
        container_config: {
            maxWidth: 'max-w-7xl',
            horizontalPadding: '16',
            verticalPadding: '32',
            paddingTop: '',
            paddingBottom: '',
            paddingLeft: '',
            paddingRight: ''
        } as ContainerConfig,
        content: {
            rows: [] as Row[],
        },
        is_active: true,
    });

    const handleNext = () => {
        if (step === 1 && data.layout_type) {
            const layout = LAYOUT_TYPES.find(l => l.value === data.layout_type);
            const numColumns = layout?.columns || 1;
            const widths = layout?.bars || [12];
            
            const columns: Column[] = Array.from({ length: numColumns }, (_, i) => ({
                id: `col-${Date.now()}-${i}`,
                width: widths[i] || 12,
                widthTablet: 12,
                widthMobile: 12,
                card: false, // Default plain, user can toggle per column
                marginTop: '0',
                marginBottom: '0',
                marginLeft: '0',
                marginRight: '0',
                paddingTop: '0',
                paddingBottom: '0',
                paddingLeft: '0',
                paddingRight: '0',
                elements: [], // Start with empty elements
                columns: [], // Optional nested columns
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
        post('/home-sections');
    };

    const addRow = () => {
        const newRow: Row = {
            id: `row-${Date.now()}`,
            columns: [{
                id: `col-${Date.now()}`,
                width: 12,
                widthTablet: 12,
                widthMobile: 12,
                card: false,
                elements: [],
                columns: []
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
            widthTablet: 12,
            widthMobile: 12,
            card: false,
            marginTop: '0',
            marginBottom: '0',
            marginLeft: '0',
            marginRight: '0',
            paddingTop: '0',
            paddingBottom: '0',
            paddingLeft: '0',
            paddingRight: '0',
            elements: [],
            columns: []
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

    const updateColumnSpacing = (rowIndex: number, colIndex: number, field: string, value: string) => {
        const newRows = [...data.content.rows];
        (newRows[rowIndex].columns[colIndex] as any)[field] = value;
        setData('content', { rows: newRows });
    };

    const updateContainer = (field: string, value: string) => {
        setData('container_config', {
            ...data.container_config,
            [field]: value
        });
    };


    // Direct element handlers for columns
    const addElementToColumn = (rowIndex: number, colIndex: number, type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery') => {
        const newRows = [...data.content.rows];
        const column = newRows[rowIndex].columns[colIndex];
        if (!column.elements) {
            column.elements = [];
        }
        const newElement: ColumnElement = {
            type,
            value: '',
            items: type === 'list' ? ['Item 1', 'Item 2', 'Item 3'] : undefined,
            listType: type === 'list' ? 'bullet' : undefined,
            listStyle: type === 'list' ? 'disc' : undefined,
            images: type === 'gallery' ? [] : undefined,
            galleryColumns: type === 'gallery' ? 3 : undefined,
            galleryGap: type === 'gallery' ? '16' : undefined,
            imageHeight: type === 'gallery' ? '200' : undefined,
            captionFontSize: type === 'gallery' ? 'text-sm' : undefined,
            captionColor: type === 'gallery' ? '#6b7280' : undefined,
            captionAlign: type === 'gallery' ? 'center' : undefined,
            showCaptions: type === 'gallery' ? true : undefined,
            color: type === 'heading' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : (type === 'card' ? 'text-base' : 'text-lg'),
            align: 'left',
            lineHeight: '1.5',
            letterSpacing: '0',
            borderRadius: type === 'card' ? '8' : '0',
            backgroundColor: type === 'card' ? '#ffffff' : undefined,
            href: type === 'card' ? '' : undefined,
            target: type === 'card' ? '_self' : undefined,
            marginTop: '0',
            marginBottom: '16',
            marginLeft: '0',
            marginRight: '0',
            paddingTop: type === 'card' ? '16' : '0',
            paddingBottom: type === 'card' ? '16' : '0',
            paddingLeft: type === 'card' ? '16' : '0',
            paddingRight: type === 'card' ? '16' : '0'
        };
        column.elements.push(newElement);
        setData('content', { rows: newRows });
    };

    const updateElementInColumn = (rowIndex: number, colIndex: number, elementIndex: number, field: 'value' | 'items' | 'listType' | 'listStyle' | 'images' | 'galleryColumns' | 'galleryGap' | 'imageHeight' | 'captionFontSize' | 'captionColor' | 'captionAlign' | 'showCaptions' | 'color' | 'fontSize' | 'align' | 'lineHeight' | 'letterSpacing' | 'borderRadius' | 'backgroundColor' | 'href' | 'target' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight' | 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight', value: any) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].elements[elementIndex][field] = value;
        setData('content', { rows: newRows });
    };

    const removeElementFromColumn = (rowIndex: number, colIndex: number, elementIndex: number) => {
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

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const result = await response.json();
                
                if (result.url) {
                    updateElementInColumn(rowIndex, colIndex, elementIndex, 'value', result.url);
                } else {
                    console.error('No URL in response:', result);
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Failed to upload image. Please try again.');
            }
        };
        
        input.click();
    };

    const handleGalleryImageUpload = async (rowIndex: number, colIndex: number, elementIndex: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                console.error('CSRF token not found');
                alert('CSRF token not found. Please refresh the page.');
                return;
            }

            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('/upload-image', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Upload failed:', response.status, errorText);
                        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    return result.url ? { url: result.url, caption: '' } : null;
                } catch (error) {
                    console.error('Upload failed:', error);
                    return null;
                }
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const validImages = uploadedImages.filter(img => img !== null);

            if (validImages.length > 0) {
                const newRows = [...data.content.rows];
                const element = newRows[rowIndex].columns[colIndex].elements[elementIndex];
                const currentImages = element.images || [];
                element.images = [...currentImages, ...validImages];
                setData('content', { rows: newRows });
            } else {
                alert('Failed to upload images. Please try again.');
            }
        };
        
        input.click();
    };

    const removeGalleryImage = (rowIndex: number, colIndex: number, elementIndex: number, imageIndex: number) => {
        const newRows = [...data.content.rows];
        const element = newRows[rowIndex].columns[colIndex].elements[elementIndex];
        element.images?.splice(imageIndex, 1);
        setData('content', { rows: newRows });
    };

    const updateGalleryImageCaption = (rowIndex: number, colIndex: number, elementIndex: number, imageIndex: number, caption: string) => {
        const newRows = [...data.content.rows];
        const element = newRows[rowIndex].columns[colIndex].elements[elementIndex];
        if (element.images && element.images[imageIndex]) {
            element.images[imageIndex].caption = caption;
            setData('content', { rows: newRows });
        }
    };


    // Nested columns handlers (optional advanced feature)
    const addNestedColumn = (rowIndex: number, colIndex: number) => {
        const newRows = [...data.content.rows];
        const column = newRows[rowIndex].columns[colIndex];
        
        if (!column.columns) {
            column.columns = [];
        }
        
        const newNestedColumn: Column = {
            id: `nested-${Date.now()}`,
            width: 6,
            widthTablet: 12,
            widthMobile: 12,
            card: false,
            elements: [],
        };
        
        column.columns.push(newNestedColumn);
        setData('content', { rows: newRows });
    };

    const removeNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].columns!.splice(nestedColIndex, 1);
        setData('content', { rows: newRows });
    };

    const updateNestedColumnWidth = (rowIndex: number, colIndex: number, nestedColIndex: number, width: number) => {
        const newRows = [...data.content.rows];
        newRows[rowIndex].columns[colIndex].columns![nestedColIndex].width = width;
        setData('content', { rows: newRows });
    };

    const updateNestedColumnSpacing = (rowIndex: number, colIndex: number, nestedColIndex: number, field: string, value: string) => {
        const newRows = [...data.content.rows];
        (newRows[rowIndex].columns[colIndex].columns![nestedColIndex] as any)[field] = value;
        setData('content', { rows: newRows });
    };

    const addElementToNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number, type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery') => {
        const newRows = [...data.content.rows];
        const nestedCol = newRows[rowIndex].columns[colIndex].columns![nestedColIndex];
        if (!nestedCol.elements) {
            nestedCol.elements = [];
        }
        const newElement: ColumnElement = {
            type,
            value: '',
            items: type === 'list' ? ['Item 1', 'Item 2', 'Item 3'] : undefined,
            listType: type === 'list' ? 'bullet' : undefined,
            listStyle: type === 'list' ? 'disc' : undefined,
            images: type === 'gallery' ? [] : undefined,
            galleryColumns: type === 'gallery' ? 3 : undefined,
            galleryGap: type === 'gallery' ? '16' : undefined,
            imageHeight: type === 'gallery' ? '200' : undefined,
            captionFontSize: type === 'gallery' ? 'text-sm' : undefined,
            captionColor: type === 'gallery' ? '#6b7280' : undefined,
            captionAlign: type === 'gallery' ? 'center' : undefined,
            showCaptions: type === 'gallery' ? true : undefined,
            color: type === 'heading' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : (type === 'card' ? 'text-base' : 'text-lg'),
            align: 'left',
            lineHeight: '1.5',
            letterSpacing: '0',
            borderRadius: type === 'card' ? '8' : '0',
            backgroundColor: type === 'card' ? '#ffffff' : undefined,
            href: type === 'card' ? '' : undefined,
            target: type === 'card' ? '_self' : undefined,
            marginTop: '0',
            marginBottom: '16',
            marginLeft: '0',
            marginRight: '0',
            paddingTop: type === 'card' ? '16' : '0',
            paddingBottom: type === 'card' ? '16' : '0',
            paddingLeft: type === 'card' ? '16' : '0',
            paddingRight: type === 'card' ? '16' : '0'
        };
        nestedCol.elements.push(newElement);
        setData('content', { rows: newRows });
    };

    const updateElementInNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, field: 'value' | 'items' | 'listType' | 'listStyle' | 'images' | 'galleryColumns' | 'galleryGap' | 'imageHeight' | 'captionFontSize' | 'captionColor' | 'captionAlign' | 'showCaptions' | 'color' | 'fontSize' | 'align' | 'lineHeight' | 'letterSpacing' | 'borderRadius' | 'backgroundColor' | 'href' | 'target' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight' | 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight', value: any) => {
        const newRows = [...data.content.rows];
        const nestedCol = newRows[rowIndex].columns[colIndex].columns![nestedColIndex];
        nestedCol.elements[elementIndex][field] = value;
        setData('content', { rows: newRows });
    };

    const removeElementFromNestedColumn = (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
        const newRows = [...data.content.rows];
        const nestedCol = newRows[rowIndex].columns[colIndex].columns![nestedColIndex];
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

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const result = await response.json();
                
                if (result.url) {
                    updateElementInNestedColumn(rowIndex, colIndex, nestedColIndex, elementIndex, 'value', result.url);
                } else {
                    console.error('No URL in response:', result);
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Failed to upload image. Please try again.');
            }
        };
        
        input.click();
    };

    const handleNestedGalleryImageUpload = async (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                console.error('CSRF token not found');
                alert('CSRF token not found. Please refresh the page.');
                return;
            }

            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('/upload-image', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Upload failed:', response.status, errorText);
                        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    return result.url ? { url: result.url, caption: '' } : null;
                } catch (error) {
                    console.error('Upload failed:', error);
                    return null;
                }
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const validImages = uploadedImages.filter(img => img !== null);

            if (validImages.length > 0) {
                const newRows = [...data.content.rows];
                const element = newRows[rowIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
                const currentImages = element.images || [];
                element.images = [...currentImages, ...validImages];
                setData('content', { rows: newRows });
            } else {
                alert('Failed to upload images. Please try again.');
            }
        };
        
        input.click();
    };

    const removeNestedGalleryImage = (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, imageIndex: number) => {
        const newRows = [...data.content.rows];
        const element = newRows[rowIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        element.images?.splice(imageIndex, 1);
        setData('content', { rows: newRows });
    };

    const updateNestedGalleryImageCaption = (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, imageIndex: number, caption: string) => {
        const newRows = [...data.content.rows];
        const element = newRows[rowIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (element.images && element.images[imageIndex]) {
            element.images[imageIndex].caption = caption;
            setData('content', { rows: newRows });
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Section" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/home-sections">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Create New Section
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

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                        type="button" 
                                        onClick={handleNext}
                                        disabled={!data.layout_type}
                                    >
                                        Next: Add Content
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Content Form */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6" style={{ marginRight: selectedElement ? '320px' : '0', transition: 'margin-right 0.3s ease' }}>
                            <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <div className="p-6 space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Content</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            {LAYOUT_TYPES.find(l => l.value === data.layout_type)?.label || 'Layout'}
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

                                    {/* Container Settings Button */}
                                    <div className="border-2 border-amber-300 rounded-lg p-4 bg-amber-50/30">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedElement({ type: 'container', rowIndex: 0, colIndex: 0 })}
                                            className="w-full px-4 py-3 rounded-md border-2 border-amber-500 text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                            Container Settings (Padding & Width)
                                        </button>
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
                                                                <div className="flex gap-2 items-start flex-wrap">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedElement({ type: 'column', rowIndex, colIndex })}
                                                                        className="text-xs px-2 py-1 rounded-md border border-blue-400 text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 self-end"
                                                                        title="Column Spacing & Settings"
                                                                    >
                                                                        <Settings2 className="w-3 h-3" />
                                                                        Spacing
                                                                    </button>
                                                                    
                                                                    {/* Desktop Width */}
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                                                                            <Monitor className="w-3 h-3" /> Desktop
                                                                        </span>
                                                                        <select
                                                                            value={column.width}
                                                                            onChange={(e) => updateColumnWidth(rowIndex, colIndex, parseInt(e.target.value))}
                                                                            className="text-xs px-1 py-0.5 rounded border"
                                                                        >
                                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                <option key={w} value={w}>{w}/12</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    {/* Tablet Width */}
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                                                                            <Tablet className="w-3 h-3" /> Tablet
                                                                        </span>
                                                                        <select
                                                                            value={column.widthTablet || column.width}
                                                                            onChange={(e) => updateColumnSpacing(rowIndex, colIndex, 'widthTablet', e.target.value)}
                                                                            className="text-xs px-1 py-0.5 rounded border"
                                                                        >
                                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                <option key={w} value={w}>{w}/12</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    {/* Mobile Width */}
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                                                                            <Smartphone className="w-3 h-3" /> Mobile
                                                                        </span>
                                                                        <select
                                                                            value={column.widthMobile || 12}
                                                                            onChange={(e) => updateColumnSpacing(rowIndex, colIndex, 'widthMobile', e.target.value)}
                                                                            className="text-xs px-1 py-0.5 rounded border"
                                                                        >
                                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                <option key={w} value={w}>{w}/12</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleColumnCard(rowIndex, colIndex)}
                                                                        className="text-xs px-2 py-1 rounded-md border transition-colors self-end"
                                                                    >
                                                                        {column.card ? '🎴 Card' : '📄 Plain'}
                                                                    </button>
                                                                    {row.columns.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeColumn(rowIndex, colIndex)}
                                                                            className="text-xs px-2 py-1 rounded-md border border-red-400 text-red-700 hover:bg-red-50 transition-colors self-end"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Direct Elements in Column */}
                                                            <div className="space-y-2 mb-3">
                                                                {column.elements && column.elements.map((element, elemIndex) => (
                                                                    <div key={elemIndex} className="space-y-1">
                                                                        {/* Element Type Label */}
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                                                                                element.type === 'heading' ? 'bg-blue-100 text-blue-700' :
                                                                                element.type === 'text' ? 'bg-green-100 text-green-700' :
                                                                                element.type === 'card' ? 'bg-purple-100 text-purple-700' :
                                                                                element.type === 'image' ? 'bg-orange-100 text-orange-700' :
                                                                                element.type === 'list' ? 'bg-yellow-100 text-yellow-700' :
                                                                                element.type === 'gallery' ? 'bg-pink-100 text-pink-700' :
                                                                                'bg-gray-100 text-gray-700'
                                                                            }`}>
                                                                                {element.type === 'heading' ? (
                                                                                    <>
                                                                                        <Type className="w-3 h-3" />
                                                                                        Heading
                                                                                    </>
                                                                                ) : element.type === 'text' ? (
                                                                                    <>
                                                                                        <FileText className="w-3 h-3" />
                                                                                        Text
                                                                                    </>
                                                                                ) : element.type === 'card' ? (
                                                                                    <>
                                                                                        <Square className="w-3 h-3" />
                                                                                        Card
                                                                                    </>
                                                                                ) : element.type === 'image' ? (
                                                                                    <>
                                                                                        <ImagePlus className="w-3 h-3" />
                                                                                        Image
                                                                                    </>
                                                                                ) : element.type === 'list' ? (
                                                                                    <>
                                                                                        <ListIcon className="w-3 h-3" />
                                                                                        List
                                                                                    </>
                                                                                ) : element.type === 'gallery' ? (
                                                                                    <>
                                                                                        <Grid className="w-3 h-3" />
                                                                                        Gallery
                                                                                    </>
                                                                                ) : (
                                                                                    <>Unknown</>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex gap-1 items-start">
                                                                            <div className="flex-1">
                                                                                {element.type === 'heading' && (
                                                                                    <Input
                                                                                        value={element.value}
                                                                                        onChange={(e) => updateElementInColumn(rowIndex, colIndex, elemIndex, 'value', e.target.value)}
                                                                                        onClick={() => setSelectedElement({ type: 'element', rowIndex, colIndex, elementIndex: elemIndex })}
                                                                                        placeholder="Heading..."
                                                                                        className="text-sm cursor-pointer"
                                                                                    />
                                                                                )}
                                                                                {element.type === 'text' && (
                                                                                    <Textarea
                                                                                        value={element.value}
                                                                                        onChange={(e) => updateElementInColumn(rowIndex, colIndex, elemIndex, 'value', e.target.value)}
                                                                                        onClick={() => setSelectedElement({ type: 'element', rowIndex, colIndex, elementIndex: elemIndex })}
                                                                                        placeholder="Text..."
                                                                                        rows={2}
                                                                                        className="text-sm cursor-pointer"
                                                                                    />
                                                                                )}
                                                                                {element.type === 'image' && (
                                                                                    <div>
                                                                                        {element.value ? (
                                                                                            <div 
                                                                                                className="relative cursor-pointer"
                                                                                                onClick={() => setSelectedElement({ type: 'element', rowIndex, colIndex, elementIndex: elemIndex })}
                                                                                                style={{
                                                                                                    borderRadius: element.borderRadius && element.borderRadius.trim()
                                                                                                        ? (element.borderRadius.includes('%') || element.borderRadius.includes('px') || element.borderRadius.includes('rem') || element.borderRadius.includes('em')
                                                                                                            ? element.borderRadius 
                                                                                                            : `${element.borderRadius}px`)
                                                                                                        : '0px',
                                                                                                    overflow: 'hidden',
                                                                                                    width: element.imageWidth === 'full' || !element.imageWidth
                                                                                                        ? '100%'
                                                                                                        : element.imageWidth.includes('%')
                                                                                                            ? element.imageWidth
                                                                                                            : element.imageWidth,
                                                                                                    maxWidth: '100%',
                                                                                                }}
                                                                                            >
                                                                                                <img 
                                                                                                    src={element.value} 
                                                                                                    alt="Preview" 
                                                                                                    className="w-full border"
                                                                                                    style={{
                                                                                                        aspectRatio: element.aspectRatio && element.aspectRatio !== 'auto' 
                                                                                                            ? element.aspectRatio 
                                                                                                            : undefined,
                                                                                                        objectFit: element.objectFit || 'cover',
                                                                                                    }}
                                                                                                />
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        handleImageUpload(rowIndex, colIndex, elemIndex);
                                                                                                    }}
                                                                                                    className="absolute top-1 right-1 bg-white rounded px-2 py-1 text-xs shadow hover:bg-gray-50"
                                                                                                >
                                                                                                    Change
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleImageUpload(rowIndex, colIndex, elemIndex)}
                                                                                                className="w-full h-24 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm hover:border-gray-400 hover:bg-gray-50"
                                                                                            >
                                                                                                Click to Upload Image
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                                {element.type === 'card' && (
                                                                                    <div className="border rounded p-3 bg-gray-50">
                                                                                        <Textarea
                                                                                            value={element.value}
                                                                                            onChange={(e) => updateElementInColumn(rowIndex, colIndex, elemIndex, 'value', e.target.value)}
                                                                                            onClick={() => setSelectedElement({ type: 'element', rowIndex, colIndex, elementIndex: elemIndex })}
                                                                                            placeholder="Card text..."
                                                                                            rows={3}
                                                                                            className="text-sm cursor-pointer bg-white"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                {element.type === 'list' && (
                                                                                    <div className="border rounded p-3 bg-gray-50 space-y-2">
                                                                                        {element.items && element.items.map((item, itemIndex) => (
                                                                                            <div key={itemIndex} className="flex gap-2 items-center">
                                                                                                <Input
                                                                                                    value={item}
                                                                                                    onChange={(e) => {
                                                                                                        const newItems = [...(element.items || [])];
                                                                                                        newItems[itemIndex] = e.target.value;
                                                                                                        updateElementInColumn(rowIndex, colIndex, elemIndex, 'items', newItems);
                                                                                                    }}
                                                                                                    placeholder={`Item ${itemIndex + 1}`}
                                                                                                    className="text-sm bg-white flex-1"
                                                                                                />
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => {
                                                                                                        const newItems = [...(element.items || [])];
                                                                                                        newItems.splice(itemIndex, 1);
                                                                                                        updateElementInColumn(rowIndex, colIndex, elemIndex, 'items', newItems);
                                                                                                    }}
                                                                                                    className="text-red-600 p-1 hover:bg-red-50 rounded"
                                                                                                    title="Remove item"
                                                                                                >
                                                                                                    <X className="w-4 h-4" />
                                                                                                </button>
                                                                                            </div>
                                                                                        ))}
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                const newItems = [...(element.items || []), `Item ${(element.items?.length || 0) + 1}`];
                                                                                                updateElementInColumn(rowIndex, colIndex, elemIndex, 'items', newItems);
                                                                                            }}
                                                                                            className="text-blue-600 text-sm px-3 py-1 hover:bg-blue-50 rounded flex items-center gap-1"
                                                                                        >
                                                                                            <Plus className="w-3 h-3" />
                                                                                            Add Item
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                                {element.type === 'gallery' && (
                                                                                    <div className="border rounded p-3 bg-gray-50 space-y-3">
                                                                                        {element.images && element.images.length > 0 ? (
                                                                                            <div 
                                                                                                className="grid gap-2"
                                                                                                style={{
                                                                                                    gridTemplateColumns: `repeat(${element.galleryColumns || 3}, 1fr)`,
                                                                                                    gap: element.galleryGap ? `${element.galleryGap}px` : '16px'
                                                                                                }}
                                                                                            >
                                                                                                {element.images.map((img, imgIndex) => (
                                                                                                    <div key={imgIndex} className="relative group">
                                                                                                        <img 
                                                                                                            src={img.url} 
                                                                                                            alt={img.caption || `Gallery ${imgIndex + 1}`}
                                                                                                            className="w-full object-cover rounded"
                                                                                                            style={{
                                                                                                                height: element.imageHeight ? `${element.imageHeight}px` : '200px'
                                                                                                            }}
                                                                                                        />
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => removeGalleryImage(rowIndex, colIndex, elemIndex, imgIndex)}
                                                                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                        >
                                                                                                            <X className="w-3 h-3" />
                                                                                                        </button>
                                                                                                        {element.showCaptions && (
                                                                                                            <Input
                                                                                                                value={img.caption || ''}
                                                                                                                onChange={(e) => updateGalleryImageCaption(rowIndex, colIndex, elemIndex, imgIndex, e.target.value)}
                                                                                                                placeholder="Caption..."
                                                                                                                className="mt-1 text-xs bg-white"
                                                                                                            />
                                                                                                        )}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <p className="text-xs text-gray-500 text-center py-4">No images yet</p>
                                                                                        )}
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleGalleryImageUpload(rowIndex, colIndex, elemIndex)}
                                                                                            className="w-full py-2 border border-dashed border-blue-400 rounded text-blue-600 text-sm hover:bg-blue-50 flex items-center justify-center gap-2"
                                                                                        >
                                                                                            <ImagePlus className="w-4 h-4" />
                                                                                            Add Images to Gallery
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeElementFromColumn(rowIndex, colIndex, elemIndex)}
                                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0"
                                                                                title="Remove element"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Add Element Buttons */}
                                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addElementToColumn(rowIndex, colIndex, 'heading')}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Type className="w-4 h-4" />
                                                                    Heading
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addElementToColumn(rowIndex, colIndex, 'text')}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <AlignLeft className="w-4 h-4" />
                                                                    Text
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addElementToColumn(rowIndex, colIndex, 'image')}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <ImagePlus className="w-4 h-4" />
                                                                    Image
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addElementToColumn(rowIndex, colIndex, 'card')}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Square className="w-4 h-4" />
                                                                    Card
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addElementToColumn(rowIndex, colIndex, 'list')}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <ListIcon className="w-4 h-4" />
                                                                    List
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addElementToColumn(rowIndex, colIndex, 'gallery')}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Grid className="w-4 h-4" />
                                                                    Gallery
                                                                </button>
                                                            </div>

                                                            {/* Nested Columns Section */}
                                                            {column.columns && column.columns.length > 0 ? (
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
                                                                                    <div className="flex gap-1 items-center flex-wrap">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setSelectedElement({ type: 'nested-column', rowIndex, colIndex, nestedColIndex })}
                                                                                            className="text-xs px-2 py-1 rounded-md border border-purple-400 text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1"
                                                                                            title="Nested Column Spacing & Settings"
                                                                                        >
                                                                                            <Settings2 className="w-3 h-3" />
                                                                                        </button>
                                                                                        
                                                                                        {/* Desktop Width */}
                                                                                        <div className="flex flex-col">
                                                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                                                                                                <Monitor className="w-3 h-3" /> Desktop
                                                                                            </span>
                                                                                            <select
                                                                                                value={nestedCol.width}
                                                                                                onChange={(e) => updateNestedColumnWidth(rowIndex, colIndex, nestedColIndex, parseInt(e.target.value))}
                                                                                                className="text-xs px-1 py-0.5 rounded border"
                                                                                            >
                                                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                                    <option key={w} value={w}>{w}/12</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>

                                                                                        {/* Tablet Width */}
                                                                                        <div className="flex flex-col">
                                                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                                                                                                <Tablet className="w-3 h-3" /> Tablet
                                                                                            </span>
                                                                                            <select
                                                                                                value={nestedCol.widthTablet || nestedCol.width}
                                                                                                onChange={(e) => updateNestedColumnSpacing(rowIndex, colIndex, nestedColIndex, 'widthTablet', e.target.value)}
                                                                                                className="text-xs px-1 py-0.5 rounded border"
                                                                                            >
                                                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                                    <option key={w} value={w}>{w}/12</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>

                                                                                        {/* Mobile Width */}
                                                                                        <div className="flex flex-col">
                                                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                                                                                                <Smartphone className="w-3 h-3" /> Mobile
                                                                                            </span>
                                                                                            <select
                                                                                                value={nestedCol.widthMobile || 12}
                                                                                                onChange={(e) => updateNestedColumnSpacing(rowIndex, colIndex, nestedColIndex, 'widthMobile', e.target.value)}
                                                                                                className="text-xs px-1 py-0.5 rounded border"
                                                                                            >
                                                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                                    <option key={w} value={w}>{w}/12</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>
                                                                                        
                                                                                        {column.columns!.length > 1 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeNestedColumn(rowIndex, colIndex, nestedColIndex)}
                                                                                                className="text-xs px-1 py-0.5 rounded border border-red-400 text-red-700 hover:bg-red-50"
                                                                                                title="Remove nested column"
                                                                                            >
                                                                                                <X className="w-3 h-3" />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Nested Column Elements */}
                                                                                <div className="space-y-1.5 mb-2">
                                                                                    {nestedCol.elements.map((element, elemIndex) => (
                                                                                        <div key={elemIndex} className="space-y-1">
                                                                                            {/* Element Type Label */}
                                                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-0.5 ${
                                                                                                element.type === 'heading' ? 'bg-blue-100 text-blue-700' :
                                                                                                element.type === 'text' ? 'bg-green-100 text-green-700' :
                                                                                                element.type === 'card' ? 'bg-purple-100 text-purple-700' :
                                                                                                element.type === 'image' ? 'bg-orange-100 text-orange-700' :
                                                                                                element.type === 'list' ? 'bg-yellow-100 text-yellow-700' :
                                                                                                element.type === 'gallery' ? 'bg-pink-100 text-pink-700' :
                                                                                                'bg-gray-100 text-gray-700'
                                                                                            }`}>
                                                                                                {element.type === 'heading' ? (
                                                                                                    <>
                                                                                                        <Type className="w-2.5 h-2.5" />
                                                                                                        H
                                                                                                    </>
                                                                                                ) : element.type === 'text' ? (
                                                                                                    <>
                                                                                                        <FileText className="w-2.5 h-2.5" />
                                                                                                        T
                                                                                                    </>
                                                                                                ) : element.type === 'card' ? (
                                                                                                    <>
                                                                                                        <Square className="w-2.5 h-2.5" />
                                                                                                        C
                                                                                                    </>
                                                                                                ) : element.type === 'image' ? (
                                                                                                    <>
                                                                                                        <ImagePlus className="w-2.5 h-2.5" />
                                                                                                        I
                                                                                                    </>
                                                                                                ) : element.type === 'list' ? (
                                                                                                    <>
                                                                                                        <ListIcon className="w-2.5 h-2.5" />
                                                                                                        L
                                                                                                    </>
                                                                                                ) : element.type === 'gallery' ? (
                                                                                                    <>
                                                                                                        <Grid className="w-2.5 h-2.5" />
                                                                                                        G
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>?</>
                                                                                                )}
                                                                                            </span>
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
                                                                                                            <div 
                                                                                                                className="relative"
                                                                                                                style={{
                                                                                                                    borderRadius: element.borderRadius && element.borderRadius.trim()
                                                                                                                        ? (element.borderRadius.includes('%') || element.borderRadius.includes('px') || element.borderRadius.includes('rem') || element.borderRadius.includes('em')
                                                                                                                            ? element.borderRadius 
                                                                                                                            : `${element.borderRadius}px`)
                                                                                                                        : '0px',
                                                                                                                    overflow: 'hidden',
                                                                                                                    width: element.imageWidth === 'full' || !element.imageWidth
                                                                                                                        ? '100%'
                                                                                                                        : element.imageWidth.includes('%')
                                                                                                                            ? element.imageWidth
                                                                                                                            : element.imageWidth,
                                                                                                                    maxWidth: '100%',
                                                                                                                }}
                                                                                                            >
                                                                                                                <img 
                                                                                                                    src={element.value} 
                                                                                                                    alt="Preview" 
                                                                                                                    className="w-full border"
                                                                                                                    style={{
                                                                                                                        aspectRatio: element.aspectRatio && element.aspectRatio !== 'auto' 
                                                                                                                            ? element.aspectRatio 
                                                                                                                            : undefined,
                                                                                                                        objectFit: element.objectFit || 'cover',
                                                                                                                    }}
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
                                                                                                    onClick={() => setSelectedElement({ type: 'nested-element', rowIndex, colIndex, nestedColIndex, elementIndex: elemIndex })}
                                                                                                    className="text-blue-600 p-0.5 hover:bg-blue-50 rounded"
                                                                                                    title="Element Settings"
                                                                                                >
                                                                                                    <Settings2 className="w-3 h-3" />
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => removeElementFromNestedColumn(rowIndex, colIndex, nestedColIndex, elemIndex)}
                                                                                                    className="text-red-600 p-0.5 hover:bg-red-50 rounded"
                                                                                                    title="Remove element"
                                                                                                >
                                                                                                    <X className="w-3 h-3" />
                                                                                                </button>
                                                                                            </div>
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
                                                            ) : null}

                                                            {/* Add Nested Column Button (Optional Advanced Feature) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => addNestedColumn(rowIndex, colIndex)}
                                                                className="w-full mt-3 py-2 border border-dashed border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition text-xs flex items-center justify-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Add Nested Column (Advanced)
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
                                        Create Section
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Inline Style Panel - Right Sidebar - Same as Edit.tsx */}
            {selectedElement && data.content?.rows && (() => {
                const { type, rowIndex, colIndex, elementIndex } = selectedElement;
                let currentItem: any = null;
                let itemType = '';

                if (type === 'column') {
                    currentItem = data.content.rows[rowIndex]?.columns[colIndex];
                    itemType = 'Column';
                } else if (type === 'element' && elementIndex !== undefined) {
                    currentItem = data.content.rows[rowIndex]?.columns[colIndex]?.elements[elementIndex];
                    itemType = currentItem?.type === 'heading' ? 'Heading' : currentItem?.type === 'text' ? 'Text' : 'Image';
                }

                if (!currentItem) return null;

                const handleUpdate = (field: string, value: string) => {
                    if (type === 'element' && elementIndex !== undefined) {
                        updateElementInColumn(rowIndex, colIndex, elementIndex, field, value);
                    } else if (type === 'column') {
                        updateColumnSpacing(rowIndex, colIndex, field, value);
                    }
                };

                return (
                    <div className="fixed right-0 top-0 h-screen w-80 bg-white dark:bg-neutral-800 border-l border-gray-200 dark:border-neutral-700 shadow-xl overflow-y-auto z-50">
                        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {itemType} Styles
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedElement(null)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Column Width for Column type */}
                            {type === 'column' && (
                                <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-blue-300">
                                        📐 Column Width (Responsive)
                                    </h4>
                                    
                                    <div>
                                        <Label className="text-xs mb-2 flex items-center gap-1.5">
                                            <Monitor className="w-3.5 h-3.5" />
                                            Desktop
                                        </Label>
                                        <select
                                            value={currentItem.width || 12}
                                            onChange={(e) => handleUpdate('width', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                <option key={w} value={w}>{w}/12 {w === 12 ? '(Full)' : w === 6 ? '(Half)' : w === 4 ? '(Third)' : w === 3 ? '(Quarter)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-2 flex items-center gap-1.5">
                                            <Tablet className="w-3.5 h-3.5" />
                                            Tablet
                                        </Label>
                                        <select
                                            value={currentItem.widthTablet || currentItem.width || 12}
                                            onChange={(e) => handleUpdate('widthTablet', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            <option value="">Same as Desktop</option>
                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                <option key={w} value={w}>{w}/12 {w === 12 ? '(Full)' : w === 6 ? '(Half)' : w === 4 ? '(Third)' : w === 3 ? '(Quarter)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-2 flex items-center gap-1.5">
                                            <Smartphone className="w-3.5 h-3.5" />
                                            Mobile
                                        </Label>
                                        <select
                                            value={currentItem.widthMobile || 12}
                                            onChange={(e) => handleUpdate('widthMobile', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            <option value="">Auto (Full Width)</option>
                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                <option key={w} value={w}>{w}/12 {w === 12 ? '(Full)' : w === 6 ? '(Half)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Typography for Heading/Text - Same as Edit.tsx but simplified inline */}
                            {type === 'element' && (currentItem.type === 'heading' || currentItem.type === 'text') && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Typography</h4>
                                    
                                    <div>
                                        <Label className="text-xs mb-2 block">Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={currentItem.color || '#000000'}
                                                onChange={(e) => handleUpdate('color', e.target.value)}
                                                className="w-16 h-10 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={currentItem.color || '#000000'}
                                                onChange={(e) => handleUpdate('color', e.target.value)}
                                                placeholder="#000000"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-2 block">Font Size</Label>
                                        <select
                                            value={currentItem.fontSize || (currentItem.type === 'heading' ? 'text-3xl' : 'text-lg')}
                                            onChange={(e) => handleUpdate('fontSize', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            {currentItem.type === 'heading' ? (
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

                                    <div>
                                        <Label className="text-xs mb-2 block">Alignment</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['left', 'center', 'right'].map((align) => (
                                                <button
                                                    key={align}
                                                    type="button"
                                                    onClick={() => handleUpdate('align', align)}
                                                    className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                                                        (currentItem.align || 'left') === align
                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                    }`}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-2 block">Line Height</Label>
                                        <select
                                            value={currentItem.lineHeight || '1.5'}
                                            onChange={(e) => handleUpdate('lineHeight', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            <option value="1">1</option>
                                            <option value="1.25">1.25</option>
                                            <option value="1.5">1.5</option>
                                            <option value="1.75">1.75</option>
                                            <option value="2">2</option>
                                            <option value="2.5">2.5</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-2 block">Letter Spacing</Label>
                                        <select
                                            value={currentItem.letterSpacing || '0'}
                                            onChange={(e) => handleUpdate('letterSpacing', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            <option value="-0.05">Tighter</option>
                                            <option value="-0.025">Tight</option>
                                            <option value="0">Normal</option>
                                            <option value="0.025">Wide</option>
                                            <option value="0.05">Wider</option>
                                            <option value="0.1">Widest</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Spacing - For all element types and columns */}
                            {(type === 'column' || type === 'element') && (
                                <>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs mb-1 block">Top</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.marginTop || '0'}
                                                    onChange={(e) => handleUpdate('marginTop', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Right</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.marginRight || '0'}
                                                    onChange={(e) => handleUpdate('marginRight', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Bottom</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.marginBottom || '0'}
                                                    onChange={(e) => handleUpdate('marginBottom', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Left</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.marginLeft || '0'}
                                                    onChange={(e) => handleUpdate('marginLeft', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs mb-1 block">Top</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.paddingTop || '0'}
                                                    onChange={(e) => handleUpdate('paddingTop', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Right</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.paddingRight || '0'}
                                                    onChange={(e) => handleUpdate('paddingRight', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Bottom</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.paddingBottom || '0'}
                                                    onChange={(e) => handleUpdate('paddingBottom', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs mb-1 block">Left</Label>
                                                <Input
                                                    type="number"
                                                    value={currentItem.paddingLeft || '0'}
                                                    onChange={(e) => handleUpdate('paddingLeft', e.target.value)}
                                                    min="0"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Style Panel */}
            <StylePanel
                selectedElement={selectedElement}
                data={data}
                onClose={() => setSelectedElement(null)}
                onUpdateElement={updateElementInColumn}
                onUpdateColumn={updateColumnSpacing}
                onUpdateNestedColumn={updateNestedColumnSpacing}
                onUpdateNestedElement={updateElementInNestedColumn}
                onUpdateContainer={updateContainer}
            />

        </AppLayout>
    );
}
