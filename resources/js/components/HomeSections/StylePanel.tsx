import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

interface ColumnElement {
    type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'button';
    value: string;
    items?: string[];
    listType?: 'bullet' | 'number';
    listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
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
    // Button properties
    buttonText?: string;
    buttonHref?: string;
    buttonTarget?: '_blank' | '_self';
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    buttonFontSize?: string;
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
    width: number;
    widthTablet?: number;
    widthMobile?: number;
    card: boolean;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    elements: ColumnElement[];
    columns?: Column[];
}

interface StylePanelProps {
    selectedElement: {
        type: 'column' | 'element' | 'nested-column' | 'nested-element' | 'container';
        rowIndex: number;
        colIndex: number;
        elementIndex?: number;
        nestedColIndex?: number;
    } | null;
    data: any;
    onClose: () => void;
    onUpdateElement: (rowIndex: number, colIndex: number, elementIndex: number, field: string, value: string) => void;
    onUpdateColumn: (rowIndex: number, colIndex: number, field: string, value: string) => void;
    onUpdateNestedColumn?: (rowIndex: number, colIndex: number, nestedColIndex: number, field: string, value: string) => void;
    onUpdateNestedElement: (rowIndex: number, colIndex: number, nestedColIndex: number, elementIndex: number, field: string, value: string) => void;
    onUpdateContainer?: (field: string, value: string) => void;
}

const StylePanel: React.FC<StylePanelProps> = ({ 
    selectedElement, 
    data, 
    onClose, 
    onUpdateElement, 
    onUpdateColumn,
    onUpdateNestedColumn,
    onUpdateNestedElement,
    onUpdateContainer 
}) => {
    if (!selectedElement) return null;

    const { type, rowIndex, colIndex, elementIndex, nestedColIndex } = selectedElement;

    // Get current element or column
    let currentItem: any = null;
    let itemType = '';

    if (type === 'container') {
        currentItem = data.container_config || {};
        itemType = 'Container';
    } else if (type === 'column') {
        currentItem = data.content.rows[rowIndex]?.columns[colIndex];
        itemType = 'Column';
    } else if (type === 'element' && elementIndex !== undefined) {
        currentItem = data.content.rows[rowIndex]?.columns[colIndex]?.elements[elementIndex];
        itemType = currentItem?.type === 'heading' ? 'Heading' : 
                   currentItem?.type === 'text' ? 'Text' : 
                   currentItem?.type === 'card' ? 'Card' : 
                   currentItem?.type === 'list' ? 'List' : 
                   currentItem?.type === 'image' ? 'Image' :
                   currentItem?.type === 'gallery' ? 'Gallery' :
                   currentItem?.type === 'carousel' ? 'Carousel' :
                   currentItem?.type === 'accordion' ? 'Accordion' :
                   currentItem?.type === 'tabs' ? 'Tabs' :
                   currentItem?.type === 'button' ? 'Button' :
                   'Element';
    } else if (type === 'nested-element' && nestedColIndex !== undefined && elementIndex !== undefined) {
        currentItem = data.content.rows[rowIndex]?.columns[colIndex]?.columns?.[nestedColIndex]?.elements[elementIndex];
        itemType = currentItem?.type === 'heading' ? 'Nested Heading' : 
                   currentItem?.type === 'text' ? 'Nested Text' : 
                   currentItem?.type === 'card' ? 'Nested Card' : 
                   currentItem?.type === 'list' ? 'Nested List' : 
                   currentItem?.type === 'image' ? 'Nested Image' :
                   currentItem?.type === 'gallery' ? 'Nested Gallery' :
                   currentItem?.type === 'carousel' ? 'Nested Carousel' :
                   currentItem?.type === 'accordion' ? 'Nested Accordion' :
                   currentItem?.type === 'tabs' ? 'Nested Tabs' :
                   currentItem?.type === 'button' ? 'Nested Button' :
                   'Nested Element';
    } else if (type === 'nested-column' && nestedColIndex !== undefined) {
        currentItem = data.content.rows[rowIndex]?.columns[colIndex]?.columns?.[nestedColIndex];
        itemType = 'Nested Column';
    }

    if (!currentItem && type !== 'container') return null;

    const handleUpdate = (field: string, value: string) => {
        if (type === 'container' && onUpdateContainer) {
            onUpdateContainer(field, value);
        } else if (type === 'element' && elementIndex !== undefined) {
            onUpdateElement(rowIndex, colIndex, elementIndex, field, value);
        } else if (type === 'column') {
            onUpdateColumn(rowIndex, colIndex, field, value);
        } else if (type === 'nested-column' && nestedColIndex !== undefined && onUpdateNestedColumn) {
            onUpdateNestedColumn(rowIndex, colIndex, nestedColIndex, field, value);
        } else if (type === 'nested-element' && nestedColIndex !== undefined && elementIndex !== undefined) {
            onUpdateNestedElement(rowIndex, colIndex, nestedColIndex, elementIndex, field, value);
        }
    };

    console.log('StylePanel Debug:', {
        type,
        currentItemType: currentItem?.type,
        isImage: currentItem?.type === 'image',
        shouldShowImage: (type === 'element' || type === 'nested-element') && currentItem?.type === 'image'
    });

    const isColumnStyle = type === 'column' || type === 'nested-column';
    const spacingInputClass = isColumnStyle ? 'text-sm h-9' : 'text-sm';

    return (
        <div className="fixed right-0 top-0 h-screen w-80 bg-white dark:bg-neutral-800 border-l border-gray-200 dark:border-neutral-700 shadow-xl overflow-y-auto z-50">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isColumnStyle ? 'Column Styles' : `${itemType} Styles`}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Container Settings */}
                {type === 'container' && (
                    <>
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Container Width</h4>
                            
                            <div>
                                <Label className="text-xs mb-2 block">Max Width</Label>
                                <select
                                    value={currentItem.maxWidth || 'max-w-7xl'}
                                    onChange={(e) => handleUpdate('maxWidth', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                >
                                    <option value="max-w-full">Full Width</option>
                                    <option value="max-w-7xl">7XL (Default)</option>
                                    <option value="max-w-6xl">6XL</option>
                                    <option value="max-w-5xl">5XL</option>
                                    <option value="max-w-4xl">4XL</option>
                                    <option value="max-w-3xl">3XL</option>
                                    <option value="max-w-2xl">2XL</option>
                                    <option value="max-w-xl">XL</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Horizontal Padding</h4>
                            
                            <div>
                                <Label className="text-xs mb-2 block">Padding (px)</Label>
                                <Input
                                    type="number"
                                    value={currentItem.horizontalPadding || '16'}
                                    onChange={(e) => handleUpdate('horizontalPadding', e.target.value)}
                                    min="0"
                                    className="text-sm"
                                    placeholder="16"
                                />
                                <p className="text-xs text-gray-500 mt-1">Applies px-4 sm:px-6 lg:px-8 by default (16/24/32px)</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Vertical Padding</h4>
                            
                            <div>
                                <Label className="text-xs mb-2 block">Padding (px)</Label>
                                <Input
                                    type="number"
                                    value={currentItem.verticalPadding || '32'}
                                    onChange={(e) => handleUpdate('verticalPadding', e.target.value)}
                                    min="0"
                                    className="text-sm"
                                    placeholder="32"
                                />
                                <p className="text-xs text-gray-500 mt-1">Top and bottom padding in pixels</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Individual Padding (Override)</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs mb-2 block">Padding Top (px)</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingTop || ''}
                                        onChange={(e) => handleUpdate('paddingTop', e.target.value)}
                                        min="0"
                                        className="text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-2 block">Padding Bottom (px)</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingBottom || ''}
                                        onChange={(e) => handleUpdate('paddingBottom', e.target.value)}
                                        min="0"
                                        className="text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-2 block">Padding Left (px)</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingLeft || ''}
                                        onChange={(e) => handleUpdate('paddingLeft', e.target.value)}
                                        min="0"
                                        className="text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-2 block">Padding Right (px)</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingRight || ''}
                                        onChange={(e) => handleUpdate('paddingRight', e.target.value)}
                                        min="0"
                                        className="text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">If set, these will override horizontal/vertical padding values</p>
                        </div>
                    </>
                )}

                {/* Column Width - Only for Column type */}
                {(type === 'column' || type === 'nested-column') && (
                    <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-blue-300">
                            Column Width (Responsive)
                        </h4>
                        
                        {/* Desktop Width */}
                        <div>
                            <Label className="text-xs mb-2 flex items-center gap-1">
                                <Monitor className="w-3 h-3" /> Desktop
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

                        {/* Tablet Width */}
                        <div>
                            <Label className="text-xs mb-2 flex items-center gap-1">
                                <Tablet className="w-3 h-3" /> Tablet
                            </Label>
                            <select
                                value={currentItem.widthTablet || ''}
                                onChange={(e) => handleUpdate('widthTablet', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                            >
                                <option value="">Same as Desktop</option>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                                    <option key={w} value={w}>{w}/12 {w === 12 ? '(Full)' : w === 6 ? '(Half)' : w === 4 ? '(Third)' : w === 3 ? '(Quarter)' : ''}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mobile Width */}
                        <div>
                            <Label className="text-xs mb-2 flex items-center gap-1">
                                <Smartphone className="w-3 h-3" /> Mobile
                            </Label>
                            <select
                                value={currentItem.widthMobile || ''}
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

                {/* Element Styles (Heading/Text/Card/List) */}
                {(type === 'element' || type === 'nested-element') && (currentItem.type === 'heading' || currentItem.type === 'text' || currentItem.type === 'card' || currentItem.type === 'list') && (
                    <>
                        {/* Card Background - Only for Card type */}
                        {currentItem.type === 'card' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Card Styles</h4>
                                
                                {/* Background Color */}
                                <div>
                                    <Label className="text-xs mb-2 block">Background Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={currentItem.backgroundColor || '#ffffff'}
                                            onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                                            className="w-16 h-10 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={currentItem.backgroundColor || '#ffffff'}
                                            onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
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
                                        value={currentItem.borderRadius || '8'}
                                        onChange={(e) => handleUpdate('borderRadius', e.target.value)}
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
                                        value={currentItem.href || ''}
                                        onChange={(e) => handleUpdate('href', e.target.value)}
                                        placeholder="https://example.com or /page"
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty for no link</p>
                                </div>

                                {/* Link Target */}
                                {currentItem.href && (
                                    <div>
                                        <Label className="text-xs mb-2 block">Open Link In</Label>
                                        <select
                                            value={currentItem.target || '_self'}
                                            onChange={(e) => handleUpdate('target', e.target.value)}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                        >
                                            <option value="_self">Same Tab</option>
                                            <option value="_blank">New Tab</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List Styles - Only for List type */}
                        {currentItem.type === 'list' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">List Styles</h4>
                                
                                {/* List Type */}
                                <div>
                                    <Label className="text-xs mb-2 block">List Type</Label>
                                    <select
                                        value={currentItem.listType || 'bullet'}
                                        onChange={(e) => {
                                            handleUpdate('listType', e.target.value);
                                            // Auto-set appropriate style when type changes
                                            if (e.target.value === 'bullet') {
                                                handleUpdate('listStyle', 'disc');
                                            } else {
                                                handleUpdate('listStyle', 'decimal');
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
                                        value={currentItem.listStyle || 'disc'}
                                        onChange={(e) => handleUpdate('listStyle', e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                    >
                                        {currentItem.listType === 'bullet' ? (
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

                            {/* Font Size */}
                            <div>
                                <Label className="text-xs mb-2 block">Font Size</Label>
                                <select
                                    value={currentItem.fontSize || (currentItem.type === 'heading' ? 'text-3xl' : currentItem.type === 'card' ? 'text-base' : 'text-lg')}
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

                            {/* Text Align */}
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

                            {/* Line Height */}
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

                            {/* Letter Spacing */}
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
                    </>
                )}

                {/* Image Styles */}
                {(type === 'element' || type === 'nested-element') && currentItem.type === 'image' && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Image Styles</h4>
                        
                        {/* Shape Preset */}
                        <div>
                            <Label className="text-xs mb-2 block">Image Shape</Label>
                            <select
                                value={currentItem.borderRadius || '0'}
                                onChange={(e) => handleUpdate('borderRadius', e.target.value)}
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
                                    value={currentItem.borderRadius || '0'}
                                    onChange={(e) => handleUpdate('borderRadius', e.target.value)}
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
                                value={currentItem.imageWidth || 'full'}
                                onChange={(e) => handleUpdate('imageWidth', e.target.value)}
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

                        {/* Aspect Ratio for Circle */}
                        <div>
                            <Label className="text-xs mb-2 block">Aspect Ratio</Label>
                            <select
                                value={currentItem.aspectRatio || 'auto'}
                                onChange={(e) => handleUpdate('aspectRatio', e.target.value)}
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

                        {/* Object Fit */}
                        <div>
                            <Label className="text-xs mb-2 block">Image Fit</Label>
                            <select
                                value={currentItem.objectFit || 'cover'}
                                onChange={(e) => handleUpdate('objectFit', e.target.value)}
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
                )}

                {/* Gallery Styles */}
                {(type === 'element' || type === 'nested-element') && currentItem.type === 'gallery' && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Gallery Styles</h4>
                        
                        {/* Gallery Columns - Desktop */}
                        <div>
                            <Label className="text-xs mb-2 block">Images Per Row (Desktop)</Label>
                            <select
                                value={currentItem.galleryColumns || 3}
                                onChange={(e) => handleUpdate('galleryColumns', parseInt(e.target.value, 10))}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                            >
                                <option value="1">1 Column</option>
                                <option value="2">2 Columns</option>
                                <option value="3">3 Columns</option>
                                <option value="4">4 Columns</option>
                                <option value="5">5 Columns</option>
                                <option value="6">6 Columns</option>
                            </select>
                        </div>

                        {/* Gallery Columns - Tablet */}
                        <div>
                            <Label className="text-xs mb-2 block">Images Per Row (Tablet)</Label>
                            <select
                                value={currentItem.galleryColumnsTablet || currentItem.galleryColumns || 2}
                                onChange={(e) => handleUpdate('galleryColumnsTablet', parseInt(e.target.value, 10))}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                            >
                                <option value="1">1 Column</option>
                                <option value="2">2 Columns</option>
                                <option value="3">3 Columns</option>
                                <option value="4">4 Columns</option>
                                <option value="5">5 Columns</option>
                                <option value="6">6 Columns</option>
                            </select>
                        </div>

                        {/* Gallery Columns - Mobile */}
                        <div>
                            <Label className="text-xs mb-2 block">Images Per Row (Mobile)</Label>
                            <select
                                value={currentItem.galleryColumnsMobile || 1}
                                onChange={(e) => handleUpdate('galleryColumnsMobile', parseInt(e.target.value, 10))}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                            >
                                <option value="1">1 Column</option>
                                <option value="2">2 Columns</option>
                                <option value="3">3 Columns</option>
                            </select>
                        </div>

                        {/* Gallery Gap */}
                        <div>
                            <Label className="text-xs mb-2 block">Gap Between Images (px)</Label>
                            <Input
                                type="number"
                                value={currentItem.galleryGap || '16'}
                                onChange={(e) => handleUpdate('galleryGap', e.target.value)}
                                min="0"
                                max="100"
                                className="text-sm"
                                placeholder="16"
                            />
                        </div>

                        {/* Image Height */}
                        <div>
                            <Label className="text-xs mb-2 block">Image Height (px)</Label>
                            <Input
                                type="number"
                                value={currentItem.imageHeight || '200'}
                                onChange={(e) => handleUpdate('imageHeight', e.target.value)}
                                min="100"
                                max="800"
                                className="text-sm"
                                placeholder="200"
                            />
                        </div>
                    </div>
                )}

                {/* Carousel Styles */}
                {(type === 'element' || type === 'nested-element') && currentItem.type === 'carousel' && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Carousel Styles</h4>
                        
                        {/* Carousel Height */}
                        <div>
                            <Label className="text-xs mb-2 block">Carousel Height (px)</Label>
                            <Input
                                type="number"
                                value={currentItem.carouselHeight || '400'}
                                onChange={(e) => handleUpdate('carouselHeight', e.target.value)}
                                min="200"
                                className="text-sm"
                            />
                        </div>

                        {/* Autoplay */}
                        <div>
                            <Label className="text-xs mb-2 block">Autoplay</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleUpdate('carouselAutoplay', 'true')}
                                    className={`flex-1 px-3 py-2 rounded-md border text-xs transition-colors ${
                                        currentItem.carouselAutoplay === undefined || currentItem.carouselAutoplay === true
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUpdate('carouselAutoplay', 'false')}
                                    className={`flex-1 px-3 py-2 rounded-md border text-xs transition-colors ${
                                        currentItem.carouselAutoplay === false
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        {/* Interval */}
                        {(currentItem.carouselAutoplay === undefined || currentItem.carouselAutoplay === true) && (
                            <div>
                                <Label className="text-xs mb-2 block">Interval (ms)</Label>
                                <Input
                                    type="number"
                                    value={currentItem.carouselInterval || '5000'}
                                    onChange={(e) => handleUpdate('carouselInterval', e.target.value)}
                                    min="1000"
                                    step="500"
                                    className="text-sm"
                                />
                            </div>
                        )}

                        {/* Show Arrows */}
                        <div>
                            <Label className="text-xs mb-2 block">Show Navigation Arrows</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleUpdate('carouselShowArrows', 'true')}
                                    className={`flex-1 px-3 py-2 rounded-md border text-xs transition-colors ${
                                        currentItem.carouselShowArrows === undefined || currentItem.carouselShowArrows === true
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUpdate('carouselShowArrows', 'false')}
                                    className={`flex-1 px-3 py-2 rounded-md border text-xs transition-colors ${
                                        currentItem.carouselShowArrows === false
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        {/* Show Dots */}
                        <div>
                            <Label className="text-xs mb-2 block">Show Dots</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleUpdate('carouselShowDots', 'true')}
                                    className={`flex-1 px-3 py-2 rounded-md border text-xs transition-colors ${
                                        currentItem.carouselShowDots === undefined || currentItem.carouselShowDots === true
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleUpdate('carouselShowDots', 'false')}
                                    className={`flex-1 px-3 py-2 rounded-md border text-xs transition-colors ${
                                        currentItem.carouselShowDots === false
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        {/* Transition Effect */}
                        <div>
                            <Label className="text-xs mb-2 block">Transition Effect</Label>
                            <select
                                value={currentItem.carouselTransition || 'slide'}
                                onChange={(e) => handleUpdate('carouselTransition', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                            >
                                <option value="slide">Slide</option>
                                <option value="fade">Fade</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Accordion Styles */}
                {(type === 'element' || type === 'nested-element') && currentItem.type === 'accordion' && (
                    <>
                    </>
                )}

                {/* Tabs Styles */}
                {(type === 'element' || type === 'nested-element') && currentItem.type === 'tabs' && (
                    <>
                    </>
                )}

                {/* Button Styles */}
                {(type === 'element' || type === 'nested-element') && currentItem.type === 'button' && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Button Styles</h4>
                        
                        {/* Button Text */}
                        <div>
                            <Label className="text-xs mb-2 block">Button Text</Label>
                            <Input
                                type="text"
                                value={currentItem.buttonText || currentItem.value || ''}
                                onChange={(e) => {
                                    handleUpdate('buttonText', e.target.value);
                                    handleUpdate('value', e.target.value);
                                }}
                                placeholder="Button text"
                                className="text-sm"
                            />
                        </div>

                        {/* Background Color */}
                        <div>
                            <Label className="text-xs mb-2 block">Background Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={currentItem.buttonBgColor || '#3b82f6'}
                                    onChange={(e) => handleUpdate('buttonBgColor', e.target.value)}
                                    className="w-16 h-10 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={currentItem.buttonBgColor || '#3b82f6'}
                                    onChange={(e) => handleUpdate('buttonBgColor', e.target.value)}
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
                                    value={currentItem.buttonTextColor || '#ffffff'}
                                    onChange={(e) => handleUpdate('buttonTextColor', e.target.value)}
                                    className="w-16 h-10 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={currentItem.buttonTextColor || '#ffffff'}
                                    onChange={(e) => handleUpdate('buttonTextColor', e.target.value)}
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
                                value={currentItem.buttonBorderRadius || '6'}
                                onChange={(e) => handleUpdate('buttonBorderRadius', e.target.value)}
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
                                value={currentItem.buttonFontSize || 'text-base'}
                                onChange={(e) => handleUpdate('buttonFontSize', e.target.value)}
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

                        {/* Link/Hyperlink */}
                        <div>
                            <Label className="text-xs mb-2 block">Link URL (Optional)</Label>
                            <Input
                                type="text"
                                value={currentItem.buttonHref || ''}
                                onChange={(e) => handleUpdate('buttonHref', e.target.value)}
                                placeholder="https://example.com or /page"
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for no link</p>
                        </div>

                        {/* Link Target */}
                        {currentItem.buttonHref && (
                            <div>
                                <Label className="text-xs mb-2 block">Open Link In</Label>
                                <select
                                    value={currentItem.buttonTarget || '_self'}
                                    onChange={(e) => handleUpdate('buttonTarget', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
                                >
                                    <option value="_self">Same Tab</option>
                                    <option value="_blank">New Tab</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* Spacing - For all types including image */}
                {(type === 'column' || type === 'nested-column' || type === 'element' || type === 'nested-element') && (
                    <>
                        {/* Margin */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b">Margin (px)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs mb-1 block">Top</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.marginTop || 0}
                                        onChange={(e) => handleUpdate('marginTop', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Right</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.marginRight || 0}
                                        onChange={(e) => handleUpdate('marginRight', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Bottom</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.marginBottom || 0}
                                        onChange={(e) => handleUpdate('marginBottom', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Left</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.marginLeft || 0}
                                        onChange={(e) => handleUpdate('marginLeft', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
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
                                        value={currentItem.paddingTop || 0}
                                        onChange={(e) => handleUpdate('paddingTop', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Right</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingRight || 0}
                                        onChange={(e) => handleUpdate('paddingRight', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Bottom</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingBottom || 0}
                                        onChange={(e) => handleUpdate('paddingBottom', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1 block">Left</Label>
                                    <Input
                                        type="number"
                                        value={currentItem.paddingLeft || 0}
                                        onChange={(e) => handleUpdate('paddingLeft', e.target.value)}
                                        min="0"
                                        className={spacingInputClass}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StylePanel;
