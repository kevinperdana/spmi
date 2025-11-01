import React, { useState, useEffect } from 'react';
import { Carousel } from './Carousel';
import { Accordion } from './Accordion';
import { Tabs } from './Tabs';

interface ColumnElement {
    type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'button';
    value: string;
    items?: string[];
    listType?: 'bullet' | 'number';
    listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
    // Button properties
    buttonText?: string;
    buttonHref?: string;
    buttonTarget?: '_blank' | '_self';
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: string;
    buttonFontSize?: string;
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
    elements?: ColumnElement[]; // Direct elements in column
    columns?: NestedColumn[]; // Nested columns (optional)
}

interface NestedColumn {
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

interface HomeSectionContent {
    rows: Row[];
    columns?: any[]; // Legacy support for old structure
}

interface HomeSection {
    id: number;
    layout_type: string;
    section_type: string;
    background_color: string;
    background_config?: BackgroundConfig;
    container_config?: {
        maxWidth?: string;
        horizontalPadding?: string;
        verticalPadding?: string;
        paddingTop?: string;
        paddingBottom?: string;
        paddingLeft?: string;
        paddingRight?: string;
    };
    content: HomeSectionContent;
    order: number;
    is_active: boolean;
}

interface DynamicHomeSectionProps {
    section: HomeSection;
}

export function DynamicHomeSection({ section }: DynamicHomeSectionProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

    const openLightbox = (image: { url: string; caption?: string }) => {
        setLightboxImage(image);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setLightboxImage(null);
        document.body.style.overflow = 'unset';
    };

    const renderElement = (element: ColumnElement, index: number) => {
        const alignmentClass = {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right'
        }[element.align || 'left'];

        const spacingStyle = {
            marginTop: element.marginTop ? `${element.marginTop}px` : '0px',
            marginBottom: element.marginBottom ? `${element.marginBottom}px` : '0px',
            marginLeft: element.marginLeft ? `${element.marginLeft}px` : '0px',
            marginRight: element.marginRight ? `${element.marginRight}px` : '0px',
            paddingTop: element.paddingTop ? `${element.paddingTop}px` : '0px',
            paddingBottom: element.paddingBottom ? `${element.paddingBottom}px` : '0px',
            paddingLeft: element.paddingLeft ? `${element.paddingLeft}px` : '0px',
            paddingRight: element.paddingRight ? `${element.paddingRight}px` : '0px',
            lineHeight: element.lineHeight || '1.5',
            letterSpacing: element.letterSpacing ? `${element.letterSpacing}em` : '0em',
            display: 'block',
        };

        switch (element.type) {
            case 'heading':
                return (
                    <h2 
                        key={index} 
                        className={`${element.fontSize || 'text-3xl'} font-bold ${alignmentClass}`}
                        style={{ 
                            color: element.color || '#000000',
                            ...spacingStyle
                        }}
                    >
                        {element.value}
                    </h2>
                );
            case 'text':
                return (
                    <p 
                        key={index} 
                        className={`${element.fontSize || 'text-lg'} ${alignmentClass}`}
                        style={{ 
                            color: element.color || '#4b5563',
                            ...spacingStyle
                        }}
                    >
                        {element.value}
                    </p>
                );
            case 'image':
                const borderRadius = element.borderRadius && element.borderRadius.trim()
                    ? (element.borderRadius.includes('%') || element.borderRadius.includes('px') || element.borderRadius.includes('rem') || element.borderRadius.includes('em')
                        ? element.borderRadius 
                        : `${element.borderRadius}px`)
                    : '0px';
                
                const imageWidth = element.imageWidth === 'full' || !element.imageWidth
                    ? '100%'
                    : element.imageWidth.includes('%')
                        ? element.imageWidth
                        : element.imageWidth;
                
                const aspectRatio = element.aspectRatio && element.aspectRatio !== 'auto' 
                    ? element.aspectRatio 
                    : undefined;
                
                const objectFit = element.objectFit || 'cover';
                
                return (
                    <div 
                        key={index} 
                        className={`overflow-hidden ${alignmentClass}`}
                        style={{
                            ...spacingStyle,
                            borderRadius,
                            width: imageWidth,
                            maxWidth: '100%',
                            margin: alignmentClass.includes('center') ? '0 auto' : alignmentClass.includes('right') ? '0 0 0 auto' : '0',
                        }}
                    >
                        <img 
                            src={element.value} 
                            alt="Content image"
                            className="w-full h-auto"
                            style={{
                                aspectRatio: aspectRatio,
                                objectFit: objectFit,
                            }}
                        />
                    </div>
                );
            case 'card':
                const cardBorderRadius = element.borderRadius && element.borderRadius.trim()
                    ? (element.borderRadius.includes('%') || element.borderRadius.includes('px') || element.borderRadius.includes('rem') || element.borderRadius.includes('em')
                        ? element.borderRadius 
                        : `${element.borderRadius}px`)
                    : '8px';
                const cardContent = (
                    <div 
                        className={`${element.fontSize || 'text-base'} ${alignmentClass}`}
                        style={{
                            backgroundColor: element.backgroundColor || '#ffffff',
                            color: element.color || '#4b5563',
                            borderRadius: cardBorderRadius,
                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                            ...spacingStyle
                        }}
                    >
                        {element.value}
                    </div>
                );

                // Wrap with link if href is provided
                if (element.href && element.href.trim() !== '') {
                    // Ensure external links have protocol
                    let finalHref = element.href;
                    if (!finalHref.startsWith('http://') && 
                        !finalHref.startsWith('https://') && 
                        !finalHref.startsWith('/') && 
                        !finalHref.startsWith('#') &&
                        !finalHref.startsWith('mailto:') &&
                        !finalHref.startsWith('tel:')) {
                        finalHref = 'https://' + finalHref;
                    }
                    
                    return (
                        <a
                            key={index}
                            href={finalHref}
                            target={element.target || '_self'}
                            rel={element.target === '_blank' ? 'noopener noreferrer' : undefined}
                            className="block hover:opacity-90 transition-opacity"
                        >
                            {cardContent}
                        </a>
                    );
                }

                return <div key={index}>{cardContent}</div>;
            case 'list':
                const ListTag = element.listType === 'number' ? 'ol' : 'ul';
                const listStyleType = element.listStyle || (element.listType === 'number' ? 'decimal' : 'disc');
                
                return (
                    <ListTag
                        key={index}
                        className={`${element.fontSize || 'text-base'} ${alignmentClass}`}
                        style={{
                            color: element.color || '#4b5563',
                            listStyleType: listStyleType,
                            paddingLeft: '1.5rem',
                            ...spacingStyle
                        }}
                    >
                        {element.items && element.items.map((item, itemIndex) => (
                            <li key={itemIndex} style={{ marginBottom: '0.5rem' }}>
                                {item}
                            </li>
                        ))}
                    </ListTag>
                );
            case 'gallery':
                if (!element.images || element.images.length === 0) {
                    return null;
                }
                
                // Ensure galleryColumns is a number for each device
                const galleryColumns = parseInt(String(element.galleryColumns || 3), 10);
                const galleryColumnsTablet = parseInt(String(element.galleryColumnsTablet || galleryColumns || 2), 10);
                const galleryColumnsMobile = parseInt(String(element.galleryColumnsMobile || 1), 10);
                const galleryGap = element.galleryGap ? `${element.galleryGap}px` : '16px';
                const imageHeight = element.imageHeight ? `${element.imageHeight}px` : '200px';
                
                return (
                    <div 
                        key={index}
                        className="w-full gallery-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${galleryColumnsMobile}, minmax(0, 1fr))`,
                            gap: galleryGap,
                            marginTop: element.marginTop ? `${element.marginTop}px` : '0px',
                            marginBottom: element.marginBottom ? `${element.marginBottom}px` : '0px',
                            marginLeft: element.marginLeft ? `${element.marginLeft}px` : '0px',
                            marginRight: element.marginRight ? `${element.marginRight}px` : '0px',
                            paddingTop: element.paddingTop ? `${element.paddingTop}px` : '0px',
                            paddingBottom: element.paddingBottom ? `${element.paddingBottom}px` : '0px',
                            paddingLeft: element.paddingLeft ? `${element.paddingLeft}px` : '0px',
                            paddingRight: element.paddingRight ? `${element.paddingRight}px` : '0px',
                            '--gallery-cols-mobile': galleryColumnsMobile,
                            '--gallery-cols-tablet': galleryColumnsTablet,
                            '--gallery-cols-desktop': galleryColumns,
                        } as React.CSSProperties}
                    >
                        {element.images.map((img, imgIndex) => (
                            <div 
                                key={imgIndex}
                                className="w-full cursor-pointer group"
                                style={{
                                    minWidth: 0,
                                    overflow: 'hidden'
                                }}
                                onClick={() => openLightbox(img)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Gallery image ${imgIndex + 1}`}
                                    className="transition-transform duration-300 group-hover:scale-105"
                                    style={{
                                        width: '100%',
                                        height: imageHeight,
                                        objectFit: 'cover',
                                        display: 'block',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                                {element.showCaptions && img.caption && (
                                    <p
                                        className={`${element.captionFontSize || 'text-sm'}`}
                                        style={{
                                            color: element.captionColor || '#6b7280',
                                            textAlign: element.captionAlign || 'center',
                                            marginTop: '0.5rem'
                                        }}
                                    >
                                        {img.caption}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                );
            case 'carousel':
                if (!element.images || element.images.length === 0) {
                    return null;
                }
                
                return (
                    <Carousel
                        key={index}
                        images={element.images}
                        autoplay={element.carouselAutoplay === true || element.carouselAutoplay === 'true' || element.carouselAutoplay === undefined}
                        interval={element.carouselInterval || 5000}
                        showDots={element.carouselShowDots === true || element.carouselShowDots === 'true' || element.carouselShowDots === undefined}
                        showArrows={element.carouselShowArrows === true || element.carouselShowArrows === 'true' || element.carouselShowArrows === undefined}
                        height={element.carouselHeight ? `${element.carouselHeight}px` : '400px'}
                        transition={element.carouselTransition || 'slide'}
                        showCaptions={element.showCaptions}
                        captionFontSize={element.captionFontSize || 'text-base'}
                        captionColor={element.captionColor || '#ffffff'}
                        captionAlign={element.captionAlign || 'center'}
                        marginTop={element.marginTop ? `${element.marginTop}px` : '0px'}
                        marginBottom={element.marginBottom ? `${element.marginBottom}px` : '0px'}
                        marginLeft={element.marginLeft ? `${element.marginLeft}px` : '0px'}
                        marginRight={element.marginRight ? `${element.marginRight}px` : '0px'}
                        paddingTop={element.paddingTop ? `${element.paddingTop}px` : '0px'}
                        paddingBottom={element.paddingBottom ? `${element.paddingBottom}px` : '0px'}
                        paddingLeft={element.paddingLeft ? `${element.paddingLeft}px` : '0px'}
                        paddingRight={element.paddingRight ? `${element.paddingRight}px` : '0px'}
                    />
                );
            case 'accordion':
                if (!element.accordionItems || element.accordionItems.length === 0) {
                    return null;
                }
                
                return (
                    <Accordion
                        key={index}
                        items={element.accordionItems}
                        style={element.accordionStyle || 'default'}
                        iconPosition={element.accordionIconPosition || 'right'}
                        openMultiple={element.accordionOpenMultiple === true || element.accordionOpenMultiple === 'true'}
                        borderColor={element.accordionBorderColor || '#e5e7eb'}
                        headerBg={element.accordionHeaderBg || '#f9fafb'}
                        headerTextColor={element.accordionHeaderTextColor || '#111827'}
                        contentBg={element.accordionContentBg || '#ffffff'}
                        contentTextColor={element.accordionContentTextColor || '#374151'}
                        borderRadius={element.accordionBorderRadius ? `${element.accordionBorderRadius}px` : '8px'}
                        marginTop={element.marginTop ? `${element.marginTop}px` : '0px'}
                        marginBottom={element.marginBottom ? `${element.marginBottom}px` : '0px'}
                        marginLeft={element.marginLeft ? `${element.marginLeft}px` : '0px'}
                        marginRight={element.marginRight ? `${element.marginRight}px` : '0px'}
                        paddingTop={element.paddingTop ? `${element.paddingTop}px` : '0px'}
                        paddingBottom={element.paddingBottom ? `${element.paddingBottom}px` : '0px'}
                        paddingLeft={element.paddingLeft ? `${element.paddingLeft}px` : '0px'}
                        paddingRight={element.paddingRight ? `${element.paddingRight}px` : '0px'}
                    />
                );
            case 'tabs':
                if (!element.tabItems || element.tabItems.length === 0) {
                    return null;
                }
                
                return (
                    <Tabs
                        key={index}
                        items={element.tabItems}
                        style={element.tabStyle || 'default'}
                        position={element.tabPosition || 'top'}
                        borderColor={element.tabBorderColor || '#e5e7eb'}
                        activeColor={element.tabActiveColor || '#3b82f6'}
                        inactiveColor={element.tabInactiveColor || '#6b7280'}
                        activeBg={element.tabActiveBg || '#eff6ff'}
                        inactiveBg={element.tabInactiveBg || 'transparent'}
                        contentBg={element.tabContentBg || '#ffffff'}
                        contentTextColor={element.tabContentTextColor || '#374151'}
                        marginTop={element.marginTop ? `${element.marginTop}px` : '0px'}
                        marginBottom={element.marginBottom ? `${element.marginBottom}px` : '0px'}
                        marginLeft={element.marginLeft ? `${element.marginLeft}px` : '0px'}
                        marginRight={element.marginRight ? `${element.marginRight}px` : '0px'}
                        paddingTop={element.paddingTop ? `${element.paddingTop}px` : '0px'}
                        paddingBottom={element.paddingBottom ? `${element.paddingBottom}px` : '0px'}
                        paddingLeft={element.paddingLeft ? `${element.paddingLeft}px` : '0px'}
                        paddingRight={element.paddingRight ? `${element.paddingRight}px` : '0px'}
                    />
                );
            case 'button':
                const buttonBorderRadius = element.buttonBorderRadius && element.buttonBorderRadius.trim()
                    ? (element.buttonBorderRadius.includes('%') || element.buttonBorderRadius.includes('px') || element.buttonBorderRadius.includes('rem') || element.buttonBorderRadius.includes('em')
                        ? element.buttonBorderRadius 
                        : `${element.buttonBorderRadius}px`)
                    : '6px';
                
                const buttonContent = (
                    <button
                        className={`${element.buttonFontSize || 'text-base'} font-medium transition-all hover:opacity-90 ${alignmentClass}`}
                        style={{
                            backgroundColor: element.buttonBgColor || '#3b82f6',
                            color: element.buttonTextColor || '#ffffff',
                            borderRadius: buttonBorderRadius,
                            ...spacingStyle,
                            border: 'none',
                            cursor: 'pointer',
                            display: element.align === 'center' ? 'inline-block' : element.align === 'right' ? 'inline-block' : 'inline-block',
                        }}
                    >
                        {element.buttonText || element.value || 'Button'}
                    </button>
                );

                // Wrap with link if href is provided
                if (element.buttonHref && element.buttonHref.trim() !== '') {
                    let finalHref = element.buttonHref;
                    if (!finalHref.startsWith('http://') && 
                        !finalHref.startsWith('https://') && 
                        !finalHref.startsWith('/') && 
                        !finalHref.startsWith('#') &&
                        !finalHref.startsWith('mailto:') &&
                        !finalHref.startsWith('tel:')) {
                        finalHref = 'https://' + finalHref;
                    }
                    
                    return (
                        <div key={index} className={alignmentClass}>
                            <a
                                href={finalHref}
                                target={element.buttonTarget || '_self'}
                                rel={element.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
                                style={{ textDecoration: 'none' }}
                            >
                                {buttonContent}
                            </a>
                        </div>
                    );
                }

                return <div key={index} className={alignmentClass}>{buttonContent}</div>;
            default:
                return null;
        }
    };

    const renderNestedColumn = (nestedCol: NestedColumn, index: number) => {
        // Apply margin and padding to nested column
        const nestedColStyle = {
            marginTop: nestedCol.marginTop ? `${nestedCol.marginTop}px` : '0px',
            marginBottom: nestedCol.marginBottom ? `${nestedCol.marginBottom}px` : '0px',
            marginLeft: nestedCol.marginLeft ? `${nestedCol.marginLeft}px` : '0px',
            marginRight: nestedCol.marginRight ? `${nestedCol.marginRight}px` : '0px',
            paddingTop: nestedCol.paddingTop ? `${nestedCol.paddingTop}px` : '0px',
            paddingBottom: nestedCol.paddingBottom ? `${nestedCol.paddingBottom}px` : '0px',
            paddingLeft: nestedCol.paddingLeft ? `${nestedCol.paddingLeft}px` : '0px',
            paddingRight: nestedCol.paddingRight ? `${nestedCol.paddingRight}px` : '0px',
        };

        // Nested columns are always plain (no card styling)
        return (
            <div key={index} style={nestedColStyle}>
                {nestedCol.elements && nestedCol.elements.map((element, elemIndex) => 
                    renderElement(element, elemIndex)
                )}
            </div>
        );
    };

    const renderColumn = (column: Column, colIndex: number) => {
        // Render direct elements if exist
        const directElements = column.elements && column.elements.length > 0 ? (
            <div style={{ width: '100%' }}>
                {column.elements.map((element, elemIndex) => 
                    renderElement(element, elemIndex)
                )}
            </div>
        ) : null;

        // Render nested columns if exist
        const nestedColumnsContent = column.columns && column.columns.length > 0 ? (
            <div className="grid grid-cols-12 gap-4">
                {column.columns.map((nestedCol, nestedIndex) => (
                    <div key={nestedCol.id || nestedIndex} className={getColumnWidthClass(nestedCol as any)}>
                        {renderNestedColumn(nestedCol, nestedIndex)}
                    </div>
                ))}
            </div>
        ) : null;

        // If nothing to render
        if (!directElements && !nestedColumnsContent) {
            return <div key={colIndex} className="text-gray-400 text-sm">Empty column</div>;
        }

        const columnContainer = (
            <>
                {directElements}
                {nestedColumnsContent}
            </>
        );

        // Build inline styles for margin and padding
        const columnStyle: React.CSSProperties = {
            marginTop: column.marginTop ? `${column.marginTop}px` : undefined,
            marginBottom: column.marginBottom ? `${column.marginBottom}px` : undefined,
            marginLeft: column.marginLeft ? `${column.marginLeft}px` : undefined,
            marginRight: column.marginRight ? `${column.marginRight}px` : undefined,
            paddingTop: column.paddingTop ? `${column.paddingTop}px` : undefined,
            paddingBottom: column.paddingBottom ? `${column.paddingBottom}px` : undefined,
            paddingLeft: column.paddingLeft ? `${column.paddingLeft}px` : undefined,
            paddingRight: column.paddingRight ? `${column.paddingRight}px` : undefined,
        };

        // Apply card styling to main column container if card is true
        if (column.card) {
            return (
                <div key={colIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={columnStyle}>
                    {columnContainer}
                </div>
            );
        }

        return <div key={colIndex} style={columnStyle}>{columnContainer}</div>;
    };

    const getColumnWidthClass = (column: Column) => {
        // Hardcoded Tailwind classes untuk responsive (Tailwind perlu tahu semua classes di build time)
        const widthClasses: { [key: string]: string } = {
            // Mobile only
            '12-12-12': 'col-span-12 md:col-span-12 lg:col-span-12',
            '12-12-6': 'col-span-12 md:col-span-12 lg:col-span-6',
            '12-12-4': 'col-span-12 md:col-span-12 lg:col-span-4',
            '12-12-8': 'col-span-12 md:col-span-12 lg:col-span-8',
            '12-12-3': 'col-span-12 md:col-span-12 lg:col-span-3',
            '12-12-2': 'col-span-12 md:col-span-12 lg:col-span-2',
            '12-12-1': 'col-span-12 md:col-span-12 lg:col-span-1',
            '12-12-5': 'col-span-12 md:col-span-12 lg:col-span-5',
            '12-12-7': 'col-span-12 md:col-span-12 lg:col-span-7',
            '12-12-9': 'col-span-12 md:col-span-12 lg:col-span-9',
            '12-12-10': 'col-span-12 md:col-span-12 lg:col-span-10',
            '12-12-11': 'col-span-12 md:col-span-12 lg:col-span-11',
            '12-6-6': 'col-span-12 md:col-span-6 lg:col-span-6',
            '12-6-4': 'col-span-12 md:col-span-6 lg:col-span-4',
            '12-6-8': 'col-span-12 md:col-span-6 lg:col-span-8',
            '12-6-3': 'col-span-12 md:col-span-6 lg:col-span-3',
            '12-6-12': 'col-span-12 md:col-span-6 lg:col-span-12',
            '12-4-4': 'col-span-12 md:col-span-4 lg:col-span-4',
            '12-4-6': 'col-span-12 md:col-span-4 lg:col-span-6',
            '12-4-8': 'col-span-12 md:col-span-4 lg:col-span-8',
            '12-4-3': 'col-span-12 md:col-span-4 lg:col-span-3',
            '12-8-8': 'col-span-12 md:col-span-8 lg:col-span-8',
            '12-8-4': 'col-span-12 md:col-span-8 lg:col-span-4',
            '12-8-6': 'col-span-12 md:col-span-8 lg:col-span-6',
            '12-8-12': 'col-span-12 md:col-span-8 lg:col-span-12',
            '12-3-3': 'col-span-12 md:col-span-3 lg:col-span-3',
            '12-3-4': 'col-span-12 md:col-span-3 lg:col-span-4',
            '12-3-6': 'col-span-12 md:col-span-3 lg:col-span-6',
            '6-6-6': 'col-span-6 md:col-span-6 lg:col-span-6',
            '6-6-12': 'col-span-6 md:col-span-6 lg:col-span-12',
            '6-6-4': 'col-span-6 md:col-span-6 lg:col-span-4',
            '6-6-8': 'col-span-6 md:col-span-6 lg:col-span-8',
            '6-12-6': 'col-span-6 md:col-span-12 lg:col-span-6',
            '6-12-12': 'col-span-6 md:col-span-12 lg:col-span-12',
            '6-12-4': 'col-span-6 md:col-span-12 lg:col-span-4',
            '6-12-8': 'col-span-6 md:col-span-12 lg:col-span-8',
            '4-4-4': 'col-span-4 md:col-span-4 lg:col-span-4',
            '4-6-6': 'col-span-4 md:col-span-6 lg:col-span-6',
            '4-6-4': 'col-span-4 md:col-span-6 lg:col-span-4',
            '4-6-8': 'col-span-4 md:col-span-6 lg:col-span-8',
            '4-12-12': 'col-span-4 md:col-span-12 lg:col-span-12',
            '4-12-4': 'col-span-4 md:col-span-12 lg:col-span-4',
            '4-12-8': 'col-span-4 md:col-span-12 lg:col-span-8',
            '8-8-8': 'col-span-8 md:col-span-8 lg:col-span-8',
            '8-6-6': 'col-span-8 md:col-span-6 lg:col-span-6',
            '8-6-8': 'col-span-8 md:col-span-6 lg:col-span-8',
            '8-12-8': 'col-span-8 md:col-span-12 lg:col-span-8',
            '8-12-12': 'col-span-8 md:col-span-12 lg:col-span-12',
            '3-3-3': 'col-span-3 md:col-span-3 lg:col-span-3',
            '3-6-6': 'col-span-3 md:col-span-6 lg:col-span-6',
            '3-12-12': 'col-span-3 md:col-span-12 lg:col-span-12',
            // Additional common combinations
            '1-1-1': 'col-span-1 md:col-span-1 lg:col-span-1',
            '2-2-2': 'col-span-2 md:col-span-2 lg:col-span-2',
            '5-5-5': 'col-span-5 md:col-span-5 lg:col-span-5',
            '7-7-7': 'col-span-7 md:col-span-7 lg:col-span-7',
            '9-9-9': 'col-span-9 md:col-span-9 lg:col-span-9',
            '10-10-10': 'col-span-10 md:col-span-10 lg:col-span-10',
            '11-11-11': 'col-span-11 md:col-span-11 lg:col-span-11',
        };
        
        const mobile = column.widthMobile || 12;
        const tablet = column.widthTablet || column.width || 12;
        const desktop = column.width || 12;
        const key = `${mobile}-${tablet}-${desktop}`;
        
        // Return hardcoded class or fallback to full width
        return widthClasses[key] || 'col-span-12 md:col-span-12 lg:col-span-12';
    };

    const renderRow = (row: Row, rowIndex: number) => {
        return (
            <div key={row.id || rowIndex} className="grid grid-cols-12 gap-4">
                {row.columns.map((column, colIndex) => (
                    <div key={column.id || colIndex} className={getColumnWidthClass(column)}>
                        {renderColumn(column, colIndex)}
                    </div>
                ))}
            </div>
        );
    };

    const getBackgroundStyle = () => {
        if (section.background_config?.type === 'gradient' && section.background_config.gradient) {
            const { color1, color2, angle } = section.background_config.gradient;
            return {
                background: `linear-gradient(${angle}deg, ${color1}, ${color2})`
            };
        }
        return {
            backgroundColor: section.background_config?.color || section.background_color || '#ffffff'
        };
    };

    // Support both new rows structure and legacy columns structure
    const hasRows = section.content.rows && section.content.rows.length > 0;
    const hasLegacyColumns = section.content.columns && section.content.columns.length > 0;

    // Get container settings with defaults
    const maxWidth = section.container_config?.maxWidth || 'max-w-7xl';
    const horizontalPadding = section.container_config?.horizontalPadding || '16';
    const verticalPadding = section.container_config?.verticalPadding || '32';
    
    // Individual padding overrides horizontal/vertical padding
    const paddingTop = section.container_config?.paddingTop || verticalPadding;
    const paddingBottom = section.container_config?.paddingBottom || verticalPadding;
    const paddingLeft = section.container_config?.paddingLeft || horizontalPadding;
    const paddingRight = section.container_config?.paddingRight || horizontalPadding;
    
    const containerClass = `${maxWidth} mx-auto`;
    const containerStyle = {
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`
    };

    return (
        <div style={getBackgroundStyle()}>
            <div className={containerClass} style={containerStyle}>
                {hasRows ? (
                    <div className="space-y-6">
                        {section.content.rows.map((row, rowIndex) => 
                            renderRow(row, rowIndex)
                        )}
                    </div>
                ) : hasLegacyColumns ? (
                    // Legacy support for old column-based structure (direct elements)
                    <div className="grid md:grid-cols-2 gap-6">
                        {section.content.columns!.map((column: any, index) => {
                            // Old structure had direct elements
                            if (column.elements) {
                                const columnContent = (
                                    <div>
                                        {column.elements.map((element: any, elemIndex: number) => 
                                            renderElement(element, elemIndex)
                                        )}
                                    </div>
                                );

                                if (column.card) {
                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            {columnContent}
                                        </div>
                                    );
                                }
                                return <div key={index}>{columnContent}</div>;
                            }
                            return null;
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">No content available</div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && lightboxImage && (
                <div 
                    className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                        aria-label="Close lightbox"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div 
                        className="max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={lightboxImage.url}
                            alt={lightboxImage.caption || 'Gallery image'}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            style={{ maxHeight: 'calc(90vh - 80px)' }}
                        />
                        {lightboxImage.caption && (
                            <p className="text-white text-center mt-4 text-lg">
                                {lightboxImage.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DynamicHomeSection;
