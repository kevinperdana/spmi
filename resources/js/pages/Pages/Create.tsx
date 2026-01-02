import { FormEventHandler, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Type, AlignLeft, ImagePlus, Settings2, Square, FileText, Image as ImageIcon, ListIcon, Grid, Presentation, ChevronDown, Layers, MousePointer2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Accordion } from '@/components/Accordion';
import { Tabs } from '@/components/Tabs';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pages', href: '/pages' },
    { title: 'Create', href: '/pages/create' },
];

const LAYOUT_TYPES = [
    { value: 'full-width', label: 'Full Width', description: 'Main (12-col)', columns: 1, bars: [12] },
    { value: '2-equal', label: '2 Equal Columns', description: 'Left (6-col) + Right (6-col)', columns: 2, bars: [6, 6] },
    { value: '3-equal', label: '3 Equal Columns', description: '4-col + 4-col + 4-col', columns: 3, bars: [4, 4, 4] },
    { value: '4-equal', label: '4 Equal Columns', description: '3-col + 3-col + 3-col + 3-col', columns: 4, bars: [3, 3, 3, 3] },
    { value: '2-sidebar-left', label: '2 Columns (Sidebar Left)', description: 'Left (4-col) + Right (8-col)', columns: 2, bars: [4, 8] },
    { value: '2-sidebar-right', label: '2 Columns (Sidebar Right)', description: 'Left (8-col) + Right (4-col)', columns: 2, bars: [8, 4] },
];

const ELEMENT_TYPE_OPTIONS = [
    { type: 'heading', label: 'Heading', icon: Type },
    { type: 'text', label: 'Text', icon: AlignLeft },
    { type: 'image', label: 'Image', icon: ImagePlus },
    { type: 'card', label: 'Card', icon: Square },
    { type: 'list', label: 'List', icon: ListIcon },
    { type: 'gallery', label: 'Gallery', icon: Grid },
    { type: 'carousel', label: 'Carousel', icon: Presentation },
    { type: 'accordion', label: 'Accordion', icon: ChevronDown },
    { type: 'tabs', label: 'Tabs', icon: Layers },
    { type: 'button', label: 'Button', icon: MousePointer2 },
] as const;

interface ColumnElement {
    type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'button';
    value: string;
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    marginTop?: string;
    marginBottom?: string;
    paddingTop?: string;
    paddingBottom?: string;
    // Image properties
    imageWidth?: string;
    aspectRatio?: string;
    objectFit?: string;
    borderRadius?: string;
    // Card properties
    backgroundColor?: string;
    href?: string;
    target?: '_blank' | '_self';
    // List properties
    listType?: 'bullet' | 'numbered' | 'checklist';
    items?: string[];
    listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
    // Gallery properties
    images?: Array<{ url: string; caption?: string }>;
    galleryColumns?: number;
    galleryColumnsTablet?: number;
    galleryColumnsMobile?: number;
    galleryGap?: string;
    imageHeight?: string;
    captionFontSize?: string;
    captionColor?: string;
    captionAlign?: 'left' | 'center' | 'right';
    showCaptions?: boolean;
    // Carousel properties
    carouselAutoplay?: boolean;
    carouselInterval?: number;
    carouselShowDots?: boolean;
    carouselShowArrows?: boolean;
    carouselHeight?: string;
    carouselTransition?: 'slide' | 'fade';
    // Accordion properties
    accordionItems?: Array<{ title: string; content: string }>;
    accordionStyle?: 'default' | 'bordered' | 'separated';
    accordionIconPosition?: 'left' | 'right';
    accordionOpenMultiple?: boolean;
    accordionBorderColor?: string;
    accordionHeaderBg?: string;
    accordionHeaderTextColor?: string;
    accordionContentBg?: string;
    accordionContentTextColor?: string;
    accordionBorderRadius?: string;
    // Tabs properties
    tabItems?: Array<{ title: string; content: string }>;
    tabStyle?: 'default' | 'pills' | 'underline';
    tabPosition?: 'top' | 'left';
    tabBorderColor?: string;
    tabActiveColor?: string;
    tabInactiveColor?: string;
    tabActiveBg?: string;
    tabInactiveBg?: string;
    tabContentBg?: string;
    tabContentTextColor?: string;
    // Button properties
    buttonText?: string;
    buttonHref?: string;
    buttonTarget?: '_blank' | '_self';
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    buttonFontSize?: string;
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
    nestedColumnsIndex?: number;
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

type ElementPickerState =
    | { scope: 'column'; sectionIndex: number; colIndex: number; position: 'before' | 'after' }
    | { scope: 'nested'; sectionIndex: number; colIndex: number; nestedColIndex: number };

export default function Create() {
    const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
    const [elementPicker, setElementPicker] = useState<ElementPickerState | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<{ sectionIndex: number; colIndex: number; nestedColIndex?: number } | null>(null);
    const [selectedElement, setSelectedElement] = useState<{ 
        sectionIndex: number; 
        colIndex: number; 
        elementIndex: number;
        nestedColIndex?: number;
    } | null>(null);

    const handleSelectColumn = (selection: { sectionIndex: number; colIndex: number; nestedColIndex?: number } | null) => {
        setSelectedColumn(selection);
        if (selection) {
            setSelectedElement(null);
        }
    };

    const handleSelectElement = (selection: { sectionIndex: number; colIndex: number; elementIndex: number; nestedColIndex?: number } | null) => {
        setSelectedElement(selection);
        if (selection) {
            setSelectedColumn(null);
        }
    };
    
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        content: {
            sections: [] as Section[],
        },
        is_published: false,
        order: 0,
    });

    const generateSlug = () => {
        const slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setData('slug', slug);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/pages');
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
                paddingTop: '32',
                paddingBottom: '32',
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

    const handleImageUpload = async (sectionIndex: number, colIndex: number, elementIndex: number) => {
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
                    updateElementInColumn(sectionIndex, colIndex, elementIndex, 'value', result.url);
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

    const handleNestedImageUpload = async (
        sectionIndex: number,
        colIndex: number,
        nestedColIndex: number,
        elementIndex: number
    ) => {
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
                    updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex, elementIndex, 'value', result.url);
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

    const handleGalleryImageUpload = async (sectionIndex: number, colIndex: number, elementIndex: number) => {
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
                const newSections = [...data.content.sections];
                const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
                const currentImages = element.images || [];
                element.images = [...currentImages, ...validImages];
                setData('content', { sections: newSections });
            } else {
                alert('Failed to upload images. Please try again.');
            }
        };
        
        input.click();
    };

    const handleNestedGalleryImageUpload = async (
        sectionIndex: number,
        colIndex: number,
        nestedColIndex: number,
        elementIndex: number
    ) => {
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
                const newSections = [...data.content.sections];
                const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
                const currentImages = element.images || [];
                element.images = [...currentImages, ...validImages];
                setData('content', { sections: newSections });
            } else {
                alert('Failed to upload images. Please try again.');
            }
        };

        input.click();
    };

    const removeGalleryImage = (sectionIndex: number, colIndex: number, elementIndex: number, imageIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        element.images?.splice(imageIndex, 1);
        setData('content', { sections: newSections });
    };

    const removeNestedGalleryImage = (
        sectionIndex: number,
        colIndex: number,
        nestedColIndex: number,
        elementIndex: number,
        imageIndex: number
    ) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        element.images?.splice(imageIndex, 1);
        setData('content', { sections: newSections });
    };

    // Carousel handlers
    const handleCarouselImageUpload = async (sectionIndex: number, colIndex: number, elementIndex: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            for (const file of Array.from(files)) {
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

                    if (response.ok) {
                        const result = await response.json();
                        const newSections = [...data.content.sections];
                        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
                        if (!element.images) element.images = [];
                        element.images.push({ url: result.url, caption: '' });
                        setData('content', { sections: newSections });
                    }
                } catch (error) {
                    console.error('Failed to upload image:', error);
                }
            }
        };
        
        input.click();
    };

    const removeCarouselImage = (sectionIndex: number, colIndex: number, elementIndex: number, imageIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        element.images?.splice(imageIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateCarouselImageCaption = (sectionIndex: number, colIndex: number, elementIndex: number, imageIndex: number, caption: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (element.images && element.images[imageIndex]) {
            element.images[imageIndex].caption = caption;
            setData('content', { sections: newSections });
        }
    };

    const handleNestedCarouselImageUpload = async (
        sectionIndex: number,
        colIndex: number,
        nestedColIndex: number,
        elementIndex: number
    ) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            for (const file of Array.from(files)) {
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

                    if (response.ok) {
                        const result = await response.json();
                        const newSections = [...data.content.sections];
                        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
                        if (!element.images) element.images = [];
                        element.images.push({ url: result.url, caption: '' });
                        setData('content', { sections: newSections });
                    }
                } catch (error) {
                    console.error('Failed to upload image:', error);
                }
            }
        };

        input.click();
    };

    const removeNestedCarouselImage = (
        sectionIndex: number,
        colIndex: number,
        nestedColIndex: number,
        elementIndex: number,
        imageIndex: number
    ) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        element.images?.splice(imageIndex, 1);
        setData('content', { sections: newSections });
    };

    const getNestedColumnsIndex = (column: Column) => {
        if (typeof column.nestedColumnsIndex !== 'number') {
            return column.elements.length;
        }

        return Math.min(Math.max(column.nestedColumnsIndex, 0), column.elements.length);
    };

    const addElementToColumn = (
        sectionIndex: number,
        colIndex: number,
        type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'button',
        position: 'before' | 'after' = 'before'
    ) => {
        const newSections = [...data.content.sections];
        const column = newSections[sectionIndex].columns[colIndex];
        if (!column.elements) column.elements = [];
        const nestedIndex = getNestedColumnsIndex(column);
        const hasNestedColumns = !!(column.columns && column.columns.length > 0);

        if (column.nestedColumnsIndex !== undefined && column.nestedColumnsIndex !== nestedIndex) {
            column.nestedColumnsIndex = nestedIndex;
        }
        
        const newElement: ColumnElement = {
            type,
            value: type === 'button' ? 'Click Me' : '',
            color: type === 'heading' ? '#000000' : type === 'card' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : type === 'card' ? 'text-base' : 'text-base',
            align: 'left',
            ...(type === 'card' && { 
                backgroundColor: '#ffffff',
                borderRadius: '8'
            }),
            ...(type === 'list' && {
                listType: 'bullet',
                items: ['Item 1', 'Item 2', 'Item 3'],
                listStyle: 'disc'
            }),
            ...(type === 'gallery' && {
                images: [],
                galleryColumns: 3,
                galleryColumnsTablet: 2,
                galleryColumnsMobile: 1,
                galleryGap: '16',
                imageHeight: '200',
                captionFontSize: 'text-sm',
                captionColor: '#6b7280',
                captionAlign: 'center',
                showCaptions: true
            }),
            ...(type === 'carousel' && {
                images: [],
                carouselAutoplay: true,
                carouselInterval: 5000,
                carouselShowDots: true,
                carouselShowArrows: true,
                carouselHeight: '400',
                carouselTransition: 'slide',
                captionFontSize: 'text-base',
                captionColor: '#ffffff',
                captionAlign: 'center',
                showCaptions: true
            }),
            ...(type === 'accordion' && {
                accordionItems: [
                    { title: 'Section 1', content: 'Content for section 1' },
                    { title: 'Section 2', content: 'Content for section 2' },
                    { title: 'Section 3', content: 'Content for section 3' }
                ],
                accordionStyle: 'default',
                accordionIconPosition: 'right',
                accordionOpenMultiple: false,
                accordionBorderColor: '#e5e7eb',
                accordionHeaderBg: '#f9fafb',
                accordionHeaderTextColor: '#111827',
                accordionContentBg: '#ffffff',
                accordionContentTextColor: '#374151',
                accordionBorderRadius: '8'
            }),
            ...(type === 'tabs' && {
                tabItems: [
                    { title: 'Tab 1', content: 'Content for tab 1' },
                    { title: 'Tab 2', content: 'Content for tab 2' },
                    { title: 'Tab 3', content: 'Content for tab 3' }
                ],
                tabStyle: 'default',
                tabPosition: 'top',
                tabBorderColor: '#e5e7eb',
                tabActiveColor: '#3b82f6',
                tabInactiveColor: '#6b7280',
                tabActiveBg: '#eff6ff',
                tabInactiveBg: 'transparent',
                tabContentBg: '#ffffff',
                tabContentTextColor: '#374151'
            }),
            ...(type === 'button' && {
                buttonText: 'Click Me',
                buttonHref: '',
                buttonTarget: '_self',
                buttonBgColor: '#3b82f6',
                buttonTextColor: '#ffffff',
                buttonBorderRadius: '6',
                buttonFontSize: 'text-base',
                paddingTop: '16',
                paddingBottom: '16',
                paddingLeft: '16',
                paddingRight: '16'
            })
        };
        if (position === 'after') {
            column.elements.push(newElement);
            if (hasNestedColumns && column.nestedColumnsIndex === undefined) {
                column.nestedColumnsIndex = nestedIndex;
            }
        } else if (column.nestedColumnsIndex !== undefined) {
            column.elements.splice(nestedIndex, 0, newElement);
            column.nestedColumnsIndex = nestedIndex + 1;
        } else {
            column.elements.push(newElement);
        }
        setData('content', { sections: newSections });
    };

    const updateElementInColumn = (sectionIndex: number, colIndex: number, elementIndex: number, field: keyof ColumnElement, value: string) => {
        const newSections = [...data.content.sections];
        (newSections[sectionIndex].columns[colIndex].elements[elementIndex] as any)[field] = value;
        setData('content', { sections: newSections });
    };

    const removeElementFromColumn = (sectionIndex: number, colIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        const column = newSections[sectionIndex].columns[colIndex];
        const nestedIndex = getNestedColumnsIndex(column);
        column.elements.splice(elementIndex, 1);
        if (column.nestedColumnsIndex !== undefined) {
            const nextIndex = elementIndex < nestedIndex ? nestedIndex - 1 : nestedIndex;
            column.nestedColumnsIndex = Math.min(Math.max(nextIndex, 0), column.elements.length);
        }
        setData('content', { sections: newSections });
    };

    // Accordion handlers
    const addAccordionItem = (sectionIndex: number, colIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (!element.accordionItems) element.accordionItems = [];
        element.accordionItems.push({ title: 'Accordion Title', content: 'Accordion content goes here...' });
        setData('content', { sections: newSections });
    };

    const removeAccordionItem = (sectionIndex: number, colIndex: number, elementIndex: number, itemIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        element.accordionItems?.splice(itemIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateAccordionItemTitle = (sectionIndex: number, colIndex: number, elementIndex: number, itemIndex: number, title: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (element.accordionItems && element.accordionItems[itemIndex]) {
            element.accordionItems[itemIndex].title = title;
            setData('content', { sections: newSections });
        }
    };

    const updateAccordionItemContent = (sectionIndex: number, colIndex: number, elementIndex: number, itemIndex: number, content: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (element.accordionItems && element.accordionItems[itemIndex]) {
            element.accordionItems[itemIndex].content = content;
            setData('content', { sections: newSections });
        }
    };

    // Tabs handlers
    const addTabItem = (sectionIndex: number, colIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (!element.tabItems) element.tabItems = [];
        element.tabItems.push({ title: 'Tab Title', content: 'Tab content goes here...' });
        setData('content', { sections: newSections });
    };

    const removeTabItem = (sectionIndex: number, colIndex: number, elementIndex: number, itemIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        element.tabItems?.splice(itemIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateTabItemTitle = (sectionIndex: number, colIndex: number, elementIndex: number, itemIndex: number, title: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (element.tabItems && element.tabItems[itemIndex]) {
            element.tabItems[itemIndex].title = title;
            setData('content', { sections: newSections });
        }
    };

    const updateTabItemContent = (sectionIndex: number, colIndex: number, elementIndex: number, itemIndex: number, content: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].elements[elementIndex];
        if (element.tabItems && element.tabItems[itemIndex]) {
            element.tabItems[itemIndex].content = content;
            setData('content', { sections: newSections });
        }
    };

    const addNestedAccordionItem = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (!element.accordionItems) element.accordionItems = [];
        element.accordionItems.push({ title: 'Accordion Title', content: 'Accordion content goes here...' });
        setData('content', { sections: newSections });
    };

    const removeNestedAccordionItem = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, itemIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        element.accordionItems?.splice(itemIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateNestedAccordionItemTitle = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, itemIndex: number, title: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (element.accordionItems && element.accordionItems[itemIndex]) {
            element.accordionItems[itemIndex].title = title;
            setData('content', { sections: newSections });
        }
    };

    const updateNestedAccordionItemContent = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, itemIndex: number, content: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (element.accordionItems && element.accordionItems[itemIndex]) {
            element.accordionItems[itemIndex].content = content;
            setData('content', { sections: newSections });
        }
    };

    const addNestedTabItem = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (!element.tabItems) element.tabItems = [];
        element.tabItems.push({ title: 'Tab Title', content: 'Tab content goes here...' });
        setData('content', { sections: newSections });
    };

    const removeNestedTabItem = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, itemIndex: number) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        element.tabItems?.splice(itemIndex, 1);
        setData('content', { sections: newSections });
    };

    const updateNestedTabItemTitle = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, itemIndex: number, title: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (element.tabItems && element.tabItems[itemIndex]) {
            element.tabItems[itemIndex].title = title;
            setData('content', { sections: newSections });
        }
    };

    const updateNestedTabItemContent = (sectionIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, itemIndex: number, content: string) => {
        const newSections = [...data.content.sections];
        const element = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex].elements[elementIndex];
        if (element.tabItems && element.tabItems[itemIndex]) {
            element.tabItems[itemIndex].content = content;
            setData('content', { sections: newSections });
        }
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
                paddingTop: '32',
                paddingBottom: '32',
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

    const updateNestedColumnSpacing = (sectionIndex: number, colIndex: number, nestedColIndex: number, field: string, value: string) => {
        const newSections = [...data.content.sections];
        (newSections[sectionIndex].columns[colIndex].columns![nestedColIndex] as any)[field] = value;
        setData('content', { sections: newSections });
    };

    const addElementToNestedColumn = (sectionIndex: number, colIndex: number, nestedColIndex: number, type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'button') => {
        const newSections = [...data.content.sections];
        const nestedCol = newSections[sectionIndex].columns[colIndex].columns![nestedColIndex];
        if (!nestedCol.elements) {
            nestedCol.elements = [];
        }
        const newElement: ColumnElement = {
            type,
            value: type === 'button' ? 'Click Me' : '',
            color: type === 'heading' ? '#000000' : type === 'card' ? '#000000' : '#4b5563',
            fontSize: type === 'heading' ? 'text-3xl' : type === 'card' ? 'text-base' : 'text-base',
            align: 'left',
            ...(type === 'card' && { 
                backgroundColor: '#ffffff',
                borderRadius: '8'
            }),
            ...(type === 'list' && {
                listType: 'bullet',
                items: ['Item 1', 'Item 2', 'Item 3'],
                listStyle: 'disc'
            }),
            ...(type === 'gallery' && {
                images: [],
                galleryColumns: 3,
                galleryColumnsTablet: 2,
                galleryColumnsMobile: 1,
                galleryGap: '16',
                imageHeight: '200',
                captionFontSize: 'text-sm',
                captionColor: '#6b7280',
                captionAlign: 'center',
                showCaptions: true
            }),
            ...(type === 'carousel' && {
                images: [],
                carouselAutoplay: true,
                carouselInterval: 5000,
                carouselShowDots: true,
                carouselShowArrows: true,
                carouselHeight: '400',
                carouselTransition: 'slide',
                captionFontSize: 'text-base',
                captionColor: '#ffffff',
                captionAlign: 'center',
                showCaptions: true
            }),
            ...(type === 'accordion' && {
                accordionItems: [
                    { title: 'Section 1', content: 'Content for section 1' },
                    { title: 'Section 2', content: 'Content for section 2' },
                    { title: 'Section 3', content: 'Content for section 3' }
                ],
                accordionStyle: 'default',
                accordionIconPosition: 'right',
                accordionOpenMultiple: false,
                accordionBorderColor: '#e5e7eb',
                accordionHeaderBg: '#f9fafb',
                accordionHeaderTextColor: '#111827',
                accordionContentBg: '#ffffff',
                accordionContentTextColor: '#374151',
                accordionBorderRadius: '8'
            }),
            ...(type === 'tabs' && {
                tabItems: [
                    { title: 'Tab 1', content: 'Content for tab 1' },
                    { title: 'Tab 2', content: 'Content for tab 2' },
                    { title: 'Tab 3', content: 'Content for tab 3' }
                ],
                tabStyle: 'default',
                tabPosition: 'top',
                tabBorderColor: '#e5e7eb',
                tabActiveColor: '#3b82f6',
                tabInactiveColor: '#6b7280',
                tabActiveBg: '#eff6ff',
                tabInactiveBg: 'transparent',
                tabContentBg: '#ffffff',
                tabContentTextColor: '#374151'
            }),
            ...(type === 'button' && {
                buttonText: 'Click Me',
                buttonHref: '',
                buttonTarget: '_self',
                buttonBgColor: '#3b82f6',
                buttonTextColor: '#ffffff',
                buttonBorderRadius: '6',
                buttonFontSize: 'text-base',
                paddingTop: '16',
                paddingBottom: '16',
                paddingLeft: '16',
                paddingRight: '16'
            })
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

    const selectedElementData = (() => {
        if (!selectedElement) {
            return null;
        }
        const column = data.content.sections[selectedElement.sectionIndex]?.columns[selectedElement.colIndex];
        if (!column) {
            return null;
        }
        if (selectedElement.nestedColIndex !== undefined) {
            return column.columns?.[selectedElement.nestedColIndex]?.elements?.[selectedElement.elementIndex] || null;
        }
        return column.elements?.[selectedElement.elementIndex] || null;
    })();

    const updateSelectedElement = (field: keyof ColumnElement, value: any) => {
        if (!selectedElement) {
            return;
        }
        if (selectedElement.nestedColIndex !== undefined) {
            updateElementInNestedColumn(
                selectedElement.sectionIndex,
                selectedElement.colIndex,
                selectedElement.nestedColIndex,
                selectedElement.elementIndex,
                field,
                value as any
            );
            return;
        }
        updateElementInColumn(
            selectedElement.sectionIndex,
            selectedElement.colIndex,
            selectedElement.elementIndex,
            field,
            value as any
        );
    };

    const renderElementTypePicker = (onSelect: (type: ColumnElement['type']) => void) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ELEMENT_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => onSelect(option.type)}
                        className="flex items-center gap-2 px-3 py-2 text-xs border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <Icon className="w-4 h-4" />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />

            <div 
                className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4" 
                style={{ marginRight: (selectedColumn || selectedElement) ? '320px' : '0', transition: 'margin-right 0.3s ease' }}
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/pages">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Create New Page
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
                                    onBlur={generateSlug}
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
                                <p className="text-xs text-gray-500 mt-1">URL: /page/{data.slug || 'your-slug'}</p>
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

                                            {/* Background Configuration - Same as Edit.tsx */}
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
                                                <h5 className="text-sm font-semibold mb-2">Container Settings</h5>
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

                                                    <div className="grid grid-cols-2 gap-3">
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
                                                {section.columns.map((column, colIndex) => {
                                                    const elements = column.elements || [];
                                                    const hasNestedColumns = !!(column.columns && column.columns.length > 0);
                                                    const baseNestedColumnsIndex = typeof column.nestedColumnsIndex === 'number'
                                                        ? Math.min(Math.max(column.nestedColumnsIndex, 0), elements.length)
                                                        : elements.length;
                                                    const nestedColumnsIndex = hasNestedColumns ? baseNestedColumnsIndex : elements.length;
                                                    const elementsBefore = elements.slice(0, nestedColumnsIndex);
                                                    const elementsAfter = elements.slice(nestedColumnsIndex);

                                                    const renderColumnElement = (element: ColumnElement, elemIndex: number, nestedColIndex?: number) => {
                                                        const isNested = typeof nestedColIndex === 'number';
                                                        const updateElement = (field: keyof ColumnElement, value: any) => {
                                                            if (isNested) {
                                                                updateElementInNestedColumn(sectionIndex, colIndex, nestedColIndex!, elemIndex, field, value);
                                                            } else {
                                                                updateElementInColumn(sectionIndex, colIndex, elemIndex, field, value);
                                                            }
                                                        };
                                                        const selectElement = () => handleSelectElement({
                                                            sectionIndex,
                                                            colIndex,
                                                            elementIndex: elemIndex,
                                                            ...(isNested ? { nestedColIndex } : {})
                                                        });
                                                        const handleImageUploadAction = () => {
                                                            if (isNested) {
                                                                handleNestedImageUpload(sectionIndex, colIndex, nestedColIndex!, elemIndex);
                                                            } else {
                                                                handleImageUpload(sectionIndex, colIndex, elemIndex);
                                                            }
                                                        };
                                                        const handleGalleryImageUploadAction = () => {
                                                            if (isNested) {
                                                                handleNestedGalleryImageUpload(sectionIndex, colIndex, nestedColIndex!, elemIndex);
                                                            } else {
                                                                handleGalleryImageUpload(sectionIndex, colIndex, elemIndex);
                                                            }
                                                        };
                                                        const removeGalleryImageAction = (imageIndex: number) => {
                                                            if (isNested) {
                                                                removeNestedGalleryImage(sectionIndex, colIndex, nestedColIndex!, elemIndex, imageIndex);
                                                            } else {
                                                                removeGalleryImage(sectionIndex, colIndex, elemIndex, imageIndex);
                                                            }
                                                        };
                                                        const handleCarouselImageUploadAction = () => {
                                                            if (isNested) {
                                                                handleNestedCarouselImageUpload(sectionIndex, colIndex, nestedColIndex!, elemIndex);
                                                            } else {
                                                                handleCarouselImageUpload(sectionIndex, colIndex, elemIndex);
                                                            }
                                                        };
                                                        const removeCarouselImageAction = (imageIndex: number) => {
                                                            if (isNested) {
                                                                removeNestedCarouselImage(sectionIndex, colIndex, nestedColIndex!, elemIndex, imageIndex);
                                                            } else {
                                                                removeCarouselImage(sectionIndex, colIndex, elemIndex, imageIndex);
                                                            }
                                                        };
                                                        const addAccordionItemAction = () => {
                                                            if (isNested) {
                                                                addNestedAccordionItem(sectionIndex, colIndex, nestedColIndex!, elemIndex);
                                                            } else {
                                                                addAccordionItem(sectionIndex, colIndex, elemIndex);
                                                            }
                                                        };
                                                        const removeAccordionItemAction = (itemIndex: number) => {
                                                            if (isNested) {
                                                                removeNestedAccordionItem(sectionIndex, colIndex, nestedColIndex!, elemIndex, itemIndex);
                                                            } else {
                                                                removeAccordionItem(sectionIndex, colIndex, elemIndex, itemIndex);
                                                            }
                                                        };
                                                        const updateAccordionItemTitleAction = (itemIndex: number, title: string) => {
                                                            if (isNested) {
                                                                updateNestedAccordionItemTitle(sectionIndex, colIndex, nestedColIndex!, elemIndex, itemIndex, title);
                                                            } else {
                                                                updateAccordionItemTitle(sectionIndex, colIndex, elemIndex, itemIndex, title);
                                                            }
                                                        };
                                                        const updateAccordionItemContentAction = (itemIndex: number, content: string) => {
                                                            if (isNested) {
                                                                updateNestedAccordionItemContent(sectionIndex, colIndex, nestedColIndex!, elemIndex, itemIndex, content);
                                                            } else {
                                                                updateAccordionItemContent(sectionIndex, colIndex, elemIndex, itemIndex, content);
                                                            }
                                                        };
                                                        const addTabItemAction = () => {
                                                            if (isNested) {
                                                                addNestedTabItem(sectionIndex, colIndex, nestedColIndex!, elemIndex);
                                                            } else {
                                                                addTabItem(sectionIndex, colIndex, elemIndex);
                                                            }
                                                        };
                                                        const removeTabItemAction = (itemIndex: number) => {
                                                            if (isNested) {
                                                                removeNestedTabItem(sectionIndex, colIndex, nestedColIndex!, elemIndex, itemIndex);
                                                            } else {
                                                                removeTabItem(sectionIndex, colIndex, elemIndex, itemIndex);
                                                            }
                                                        };
                                                        const updateTabItemTitleAction = (itemIndex: number, title: string) => {
                                                            if (isNested) {
                                                                updateNestedTabItemTitle(sectionIndex, colIndex, nestedColIndex!, elemIndex, itemIndex, title);
                                                            } else {
                                                                updateTabItemTitle(sectionIndex, colIndex, elemIndex, itemIndex, title);
                                                            }
                                                        };
                                                        const updateTabItemContentAction = (itemIndex: number, content: string) => {
                                                            if (isNested) {
                                                                updateNestedTabItemContent(sectionIndex, colIndex, nestedColIndex!, elemIndex, itemIndex, content);
                                                            } else {
                                                                updateTabItemContent(sectionIndex, colIndex, elemIndex, itemIndex, content);
                                                            }
                                                        };
                                                        const removeElementAction = () => {
                                                            if (isNested) {
                                                                removeElementFromNestedColumn(sectionIndex, colIndex, nestedColIndex!, elemIndex);
                                                            } else {
                                                                removeElementFromColumn(sectionIndex, colIndex, elemIndex);
                                                            }
                                                        };

                                                        return (
                                                                <div key={elemIndex} className="border rounded p-2 bg-gray-50">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                                                                            element.type === 'heading' ? 'bg-blue-100 text-blue-700' :
                                                                            element.type === 'text' ? 'bg-green-100 text-green-700' :
                                                                            element.type === 'image' ? 'bg-orange-100 text-orange-700' :
                                                                            element.type === 'card' ? 'bg-purple-100 text-purple-700' :
                                                                            element.type === 'list' ? 'bg-teal-100 text-teal-700' :
                                                                            element.type === 'gallery' ? 'bg-emerald-100 text-emerald-700' :
                                                                            element.type === 'carousel' ? 'bg-indigo-100 text-indigo-700' :
                                                                            element.type === 'accordion' ? 'bg-amber-100 text-amber-700' :
                                                                            element.type === 'tabs' ? 'bg-teal-100 text-teal-700' :
                                                                            element.type === 'button' ? 'bg-indigo-100 text-indigo-700' :
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
                                                                            ) : element.type === 'image' ? (
                                                                                <>
                                                                                    <ImageIcon className="w-3 h-3" />
                                                                                    Image
                                                                                </>
                                                                            ) : element.type === 'card' ? (
                                                                                <>
                                                                                    <Square className="w-3 h-3" />
                                                                                    Card
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
                                                                            ) : element.type === 'carousel' ? (
                                                                                <>
                                                                                    <Presentation className="w-3 h-3" />
                                                                                    Carousel
                                                                                </>
                                                                            ) : element.type === 'accordion' ? (
                                                                                <>
                                                                                    <ChevronDown className="w-3 h-3" />
                                                                                    Accordion
                                                                                </>
                                                                            ) : element.type === 'tabs' ? (
                                                                                <>
                                                                                    <Layers className="w-3 h-3" />
                                                                                    Tabs
                                                                                </>
                                                                            ) : element.type === 'button' ? (
                                                                                <>
                                                                                    <MousePointer2 className="w-3 h-3" />
                                                                                    Button
                                                                                </>
                                                                            ) : null}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex gap-2 mb-2">
                                                                        <div className="flex-1">
                                                                            {element.type === 'heading' && (
                                                                                <Input
                                                                                    value={element.value}
                                                                                    onChange={(e) => updateElement('value', e.target.value)}
                                                                                    onFocus={selectElement}
                                                                                    placeholder="Heading text..."
                                                                                    className="text-sm cursor-pointer"
                                                                                />
                                                                            )}
                                                                            {element.type === 'text' && (
                                                                                <Textarea
                                                                                    value={element.value}
                                                                                    onChange={(e) => updateElement('value', e.target.value)}
                                                                                    onFocus={selectElement}
                                                                                    placeholder="Text content..."
                                                                                    rows={2}
                                                                                    className="text-sm cursor-pointer"
                                                                                />
                                                                            )}
                                                                            {element.type === 'image' && (
                                                                                <div>
                                                                                    {element.value ? (
                                                                                        <div 
                                                                                            className="relative cursor-pointer"
                                                                                            onClick={selectElement}
                                                                                        >
                                                                                            <img 
                                                                                                src={element.value} 
                                                                                                alt="Preview" 
                                                                                                className="w-full h-32 object-cover border rounded"
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleImageUploadAction();
                                                                                                }}
                                                                                                className="absolute top-1 right-1 bg-white rounded px-2 py-1 text-xs shadow hover:bg-gray-50"
                                                                                            >
                                                                                                Change
                                                                                            </button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleImageUploadAction()}
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
                                                                                        onChange={(e) => updateElement('value', e.target.value)}
                                                                                        onFocus={selectElement}
                                                                                        placeholder="Card text..."
                                                                                        rows={3}
                                                                                        className="text-sm cursor-pointer bg-white"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            {element.type === 'list' && (
                                                                                <div className="border rounded p-2 bg-gray-50 space-y-1">
                                                                                    {element.items && element.items.map((item, itemIndex) => (
                                                                                        <div key={itemIndex} className="flex gap-1 items-center">
                                                                                            <Input
                                                                                                value={item}
                                                                                                onChange={(e) => {
                                                                                                    const newItems = [...(element.items || [])];
                                                                                                    newItems[itemIndex] = e.target.value;
                                                                                                    updateElement('items', newItems as any);
                                                                                                }}
                                                                                                placeholder={`Item ${itemIndex + 1}`}
                                                                                                className="text-xs bg-white flex-1"
                                                                                            />
                                                                                            <Button
                                                                                                type="button"
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() => {
                                                                                                    const newItems = [...(element.items || [])];
                                                                                                    newItems.splice(itemIndex, 1);
                                                                                                    updateElement('items', newItems as any);
                                                                                                }}
                                                                                                className="h-6 w-6 p-0"
                                                                                            >
                                                                                                <X className="w-3 h-3" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    ))}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const newItems = [...(element.items || []), `Item ${(element.items?.length || 0) + 1}`];
                                                                                            updateElement('items', newItems as any);
                                                                                        }}
                                                                                        className="w-full py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-300"
                                                                                    >
                                                                                        + Add Item
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            {element.type === 'gallery' && (
                                                                                <div className="border rounded p-3 bg-emerald-50 space-y-3">
                                                                                    {element.images && element.images.length > 0 ? (
                                                                                        <div className="grid grid-cols-3 gap-2">
                                                                                            {element.images.map((img, imgIndex) => (
                                                                                                <div key={imgIndex} className="relative group">
                                                                                                    <img 
                                                                                                        src={img.url} 
                                                                                                        alt={`Gallery ${imgIndex + 1}`}
                                                                                                        className="w-full h-20 object-cover rounded"
                                                                                                    />
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => removeGalleryImageAction(imgIndex)}
                                                                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                    >
                                                                                                        <X className="w-3 h-3" />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-500 text-center py-4">No images in gallery yet</p>
                                                                                    )}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleGalleryImageUploadAction()}
                                                                                        className="w-full py-2 border border-dashed border-emerald-400 rounded text-emerald-600 text-sm hover:bg-emerald-100 flex items-center justify-center gap-2"
                                                                                    >
                                                                                        <ImagePlus className="w-4 h-4" />
                                                                                        Add Images to Gallery
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            {element.type === 'carousel' && (
                                                                                <div className="border rounded p-3 bg-indigo-50 space-y-3">
                                                                                    {element.images && element.images.length > 0 ? (
                                                                                        <div className="space-y-2">
                                                                                            {element.images.map((img, imgIndex) => (
                                                                                                <div key={imgIndex} className="relative group bg-white p-2 rounded">
                                                                                                    <div className="flex gap-2 items-center">
                                                                                                        <img 
                                                                                                            src={img.url} 
                                                                                                            alt={`Slide ${imgIndex + 1}`}
                                                                                                            className="w-24 h-16 object-cover rounded"
                                                                                                        />
                                                                                                        <div className="flex-1">
                                                                                                            <div className="text-xs font-medium text-gray-700">Slide {imgIndex + 1}</div>
                                                                                                        </div>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => removeCarouselImageAction(imgIndex)}
                                                                                                            className="text-red-500 hover:text-red-700 p-1"
                                                                                                        >
                                                                                                            <X className="w-4 h-4" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-500 text-center py-4">No slides yet</p>
                                                                                    )}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleCarouselImageUploadAction()}
                                                                                        className="w-full py-2 border border-dashed border-indigo-400 rounded text-indigo-600 text-sm hover:bg-indigo-100 flex items-center justify-center gap-2"
                                                                                    >
                                                                                        <ImagePlus className="w-4 h-4" />
                                                                                        Add Slides to Carousel
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {element.type === 'accordion' && (
                                                                                <div className="border rounded p-3 bg-teal-50 space-y-3">
                                                                                    {element.accordionItems && element.accordionItems.length > 0 ? (
                                                                                        <div className="space-y-2">
                                                                                            {element.accordionItems.map((item, itemIndex) => (
                                                                                                <div key={itemIndex} className="bg-white p-3 rounded border border-teal-200">
                                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                                        <span className="text-xs font-medium text-teal-700">Item {itemIndex + 1}</span>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => removeAccordionItemAction(itemIndex)}
                                                                                                            className="text-red-500 hover:text-red-700 p-1"
                                                                                                        >
                                                                                                            <X className="w-3 h-3" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <Input
                                                                                                        value={item.title}
                                                                                                        onChange={(e) => updateAccordionItemTitleAction(itemIndex, e.target.value)}
                                                                                                        placeholder="Title..."
                                                                                                        className="mb-2 text-sm font-medium"
                                                                                                    />
                                                                                                    <Textarea
                                                                                                        value={item.content}
                                                                                                        onChange={(e) => updateAccordionItemContentAction(itemIndex, e.target.value)}
                                                                                                        placeholder="Content..."
                                                                                                        className="text-sm resize-none"
                                                                                                        rows={3}
                                                                                                    />
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-500 text-center py-4">No accordion items yet</p>
                                                                                    )}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => addAccordionItemAction()}
                                                                                        className="w-full py-2 border border-dashed border-teal-400 rounded text-teal-600 text-sm hover:bg-teal-100 flex items-center justify-center gap-2"
                                                                                    >
                                                                                        <Plus className="w-4 h-4" />
                                                                                        Add Accordion Item
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {element.type === 'tabs' && (
                                                                                <div className="border rounded p-3 bg-cyan-50 space-y-3">
                                                                                    {element.tabItems && element.tabItems.length > 0 ? (
                                                                                        <div className="space-y-2">
                                                                                            {element.tabItems.map((item, itemIndex) => (
                                                                                                <div key={itemIndex} className="bg-white p-3 rounded border border-cyan-200">
                                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                                        <span className="text-xs font-medium text-cyan-700">Tab {itemIndex + 1}</span>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => removeTabItemAction(itemIndex)}
                                                                                                            className="text-red-500 hover:text-red-700 p-1"
                                                                                                        >
                                                                                                            <X className="w-3 h-3" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <Input
                                                                                                        value={item.title}
                                                                                                        onChange={(e) => updateTabItemTitleAction(itemIndex, e.target.value)}
                                                                                                        placeholder="Tab Title..."
                                                                                                        className="mb-2 text-sm font-medium"
                                                                                                    />
                                                                                                    <Textarea
                                                                                                        value={item.content}
                                                                                                        onChange={(e) => updateTabItemContentAction(itemIndex, e.target.value)}
                                                                                                        placeholder="Tab Content..."
                                                                                                        className="text-sm resize-none"
                                                                                                        rows={3}
                                                                                                    />
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-500 text-center py-4">No tabs yet</p>
                                                                                    )}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => addTabItemAction()}
                                                                                        className="w-full py-2 border border-dashed border-cyan-400 rounded text-cyan-600 text-sm hover:bg-cyan-100 flex items-center justify-center gap-2"
                                                                                    >
                                                                                        <Plus className="w-4 h-4" />
                                                                                        Add Tab
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {element.type === 'button' && (
                                                                                <div className="border rounded p-3 bg-violet-50 space-y-2">
                                                                                    <div className="space-y-2">
                                                                                        <div>
                                                                                            <Label className="text-xs mb-1 block">Button Text</Label>
                                                                                            <Input
                                                                                                value={element.buttonText || element.value}
                                                                                                onChange={(e) => {
                                                                                                    updateElement('buttonText', e.target.value);
                                                                                                    updateElement('value', e.target.value);
                                                                                                }}
                                                                                                placeholder="Button text..."
                                                                                                className="text-sm bg-white"
                                                                                            />
                                                                                        </div>
                                                                                        <div>
                                                                                            <Label className="text-xs mb-1 block">Link URL (optional)</Label>
                                                                                            <Input
                                                                                                value={element.buttonHref || ''}
                                                                                                onChange={(e) => updateElement('buttonHref', e.target.value)}
                                                                                                placeholder="https://example.com"
                                                                                                className="text-sm bg-white"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div 
                                                                                        className="p-3 rounded border-2 border-dashed border-violet-300 flex items-center justify-center"
                                                                                        style={{
                                                                                            backgroundColor: element.buttonBgColor || '#3b82f6',
                                                                                            color: element.buttonTextColor || '#ffffff',
                                                                                            borderRadius: element.buttonBorderRadius ? `${element.buttonBorderRadius}px` : '6px'
                                                                                        }}
                                                                                    >
                                                                                        <span className="font-medium">
                                                                                            {element.buttonText || element.value || 'Button Preview'}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col gap-1 self-start">
                                                                            {(element.type === 'heading' || element.type === 'text' || element.type === 'image' || element.type === 'card' || element.type === 'list' || element.type === 'gallery' || element.type === 'carousel' || element.type === 'accordion' || element.type === 'tabs' || element.type === 'button') && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={selectElement}
                                                                                    className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                                                                                    title="Element Settings"
                                                                                >
                                                                                    <Settings2 className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeElementAction()}
                                                                                className="text-red-600 p-1 hover:bg-red-50 rounded"
                                                                                title="Remove element"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                    );
                                                    };

                                                    return (
                                                    <div key={column.id} className={`border-2 rounded-lg p-3 ${
                                                        column.card 
                                                            ? 'border-green-300 bg-green-50/30' 
                                                            : 'border-gray-300 bg-white'
                                                    }`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h5 className="text-md font-medium text-gray-900 dark:text-gray-100">Column {colIndex + 1}</h5>
                                                            <div className="flex gap-2 items-start flex-wrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectColumn({ sectionIndex, colIndex })}
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
                                                                        onChange={(e) => updateColumnWidth(sectionIndex, colIndex, parseInt(e.target.value))}
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
                                                                        onChange={(e) => updateColumnWidthTablet(sectionIndex, colIndex, parseInt(e.target.value))}
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
                                                                        onChange={(e) => updateColumnWidthMobile(sectionIndex, colIndex, parseInt(e.target.value))}
                                                                        className="text-xs px-1 py-0.5 rounded border"
                                                                    >
                                                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                            <option key={w} value={w}>{w}/12</option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleColumnCard(sectionIndex, colIndex)}
                                                                    className="text-xs px-2 py-1 rounded-md border transition-colors self-end"
                                                                >
                                                                    {column.card ? '🎴 Card' : '📄 Plain'}
                                                                </button>
                                                                {section.columns.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeColumn(sectionIndex, colIndex)}
                                                                        className="text-xs px-1 py-0.5 rounded-md border border-red-400 text-red-700 hover:bg-red-50 transition-colors self-end"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Elements */}
                                                        <div className="space-y-2 mb-2">
                                                            {elementsBefore.map((element, elemIndex) => renderColumnElement(element, elemIndex))}
                                                        </div>

                                                        {/* Nested Columns */}
                                                        {column.columns && column.columns.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                <div className="text-xs font-medium text-gray-600">Nested Columns:</div>
                                                                {column.columns.map((nestedCol, nestedColIndex) => (
                                                                    <div key={nestedCol.id} className={`border rounded-lg p-3 ${
                                                                        nestedCol.card 
                                                                            ? 'border-green-400 bg-white shadow-sm' 
                                                                            : 'border-gray-200 bg-gray-50'
                                                                    }`}>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-medium">Nested Col {nestedColIndex + 1}</span>
                                                                            <div className="flex gap-1 items-center flex-wrap">
                                                                                {/* Settings Button */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleSelectColumn({ sectionIndex, colIndex, nestedColIndex })}
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
                                                                                        onChange={(e) => updateNestedColumnWidth(sectionIndex, colIndex, nestedColIndex, parseInt(e.target.value))}
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
                                                                                        onChange={(e) => updateNestedColumnSpacing(sectionIndex, colIndex, nestedColIndex, 'widthTablet', e.target.value)}
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
                                                                                        onChange={(e) => updateNestedColumnSpacing(sectionIndex, colIndex, nestedColIndex, 'widthMobile', e.target.value)}
                                                                                        className="text-xs px-1 py-0.5 rounded border"
                                                                                    >
                                                                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                                            <option key={w} value={w}>{w}/12</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                
                                                                                {/* Delete Button */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeNestedColumn(sectionIndex, colIndex, nestedColIndex)}
                                                                                    className="text-xs px-1 py-0.5 rounded border border-red-400 text-red-700 hover:bg-red-50"
                                                                                    title="Remove nested column"
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Nested Column Elements */}
                                                                        <div className="space-y-2 mb-2">
                                                                            {nestedCol.elements.map((element, elemIndex) => renderColumnElement(element, elemIndex, nestedColIndex))}
                                                                        </div>

                                                                        {/* Add Element to Nested Column */}
                                                                        <div className="mt-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const isOpen = elementPicker?.scope === 'nested'
                                                                                        && elementPicker.sectionIndex === sectionIndex
                                                                                        && elementPicker.colIndex === colIndex
                                                                                        && elementPicker.nestedColIndex === nestedColIndex;
                                                                                    setElementPicker(
                                                                                        isOpen
                                                                                            ? null
                                                                                            : { scope: 'nested', sectionIndex, colIndex, nestedColIndex }
                                                                                    );
                                                                                }}
                                                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                                                            >
                                                                                <Plus className="w-3 h-3" />
                                                                                Add Element
                                                                            </button>
                                                                            {elementPicker?.scope === 'nested'
                                                                                && elementPicker.sectionIndex === sectionIndex
                                                                                && elementPicker.colIndex === colIndex
                                                                                && elementPicker.nestedColIndex === nestedColIndex && (
                                                                                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3">
                                                                                        {renderElementTypePicker((type) => {
                                                                                            addElementToNestedColumn(sectionIndex, colIndex, nestedColIndex, type);
                                                                                            setElementPicker(null);
                                                                                        })}
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setElementPicker(null)}
                                                                                            className="mt-2 text-[11px] text-gray-500 hover:text-gray-700"
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {elementsAfter.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                {hasNestedColumns && (
                                                                    <div className="text-xs font-medium text-gray-600">Elements Below Nested Columns:</div>
                                                                )}
                                                                {elementsAfter.map((element, elemIndex) => renderColumnElement(element, nestedColumnsIndex + elemIndex))}
                                                            </div>
                                                        )}
                                                        <div className="mt-3 space-y-2">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const isOpen = elementPicker?.scope === 'column'
                                                                            && elementPicker.sectionIndex === sectionIndex
                                                                            && elementPicker.colIndex === colIndex;
                                                                        setElementPicker(
                                                                            isOpen
                                                                                ? null
                                                                                : {
                                                                                    scope: 'column',
                                                                                    sectionIndex,
                                                                                    colIndex,
                                                                                    position: hasNestedColumns ? 'after' : 'before',
                                                                                }
                                                                        );
                                                                    }}
                                                                    className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    Add Element
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        addNestedColumn(sectionIndex, colIndex);
                                                                        setElementPicker(null);
                                                                    }}
                                                                    className="w-full py-3 border-2 border-dashed border-green-300 rounded-lg text-sm font-semibold text-green-700 hover:bg-green-50 transition flex items-center justify-center gap-2"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    Add Nested Column
                                                                </button>
                                                            </div>
                                                            {elementPicker?.scope === 'column'
                                                                && elementPicker.sectionIndex === sectionIndex
                                                                && elementPicker.colIndex === colIndex && (
                                                                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                                        {hasNestedColumns && (
                                                                            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                                                                                <span className="font-medium text-gray-500">Insert:</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setElementPicker({ scope: 'column', sectionIndex, colIndex, position: 'before' })}
                                                                                    className={`px-2 py-1 rounded-full border transition ${
                                                                                        elementPicker.position === 'before'
                                                                                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                                                    }`}
                                                                                >
                                                                                    Above nested columns
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setElementPicker({ scope: 'column', sectionIndex, colIndex, position: 'after' })}
                                                                                    className={`px-2 py-1 rounded-full border transition ${
                                                                                        elementPicker.position === 'after'
                                                                                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                                                    }`}
                                                                                >
                                                                                    Below nested columns
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {renderElementTypePicker((type) => {
                                                                            const position = elementPicker?.scope === 'column'
                                                                                && elementPicker.sectionIndex === sectionIndex
                                                                                && elementPicker.colIndex === colIndex
                                                                                ? elementPicker.position
                                                                                : 'before';
                                                                            addElementToColumn(sectionIndex, colIndex, type, position);
                                                                            setElementPicker(null);
                                                                        })}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setElementPicker(null)}
                                                                            className="mt-2 text-[11px] text-gray-500 hover:text-gray-700"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                    );
                                                })}
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
                            {processing ? 'Creating...' : 'Create Page'}
                        </Button>
                    </div>
                </form>

                {/* Right Panel - Column Settings */}
                {selectedColumn && (
                    (() => {
                        const section = data.content.sections[selectedColumn.sectionIndex];
                        if (!section) return null;
                        
                        const parentColumn = section.columns[selectedColumn.colIndex];
                        if (!parentColumn) return null;
                        
                        // Check if this is nested column or main column
                        const isNestedColumn = selectedColumn.nestedColIndex !== undefined;
                        const column = isNestedColumn 
                            ? parentColumn.columns?.[selectedColumn.nestedColIndex!]
                            : parentColumn;
                        
                        if (!column) return null;
                        
                        return (
                            <div className="fixed right-0 top-0 h-screen w-80 bg-white dark:bg-neutral-800 border-l border-gray-200 dark:border-neutral-700 shadow-xl overflow-y-auto z-50">
                                <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {isNestedColumn ? 'Nested Column Styles' : 'Column Styles'}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedColumn(null)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 space-y-6">
                                    {(() => {
                                
                                        return (
                                            <>
                                                {/* Column Width Section */}
                                                <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-blue-300">Column Width (Responsive)</h4>

                                                    {/* Desktop */}
                                                    <div>
                                                        <Label className="text-xs mb-2 flex items-center gap-1">
                                                            <Monitor className="w-3 h-3" /> Desktop
                                                        </Label>
                                                        <select
                                                            value={column.width || 6}
                                                            onChange={(e) => {
                                                                const width = parseInt(e.target.value);
                                                                if (isNestedColumn) {
                                                                    updateNestedColumnWidth(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, width);
                                                                } else {
                                                                    updateColumnWidth(selectedColumn.sectionIndex, selectedColumn.colIndex, width);
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                <option key={w} value={w}>
                                                                    {w}/12{w === 3 ? ' (Quarter)' : w === 4 ? ' (Third)' : w === 6 ? ' (Half)' : w === 12 ? ' (Full)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Tablet */}
                                                    <div>
                                                        <Label className="text-xs mb-2 flex items-center gap-1">
                                                            <Tablet className="w-3 h-3" /> Tablet
                                                        </Label>
                                                        <select
                                                            value={column.widthTablet || ''}
                                                            onChange={(e) => {
                                                                if (isNestedColumn) {
                                                                    updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'widthTablet', e.target.value);
                                                                } else {
                                                                    updateColumnWidthTablet(selectedColumn.sectionIndex, selectedColumn.colIndex, e.target.value ? parseInt(e.target.value) : 0);
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="">Same as Desktop</option>
                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                <option key={w} value={w}>
                                                                    {w}/12{w === 3 ? ' (Quarter)' : w === 4 ? ' (Third)' : w === 6 ? ' (Half)' : w === 12 ? ' (Full)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Mobile */}
                                                    <div>
                                                        <Label className="text-xs mb-2 flex items-center gap-1">
                                                            <Smartphone className="w-3 h-3" /> Mobile
                                                        </Label>
                                                        <select
                                                            value={column.widthMobile || ''}
                                                            onChange={(e) => {
                                                                if (isNestedColumn) {
                                                                    updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'widthMobile', e.target.value);
                                                                } else {
                                                                    updateColumnWidthMobile(selectedColumn.sectionIndex, selectedColumn.colIndex, e.target.value ? parseInt(e.target.value) : 0);
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="">Auto (Full Width)</option>
                                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                                                <option key={w} value={w}>
                                                                    {w}/12{w === 6 ? ' (Half)' : w === 12 ? ' (Full)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Margin Settings */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.marginTop || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'marginTop', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginTop', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.marginRight || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'marginRight', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginRight', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.marginBottom || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'marginBottom', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginBottom', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.marginLeft || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'marginLeft', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'marginLeft', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding Settings */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.paddingTop || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'paddingTop', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingTop', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.paddingRight || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'paddingRight', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingRight', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.paddingBottom || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'paddingBottom', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingBottom', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={column.paddingLeft || 0}
                                                                onChange={(e) => {
                                                                    if (isNestedColumn) {
                                                                        updateNestedColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, selectedColumn.nestedColIndex!, 'paddingLeft', e.target.value);
                                                                    } else {
                                                                        updateColumnSpacing(selectedColumn.sectionIndex, selectedColumn.colIndex, 'paddingLeft', e.target.value);
                                                                    }
                                                                }}
                                                                placeholder="0"
                                                                min="0"
                                                                className="text-sm h-9"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })()
                )}

                {/* Right Panel - Element Settings */}
                {selectedElement && selectedElementData && (
                    <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-neutral-800 shadow-2xl z-50 overflow-y-auto border-l">
                        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {(() => {
                                    const element = selectedElementData as ColumnElement;
                                    if (element.type === 'heading') return 'Heading Styles';
                                    if (element.type === 'text') return 'Text Styles';
                                    if (element.type === 'image') return 'Image Styles';
                                    if (element.type === 'card') return 'Card Styles';
                                    if (element.type === 'list') return 'List Styles';
                                    if (element.type === 'gallery') return 'Gallery Styles';
                                    if (element.type === 'carousel') return 'Carousel Styles';
                                    if (element.type === 'accordion') return 'Accordion Styles';
                                    if (element.type === 'tabs') return 'Tabs Styles';
                                    if (element.type === 'button') return 'Button Styles';
                                    return 'Element Settings';
                                })()}
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
                            {(() => {
                                const element = selectedElementData as ColumnElement;
                                
                                return (
                                    <>
                                        {/* Typography - Only for heading and text */}
                                        {(element.type === 'heading' || element.type === 'text') && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Typography</h4>
                                                
                                                {/* Color */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Text Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            value={element.color || '#000000'}
                                                            onChange={(e) => updateSelectedElement('color', e.target.value)}
                                                            className="w-16 h-10 cursor-pointer"
                                                        />
                                                        <Input
                                                            type="text"
                                                            value={element.color || '#000000'}
                                                            onChange={(e) => updateSelectedElement('color', e.target.value)}
                                                            placeholder="#000000"
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Font Size */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Font Size</Label>
                                                    <select
                                                        value={element.fontSize || (element.type === 'heading' ? 'text-3xl' : 'text-lg')}
                                                        onChange={(e) => updateSelectedElement('fontSize', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
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

                                                {/* Text Align */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Alignment</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {['left', 'center', 'right'].map((align) => (
                                                            <button
                                                                key={align}
                                                                type="button"
                                                                onClick={() => updateSelectedElement('align', align)}
                                                                className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                                                                    (element.align || 'left') === align
                                                                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                                                        : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                                }`}
                                                            >
                                                                {align}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Line Height */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Line Height</Label>
                                                    <select
                                                        value={element.lineHeight || '1.5'}
                                                        onChange={(e) => updateSelectedElement('lineHeight', e.target.value)}
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

                                                {/* Letter Spacing */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Letter Spacing</Label>
                                                    <select
                                                        value={element.letterSpacing || '0'}
                                                        onChange={(e) => updateSelectedElement('letterSpacing', e.target.value)}
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

                                        {/* Spacing - Only for heading and text */}
                                        {(element.type === 'heading' || element.type === 'text') && (
                                            <>
                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Image Settings - Only for image type */}
                                        {element.type === 'image' && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Image Styles</h4>
                                                <div className="space-y-3">
                                                    {/* Image Shape Preset */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Image Shape</Label>
                                                        <select
                                                            value={element.borderRadius || '0'}
                                                            onChange={(e) => updateSelectedElement('borderRadius', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="0">Square (No Radius)</option>
                                                            <option value="4">Slightly Rounded (4px)</option>
                                                            <option value="8">Rounded (8px)</option>
                                                            <option value="12">More Rounded (12px)</option>
                                                            <option value="16">Very Rounded (16px)</option>
                                                            <option value="24">Extra Rounded (24px)</option>
                                                            <option value="50%">Circle (50%)</option>
                                                        </select>
                                                        <p className="text-xs text-gray-500 mt-1">Choose 'Circle' for perfect round shape</p>
                                                    </div>

                                                    {/* Custom Border Radius */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Custom Border Radius</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="text"
                                                                value={element.borderRadius || '0'}
                                                                onChange={(e) => updateSelectedElement('borderRadius', e.target.value)}
                                                                placeholder="0 or 8px or 50%"
                                                                className="text-sm flex-1"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">Examples: 8px, 1rem, 50% (for circle)</p>
                                                    </div>

                                                    {/* Image Width */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Image Width</Label>
                                                        <select
                                                            value={element.imageWidth || 'full'}
                                                            onChange={(e) => updateSelectedElement('imageWidth', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="full">Full Width (100%)</option>
                                                            <option value="75">75%</option>
                                                            <option value="50">50% (Half)</option>
                                                            <option value="33">33% (Third)</option>
                                                            <option value="25">25% (Quarter)</option>
                                                            <option value="200px">200px (Small)</option>
                                                            <option value="300px">300px (Medium)</option>
                                                            <option value="400px">400px (Large)</option>
                                                        </select>
                                                        <p className="text-xs text-gray-500 mt-1">For circle: use fixed px sizes (200px-400px)</p>
                                                    </div>

                                                    {/* Aspect Ratio */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Aspect Ratio</Label>
                                                        <select
                                                            value={element.aspectRatio || 'auto'}
                                                            onChange={(e) => updateSelectedElement('aspectRatio', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="auto">Auto (Original)</option>
                                                            <option value="1/1">1:1 (Square) - For Circle</option>
                                                            <option value="16/9">16:9 (Widescreen)</option>
                                                            <option value="4/3">4:3 (Standard)</option>
                                                            <option value="3/2">3:2 (Photo)</option>
                                                        </select>
                                                        <p className="text-xs text-gray-500 mt-1">Choose '1:1 (Square)' for perfect circle</p>
                                                    </div>

                                                    {/* Image Fit */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Image Fit</Label>
                                                        <select
                                                            value={element.objectFit || 'cover'}
                                                            onChange={(e) => updateSelectedElement('objectFit', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="cover">Cover (Fill & Crop)</option>
                                                            <option value="contain">Contain (Fit Inside)</option>
                                                            <option value="fill">Fill (Stretch)</option>
                                                            <option value="none">None (Original)</option>
                                                        </select>
                                                        <p className="text-xs text-gray-500 mt-1">Cover works best for circles</p>
                                                    </div>
                                                </div>

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Card Settings */}
                                        {element.type === 'card' && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Card Styles</h4>
                                                
                                                {/* Background Color */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Background Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="color"
                                                            value={element.backgroundColor || '#ffffff'}
                                                            onChange={(e) => updateSelectedElement('backgroundColor', e.target.value)}
                                                            className="w-16 h-10 cursor-pointer"
                                                        />
                                                        <Input
                                                            type="text"
                                                            value={element.backgroundColor || '#ffffff'}
                                                            onChange={(e) => updateSelectedElement('backgroundColor', e.target.value)}
                                                            placeholder="#ffffff"
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Border Radius */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Border Radius (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={element.borderRadius || '8'}
                                                        onChange={(e) => updateSelectedElement('borderRadius', e.target.value)}
                                                        min="0"
                                                        max="999"
                                                        placeholder="8"
                                                        className="text-sm"
                                                    />
                                                </div>

                                                {/* Link/Hyperlink */}
                                                <div>
                                                    <Label className="text-xs mb-2 block">Link URL (Optional)</Label>
                                                    <Input
                                                        type="text"
                                                        value={element.href || ''}
                                                        onChange={(e) => updateSelectedElement('href', e.target.value)}
                                                        placeholder="https://example.com or /page"
                                                        className="text-sm"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Leave empty for no link</p>
                                                </div>

                                                {/* Link Target */}
                                                {element.href && (
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Open Link In</Label>
                                                        <select
                                                            value={element.target || '_self'}
                                                            onChange={(e) => updateSelectedElement('target', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="_self">Same Tab</option>
                                                            <option value="_blank">New Tab</option>
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Typography */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Typography</h4>
                                                    
                                                    {/* Color */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Text Color</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                value={element.color || '#000000'}
                                                                onChange={(e) => updateSelectedElement('color', e.target.value)}
                                                                className="w-16 h-10 cursor-pointer"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={element.color || '#000000'}
                                                                onChange={(e) => updateSelectedElement('color', e.target.value)}
                                                                placeholder="#000000"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Font Size */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Font Size</Label>
                                                        <select
                                                            value={element.fontSize || 'text-base'}
                                                            onChange={(e) => updateSelectedElement('fontSize', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="text-xs">XS</option>
                                                            <option value="text-sm">SM</option>
                                                            <option value="text-base">Base</option>
                                                            <option value="text-lg">LG</option>
                                                            <option value="text-xl">XL</option>
                                                            <option value="text-2xl">2XL</option>
                                                        </select>
                                                    </div>

                                                    {/* Text Align */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Alignment</Label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {['left', 'center', 'right'].map((align) => (
                                                                <button
                                                                    key={align}
                                                                    type="button"
                                                                    onClick={() => updateSelectedElement('align', align)}
                                                                    className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                                                                        (element.align || 'left') === align
                                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                                    }`}
                                                                >
                                                                    {align}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Line Height */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Line Height</Label>
                                                        <select
                                                            value={element.lineHeight || '1.5'}
                                                            onChange={(e) => updateSelectedElement('lineHeight', e.target.value)}
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

                                                    {/* Letter Spacing */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Letter Spacing</Label>
                                                        <select
                                                            value={element.letterSpacing || '0'}
                                                            onChange={(e) => updateSelectedElement('letterSpacing', e.target.value)}
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

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* List Settings - Only for list type */}
                                        {element.type === 'list' && (
                                            <>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">List Styles</h4>
                                                    
                                                    {/* List Type */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">List Type</Label>
                                                        <select
                                                            value={element.listType || 'bullet'}
                                                            onChange={(e) => {
                                                                updateSelectedElement('listType', e.target.value);
                                                                // Auto-set appropriate style when type changes
                                                                if (e.target.value === 'bullet') {
                                                                    updateSelectedElement('listStyle', 'disc');
                                                                } else {
                                                                    updateSelectedElement('listStyle', 'decimal');
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="bullet">Bullet List</option>
                                                            <option value="number">Numbered List</option>
                                                        </select>
                                                    </div>

                                                    {/* List Style */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">List Style</Label>
                                                        <select
                                                            value={element.listStyle || 'disc'}
                                                            onChange={(e) => updateSelectedElement('listStyle', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            {element.listType === 'bullet' ? (
                                                                <>
                                                                    <option value="disc">● Disc (Filled Circle)</option>
                                                                    <option value="circle">○ Circle (Hollow)</option>
                                                                    <option value="square">■ Square</option>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <option value="decimal">1. Decimal (1, 2, 3)</option>
                                                                    <option value="lower-alpha">a. Lower Alpha (a, b, c)</option>
                                                                    <option value="upper-alpha">A. Upper Alpha (A, B, C)</option>
                                                                    <option value="lower-roman">i. Lower Roman (i, ii, iii)</option>
                                                                    <option value="upper-roman">I. Upper Roman (I, II, III)</option>
                                                                </>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Typography */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Typography</h4>
                                                    
                                                    {/* Color */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Text Color</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                value={element.color || '#000000'}
                                                                onChange={(e) => updateSelectedElement('color', e.target.value)}
                                                                className="w-16 h-10 cursor-pointer"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={element.color || '#000000'}
                                                                onChange={(e) => updateSelectedElement('color', e.target.value)}
                                                                placeholder="#000000"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Font Size */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Font Size</Label>
                                                        <select
                                                            value={element.fontSize || 'text-lg'}
                                                            onChange={(e) => updateSelectedElement('fontSize', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="text-xs">XS</option>
                                                            <option value="text-sm">SM</option>
                                                            <option value="text-base">Base</option>
                                                            <option value="text-lg">LG</option>
                                                            <option value="text-xl">XL</option>
                                                            <option value="text-2xl">2XL</option>
                                                        </select>
                                                    </div>

                                                    {/* Text Align */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Alignment</Label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {['left', 'center', 'right'].map((align) => (
                                                                <button
                                                                    key={align}
                                                                    type="button"
                                                                    onClick={() => updateSelectedElement('align', align)}
                                                                    className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                                                                        (element.align || 'left') === align
                                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                                    }`}
                                                                >
                                                                    {align}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Line Height */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Line Height</Label>
                                                        <select
                                                            value={element.lineHeight || '1.5'}
                                                            onChange={(e) => updateSelectedElement('lineHeight', e.target.value)}
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

                                                    {/* Letter Spacing */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Letter Spacing</Label>
                                                        <select
                                                            value={element.letterSpacing || '0'}
                                                            onChange={(e) => updateSelectedElement('letterSpacing', e.target.value)}
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

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Gallery Styles */}
                                        {element.type === 'gallery' && (
                                            <>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Gallery Layout</h4>
                                                    
                                                    {/* Gallery Columns - Responsive */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block font-semibold">Desktop Columns</Label>
                                                        <select
                                                            value={element.galleryColumns || 3}
                                                            onChange={(e) => updateSelectedElement('galleryColumns', parseInt(e.target.value) as any)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value={1}>1 Column</option>
                                                            <option value={2}>2 Columns</option>
                                                            <option value={3}>3 Columns</option>
                                                            <option value={4}>4 Columns</option>
                                                            <option value={5}>5 Columns</option>
                                                            <option value={6}>6 Columns</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs mb-2 block font-semibold">Tablet Columns</Label>
                                                        <select
                                                            value={element.galleryColumnsTablet || 2}
                                                            onChange={(e) => updateSelectedElement('galleryColumnsTablet', parseInt(e.target.value) as any)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value={1}>1 Column</option>
                                                            <option value={2}>2 Columns</option>
                                                            <option value={3}>3 Columns</option>
                                                            <option value={4}>4 Columns</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs mb-2 block font-semibold">Mobile Columns</Label>
                                                        <select
                                                            value={element.galleryColumnsMobile || 1}
                                                            onChange={(e) => updateSelectedElement('galleryColumnsMobile', parseInt(e.target.value) as any)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value={1}>1 Column</option>
                                                            <option value={2}>2 Columns</option>
                                                        </select>
                                                    </div>

                                                    {/* Gap */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Gap Between Images (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={element.galleryGap || '16'}
                                                            onChange={(e) => updateSelectedElement('galleryGap', e.target.value)}
                                                            min="0"
                                                            max="100"
                                                            placeholder="16"
                                                            className="text-sm"
                                                        />
                                                    </div>

                                                    {/* Image Height */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Image Height (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={element.imageHeight || '200'}
                                                            onChange={(e) => updateSelectedElement('imageHeight', e.target.value)}
                                                            min="50"
                                                            max="1000"
                                                            placeholder="200"
                                                            className="text-sm"
                                                        />
                                                    </div>

                                                    {/* Border Radius */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Border Radius (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={element.borderRadius || '8'}
                                                            onChange={(e) => updateSelectedElement('borderRadius', e.target.value)}
                                                            min="0"
                                                            max="50"
                                                            placeholder="8"
                                                            className="text-sm"
                                                        />
                                                    </div>

                                                    {/* Object Fit */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Image Fit</Label>
                                                        <select
                                                            value={element.objectFit || 'cover'}
                                                            onChange={(e) => updateSelectedElement('objectFit', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="cover">Cover (Fill & Crop)</option>
                                                            <option value="contain">Contain (Fit Inside)</option>
                                                            <option value="fill">Fill (Stretch)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Caption Settings */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Caption Settings</h4>
                                                    
                                                    {/* Show Captions Toggle */}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            id="showCaptions"
                                                            type="checkbox"
                                                            checked={element.showCaptions !== false}
                                                            onChange={(e) => updateSelectedElement('showCaptions', e.target.checked as any)}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="showCaptions" className="text-sm mb-0 cursor-pointer">
                                                            Show Captions
                                                        </Label>
                                                    </div>

                                                    {element.showCaptions !== false && (
                                                        <>
                                                            {/* Caption Font Size */}
                                                            <div>
                                                                <Label className="text-xs mb-2 block">Caption Font Size</Label>
                                                                <select
                                                                    value={element.captionFontSize || 'text-sm'}
                                                                    onChange={(e) => updateSelectedElement('captionFontSize', e.target.value)}
                                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                                >
                                                                    <option value="text-xs">XS (Extra Small)</option>
                                                                    <option value="text-sm">SM (Small)</option>
                                                                    <option value="text-base">Base</option>
                                                                    <option value="text-lg">LG (Large)</option>
                                                                </select>
                                                            </div>

                                                            {/* Caption Color */}
                                                            <div>
                                                                <Label className="text-xs mb-2 block">Caption Color</Label>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        type="color"
                                                                        value={element.captionColor || '#6b7280'}
                                                                        onChange={(e) => updateSelectedElement('captionColor', e.target.value)}
                                                                        className="w-16 h-10 cursor-pointer"
                                                                    />
                                                                    <Input
                                                                        type="text"
                                                                        value={element.captionColor || '#6b7280'}
                                                                        onChange={(e) => updateSelectedElement('captionColor', e.target.value)}
                                                                        placeholder="#6b7280"
                                                                        className="flex-1"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Caption Align */}
                                                            <div>
                                                                <Label className="text-xs mb-2 block">Caption Alignment</Label>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {['left', 'center', 'right'].map((align) => (
                                                                        <button
                                                                            key={align}
                                                                            type="button"
                                                                            onClick={() => updateSelectedElement('captionAlign', align)}
                                                                            className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                                                                                (element.captionAlign || 'center') === align
                                                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                                                    : 'border-gray-300 hover:bg-gray-50'
                                                                            }`}
                                                                        >
                                                                            {align}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Accordion Styles */}
                                        {element.type === 'accordion' && (
                                            <>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Accordion Styles</h4>
                                                    <p className="text-xs text-gray-500">
                                                        Manage accordion items directly in the canvas preview above.
                                                    </p>
                                                </div>

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Tabs Styles */}
                                        {element.type === 'tabs' && (
                                            <>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Tabs Styles</h4>
                                                    <p className="text-xs text-gray-500">
                                                        Manage tab items directly in the canvas preview above.
                                                    </p>
                                                </div>

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Button Styles */}
                                        {element.type === 'button' && (
                                            <>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Button Styles</h4>
                                                    <p className="text-xs text-gray-500">
                                                        Customize button appearance and behavior.
                                                    </p>
                                                </div>

                                                {/* Background Color */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Background Color</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                value={element.buttonBgColor || '#3b82f6'}
                                                                onChange={(e) => updateSelectedElement('buttonBgColor', e.target.value)}
                                                                className="w-16 h-10 cursor-pointer"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={element.buttonBgColor || '#3b82f6'}
                                                                onChange={(e) => updateSelectedElement('buttonBgColor', e.target.value)}
                                                                placeholder="#3b82f6"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Text Color */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Text Color</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                value={element.buttonTextColor || '#ffffff'}
                                                                onChange={(e) => updateSelectedElement('buttonTextColor', e.target.value)}
                                                                className="w-16 h-10 cursor-pointer"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={element.buttonTextColor || '#ffffff'}
                                                                onChange={(e) => updateSelectedElement('buttonTextColor', e.target.value)}
                                                                placeholder="#ffffff"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Border Radius */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Border Radius (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={element.buttonBorderRadius || '6'}
                                                            onChange={(e) => updateSelectedElement('buttonBorderRadius', e.target.value)}
                                                            min="0"
                                                            max="999"
                                                            placeholder="6"
                                                            className="text-sm"
                                                        />
                                                    </div>

                                                    {/* Font Size */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Font Size</Label>
                                                        <select
                                                            value={element.buttonFontSize || 'text-base'}
                                                            onChange={(e) => updateSelectedElement('buttonFontSize', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                        >
                                                            <option value="text-xs">XS (Extra Small)</option>
                                                            <option value="text-sm">SM (Small)</option>
                                                            <option value="text-base">Base</option>
                                                            <option value="text-lg">LG (Large)</option>
                                                            <option value="text-xl">XL (Extra Large)</option>
                                                            <option value="text-2xl">2XL</option>
                                                        </select>
                                                    </div>

                                                    {/* Alignment */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Button Alignment</Label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {['left', 'center', 'right'].map((align) => (
                                                                <button
                                                                    key={align}
                                                                    type="button"
                                                                    onClick={() => updateSelectedElement('align', align)}
                                                                    className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                                                                        (element.align || 'left') === align
                                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                                                    }`}
                                                                >
                                                                    {align}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Link URL */}
                                                    <div>
                                                        <Label className="text-xs mb-2 block">Link URL (Optional)</Label>
                                                        <Input
                                                            type="text"
                                                            value={element.buttonHref || ''}
                                                            onChange={(e) => updateSelectedElement('buttonHref', e.target.value)}
                                                            placeholder="https://example.com or /page"
                                                            className="text-sm"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Leave empty for no link</p>
                                                    </div>

                                                    {/* Link Target */}
                                                    {element.buttonHref && (
                                                        <div>
                                                            <Label className="text-xs mb-2 block">Open Link In</Label>
                                                            <select
                                                                value={element.buttonTarget || '_self'}
                                                                onChange={(e) => updateSelectedElement('buttonTarget', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                                            >
                                                                <option value="_self">Same Tab</option>
                                                                <option value="_blank">New Tab</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Margin */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginTop || '0'}
                                                                onChange={(e) => updateSelectedElement('marginTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginRight || '0'}
                                                                onChange={(e) => updateSelectedElement('marginRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginBottom || '0'}
                                                                onChange={(e) => updateSelectedElement('marginBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.marginLeft || '0'}
                                                                onChange={(e) => updateSelectedElement('marginLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Padding */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Padding (px)</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Top</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingTop || '12'}
                                                                onChange={(e) => updateSelectedElement('paddingTop', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Right</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingRight || '24'}
                                                                onChange={(e) => updateSelectedElement('paddingRight', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Bottom</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingBottom || '12'}
                                                                onChange={(e) => updateSelectedElement('paddingBottom', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs mb-1 block">Left</Label>
                                                            <Input
                                                                type="number"
                                                                value={element.paddingLeft || '24'}
                                                                onChange={(e) => updateSelectedElement('paddingLeft', e.target.value)}
                                                                min="0"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
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
