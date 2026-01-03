import { useEffect, useMemo, useState } from 'react';
import { Carousel } from './Carousel';
import { Accordion } from './Accordion';
import { Tabs } from './Tabs';

interface ColumnElement {
    type: 'heading' | 'text' | 'image' | 'card' | 'list' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'button' | 'custom';
    value: string;
    description?: string; // For card description
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    // Image properties
    imageWidth?: string;
    aspectRatio?: string;
    objectFit?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    href?: string;
    target?: '_blank' | '_self';
    // Card properties (using both old and new naming)
    backgroundColor?: string;
    cardPadding?: string;
    cardBackground?: string;
    cardBorderRadius?: string;
    cardBorder?: string;
    cardShadow?: string;
    blocks?: ColumnElement[]; // Nested blocks for card
    // Custom code properties
    customHtml?: string;
    customCss?: string;
    customJs?: string;
    // List properties
    listStyle?: 'disc' | 'decimal' | 'none';
    items?: string[];
    iconColor?: string;
    iconSize?: string;
    itemSpacing?: string;
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
    card: boolean;
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

interface Section {
    id: string;
    layout_type: string;
    background_config?: BackgroundConfig;
    container_config?: ContainerConfig;
    columns: Column[];
}

interface PageContent {
    rows?: Row[];
    sections?: Section[];
}

interface Props {
    content: PageContent;
}

const CustomCodeBlock = ({ html, css, js }: { html?: string; css?: string; js?: string }) => {
    const scriptId = useMemo(
        () => `custom-code-${Math.random().toString(36).slice(2)}`,
        []
    );

    useEffect(() => {
        if (!js || !js.trim()) return;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.dataset.customCodeId = scriptId;
        script.text = js;
        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, [js, scriptId]);

    return (
        <div className="custom-code-block">
            {css && css.trim() ? <style>{css}</style> : null}
            {html && html.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : null}
        </div>
    );
};

export function PageContentRenderer({ content }: Props) {
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

    // Support both old (rows) and new (sections) format
    const hasContent = (content?.rows && content.rows.length > 0) || (content?.sections && content.sections.length > 0);
    
    if (!content || !hasContent) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <p className="text-gray-500">No content available.</p>
            </div>
        );
    }

    // Normalize URL to make it absolute/standalone
    const normalizeUrl = (url: string) => {
        if (!url) return url;
        // If URL doesn't start with http://, https://, //, or mailto:, add https://
        if (!url.match(/^(https?:\/\/|mailto:|tel:|#|\/\/)/)) {
            return 'https://' + url;
        }
        return url;
    };

    const renderElement = (element: ColumnElement, index: number) => {
        const textAlign = element.align || 'left';
        const color = element.color || '#000000';
        const fontSize = element.fontSize || 'text-base';
        const fontWeight = element.fontWeight || '';
        const lineHeight = element.lineHeight || '';
        const letterSpacing = element.letterSpacing || '';

        const getElementStyles = () => {
            const styles: React.CSSProperties = {
                textAlign,
                color,
            };
            
            // For gallery, list, image, and carousel elements, default margin and padding to 0 if not set
            const needsZeroDefault = element.type === 'gallery' || element.type === 'list' || element.type === 'image' || element.type === 'carousel';
            
            // Handle margin with unit support
            if (element.marginTop !== undefined) {
                styles.marginTop = (element.marginTop === '0' || Number(element.marginTop) === 0)
                    ? '0'
                    : (typeof element.marginTop === 'number' || !element.marginTop.toString().match(/[a-z%]/)
                        ? `${element.marginTop}px`
                        : element.marginTop);
            } else if (needsZeroDefault) {
                styles.marginTop = '0';
            }
            
            if (element.marginBottom !== undefined) {
                styles.marginBottom = (element.marginBottom === '0' || Number(element.marginBottom) === 0)
                    ? '0'
                    : (typeof element.marginBottom === 'number' || !element.marginBottom.toString().match(/[a-z%]/)
                        ? `${element.marginBottom}px`
                        : element.marginBottom);
            } else if (needsZeroDefault) {
                styles.marginBottom = '0';
            }
            
            if (element.marginLeft !== undefined) {
                styles.marginLeft = (element.marginLeft === '0' || Number(element.marginLeft) === 0)
                    ? '0'
                    : (typeof element.marginLeft === 'number' || !element.marginLeft.toString().match(/[a-z%]/)
                        ? `${element.marginLeft}px`
                        : element.marginLeft);
            } else if (needsZeroDefault) {
                styles.marginLeft = '0';
            }
            
            if (element.marginRight !== undefined) {
                styles.marginRight = (element.marginRight === '0' || Number(element.marginRight) === 0)
                    ? '0'
                    : (typeof element.marginRight === 'number' || !element.marginRight.toString().match(/[a-z%]/)
                        ? `${element.marginRight}px`
                        : element.marginRight);
            } else if (needsZeroDefault) {
                styles.marginRight = '0';
            }
            
            if (element.paddingTop !== undefined) {
                styles.paddingTop = (element.paddingTop === '0' || Number(element.paddingTop) === 0)
                    ? '0'
                    : (typeof element.paddingTop === 'number' || !element.paddingTop.toString().match(/[a-z%]/)
                        ? `${element.paddingTop}px`
                        : element.paddingTop);
            } else if (needsZeroDefault) {
                styles.paddingTop = '0';
            }
            
            if (element.paddingBottom !== undefined) {
                styles.paddingBottom = (element.paddingBottom === '0' || Number(element.paddingBottom) === 0)
                    ? '0'
                    : (typeof element.paddingBottom === 'number' || !element.paddingBottom.toString().match(/[a-z%]/)
                        ? `${element.paddingBottom}px`
                        : element.paddingBottom);
            } else if (needsZeroDefault) {
                styles.paddingBottom = '0';
            }
            
            if (element.paddingLeft !== undefined) {
                styles.paddingLeft = (element.paddingLeft === '0' || Number(element.paddingLeft) === 0)
                    ? '0'
                    : (typeof element.paddingLeft === 'number' || !element.paddingLeft.toString().match(/[a-z%]/)
                        ? `${element.paddingLeft}px`
                        : element.paddingLeft);
            } else if (needsZeroDefault) {
                styles.paddingLeft = '0';
            }
            
            if (element.paddingRight !== undefined) {
                styles.paddingRight = (element.paddingRight === '0' || Number(element.paddingRight) === 0)
                    ? '0'
                    : (typeof element.paddingRight === 'number' || !element.paddingRight.toString().match(/[a-z%]/)
                        ? `${element.paddingRight}px`
                        : element.paddingRight);
            } else if (needsZeroDefault) {
                styles.paddingRight = '0';
            }
            
            return styles;
        };

        if (element.type === 'heading') {
            // Use fontWeight from element or default to font-bold
            const headingWeight = fontWeight || element.fontWeight || 'font-bold';
            const headingSize = fontSize || element.fontSize || 'text-3xl';
            const headingLineHeight = lineHeight || element.lineHeight || '';
            const headingLetterSpacing = letterSpacing || element.letterSpacing || '';
            
            return (
                <h2
                    key={index}
                    className={`${headingSize} ${headingWeight} ${headingLineHeight} ${headingLetterSpacing}`.trim()}
                    style={getElementStyles()}
                >
                    {element.value}
                </h2>
            );
        }

        if (element.type === 'text') {
            return (
                <p
                    key={index}
                    className={`${fontSize} ${fontWeight} ${lineHeight} ${letterSpacing}`.trim()}
                    style={{ ...getElementStyles(), whiteSpace: 'pre-wrap' }}
                >
                    {element.value}
                </p>
            );
        }

        if (element.type === 'image' && element.value) {
            const imageStyles: React.CSSProperties = {
                ...getElementStyles(),
                width: element.imageWidth === 'full' || !element.imageWidth
                    ? '100%'
                    : element.imageWidth.includes('%')
                        ? element.imageWidth
                        : element.imageWidth,
                borderRadius: element.borderRadius 
                    ? (element.borderRadius.toString().includes('%') || element.borderRadius.toString().includes('px')
                        ? element.borderRadius
                        : `${element.borderRadius}px`)
                    : '0',
                aspectRatio: element.aspectRatio && element.aspectRatio !== 'auto' ? element.aspectRatio : undefined,
                objectFit: (element.objectFit || 'cover') as any,
            };
            
            const imageElement = (
                <img
                    src={element.value}
                    alt="Page content"
                    style={imageStyles}
                />
            );

            if (element.href) {
                return (
                    <a
                        key={index}
                        href={normalizeUrl(element.href)}
                        target={element.target || '_self'}
                        rel={element.target === '_blank' ? 'noopener noreferrer' : undefined}
                        style={{ textAlign }}
                        className="inline-block"
                    >
                        {imageElement}
                    </a>
                );
            }

            return (
                <div
                    key={index}
                    style={{ textAlign }}
                >
                    {imageElement}
                </div>
            );
        }

        if (element.type === 'custom') {
            return (
                <CustomCodeBlock
                    key={index}
                    html={element.customHtml}
                    css={element.customCss}
                    js={element.customJs}
                />
            );
        }

        if (element.type === 'card') {
            const borderValue = (() => {
                const hasCustomBorder = element.borderWidth !== undefined || element.borderColor !== undefined;
                if (hasCustomBorder) {
                    const widthValue = `${element.borderWidth ?? '1'}`.trim() || '1';
                    const widthNumber = parseFloat(widthValue);
                    if (!Number.isNaN(widthNumber) && widthNumber === 0) {
                        return 'none';
                    }
                    const widthCss = /[a-z%]/i.test(widthValue) ? widthValue : `${widthValue}px`;
                    return `${widthCss} solid ${element.borderColor || '#e5e7eb'}`;
                }
                return element.cardBorder || '1px solid #e5e7eb';
            })();

            const cardStyles: React.CSSProperties = {
                ...getElementStyles(),
                padding: element.cardPadding 
                    ? (typeof element.cardPadding === 'string' && element.cardPadding.includes('px') 
                        ? element.cardPadding 
                        : `${element.cardPadding}px`)
                    : `${element.paddingTop || 24}px ${element.paddingRight || 24}px ${element.paddingBottom || 24}px ${element.paddingLeft || 24}px`,
                backgroundColor: element.cardBackground || element.backgroundColor || '#ffffff',
                borderRadius: element.cardBorderRadius 
                    ? (typeof element.cardBorderRadius === 'string' && element.cardBorderRadius.includes('px')
                        ? element.cardBorderRadius
                        : `${element.cardBorderRadius}px`)
                    : element.borderRadius 
                        ? (typeof element.borderRadius === 'string' && (element.borderRadius.includes('px') || element.borderRadius.includes('%'))
                            ? element.borderRadius
                            : `${element.borderRadius}px`)
                        : '8px',
                border: borderValue,
                boxShadow: element.cardShadow || '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            };

            const cardContent = (
                <div style={cardStyles}>
                    {element.blocks && element.blocks.length > 0 ? (
                        element.blocks.map((childElement, childIndex) => 
                            renderElement(childElement, childIndex)
                        )
                    ) : (
                        <div>
                            {element.value && (
                                <h3
                                    className={`${fontSize} ${fontWeight} ${lineHeight} ${letterSpacing}`.trim()}
                                    style={{ color, textAlign, marginBottom: element.description ? '0.5rem' : '0' }}
                                >
                                    {element.value}
                                </h3>
                            )}
                            {element.description && (
                                <p
                                    className="text-sm"
                                    style={{ color: color || '#6b7280', textAlign, whiteSpace: 'pre-wrap' }}
                                >
                                    {element.description}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            );

            if (element.href) {
                return (
                    <a
                        key={index}
                        href={normalizeUrl(element.href)}
                        target={element.target || '_self'}
                        rel={element.target === '_blank' ? 'noopener noreferrer' : undefined}
                        className="block"
                        style={{ textDecoration: 'none' }}
                    >
                        {cardContent}
                    </a>
                );
            }

            return <div key={index}>{cardContent}</div>;
        }

        if (element.type === 'list') {
            const listStyleType = element.listStyle || 'disc';
            const listItems = element.items || (element.value ? element.value.split('\n').filter(item => item.trim()) : []);
            const iconColorValue = element.iconColor || color;
            const iconSizeValue = element.iconSize || '1rem';
            const itemSpacingValue = element.itemSpacing || '0';

            const baseStyles = getElementStyles();
            const listStyles: React.CSSProperties = {
                ...baseStyles,
                listStyleType: listStyleType === 'none' ? 'none' : listStyleType,
            };
            
            // Only set paddingLeft default if user hasn't explicitly set it
            // Check if paddingLeft was explicitly set by user (not from default 0)
            const hasPaddingLeftSet = element.paddingLeft !== undefined;
            
            if (listStyleType !== 'none' && !hasPaddingLeftSet) {
                // For lists with bullets/numbers, add default paddingLeft only if not set by user
                listStyles.paddingLeft = '1.5rem';
            } else if (listStyleType === 'none' && !hasPaddingLeftSet) {
                // For lists without bullets, ensure paddingLeft is 0 if not set by user
                listStyles.paddingLeft = '0';
            }
            // If user set paddingLeft, baseStyles already contains it, so we don't override

            const itemStyles: React.CSSProperties = {
                marginBottom: itemSpacingValue,
                color: iconColorValue,
            };

            const ListTag = listStyleType === 'decimal' ? 'ol' : 'ul';

            return (
                <ListTag
                    key={index}
                    className={`${fontSize} ${fontWeight} ${lineHeight} ${letterSpacing}`.trim()}
                    style={listStyles}
                >
                    {listItems.map((item, itemIndex) => (
                        <li
                            key={itemIndex}
                            style={{
                                ...itemStyles,
                                fontSize: iconSizeValue,
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ListTag>
            );
        }

        // Gallery Element
        if (element.type === 'gallery') {
            const images = element.images || [];
            const galleryColumns = element.galleryColumns || 3;
            const galleryColumnsTablet = element.galleryColumnsTablet || galleryColumns || 2;
            const galleryColumnsMobile = element.galleryColumnsMobile || 1;
            const galleryGap = element.galleryGap || '16';
            const imageHeight = element.imageHeight || '200';
            const showCaptions = element.showCaptions !== false; // Default true
            const captionFontSize = element.captionFontSize || 'text-sm';
            const captionColor = element.captionColor || '#6b7280';
            const captionAlign = element.captionAlign || 'center';

            if (images.length === 0) {
                return null;
            }

            const galleryId = `gallery-${index}-${Date.now()}`;

            return (
                <>
                    <style key={`style-${index}`}>{`
                        .${galleryId} {
                            display: grid;
                            grid-template-columns: repeat(${galleryColumnsMobile}, 1fr);
                            gap: ${galleryGap}px;
                        }
                        @media (min-width: 768px) {
                            .${galleryId} {
                                grid-template-columns: repeat(${galleryColumnsTablet}, 1fr);
                            }
                        }
                        @media (min-width: 1024px) {
                            .${galleryId} {
                                grid-template-columns: repeat(${galleryColumns}, 1fr);
                            }
                        }
                    `}</style>
                    <div
                        key={index}
                        className={galleryId}
                        style={getElementStyles()}
                    >
                        {images.map((img, imgIndex) => (
                            <div 
                                key={imgIndex} 
                                className="relative cursor-pointer group overflow-hidden rounded"
                                onClick={() => openLightbox(img)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Gallery image ${imgIndex + 1}`}
                                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    style={{
                                        height: `${imageHeight}px`,
                                    }}
                                />
                                {showCaptions && img.caption && (
                                    <p
                                        className={`mt-2 ${captionFontSize}`}
                                        style={{
                                            color: captionColor,
                                            textAlign: captionAlign as any,
                                        }}
                                    >
                                        {img.caption}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            );
        }

        // Carousel Element
        if (element.type === 'carousel') {
            const images = element.images || [];
            
            if (images.length === 0) {
                return null;
            }

            return (
                <Carousel
                    key={index}
                    images={images}
                    autoplay={element.carouselAutoplay !== false}
                    interval={element.carouselInterval || 5000}
                    showDots={element.carouselShowDots !== false}
                    showArrows={element.carouselShowArrows !== false}
                    height={element.carouselHeight ? `${element.carouselHeight}px` : '400px'}
                    transition={element.carouselTransition || 'slide'}
                    marginTop={element.marginTop || '0px'}
                    marginBottom={element.marginBottom || '0px'}
                    marginLeft={element.marginLeft || '0px'}
                    marginRight={element.marginRight || '0px'}
                    paddingTop={element.paddingTop || '0px'}
                    paddingBottom={element.paddingBottom || '0px'}
                    paddingLeft={element.paddingLeft || '0px'}
                    paddingRight={element.paddingRight || '0px'}
                />
            );
        }

        if (element.type === 'accordion') {
            if (!element.accordionItems || element.accordionItems.length === 0) {
                return null;
            }
            
            return (
                <Accordion
                    key={index}
                    items={element.accordionItems}
                    style={element.accordionStyle || 'default'}
                    iconPosition={element.accordionIconPosition || 'right'}
                    openMultiple={element.accordionOpenMultiple === true}
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
        }

        if (element.type === 'tabs') {
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
        }

        if (element.type === 'button') {
            const buttonBorderRadius = element.buttonBorderRadius && element.buttonBorderRadius.trim()
                ? (element.buttonBorderRadius.includes('%') || element.buttonBorderRadius.includes('px') || element.buttonBorderRadius.includes('rem') || element.buttonBorderRadius.includes('em')
                    ? element.buttonBorderRadius 
                    : `${element.buttonBorderRadius}px`)
                : '6px';
            
            // Get element styles but exclude color and textAlign for button
            const buttonElementStyles = () => {
                const styles: React.CSSProperties = {};
                
                // Only apply margin (padding already handled separately for button)
                if (element.marginTop) {
                    styles.marginTop = typeof element.marginTop === 'number' || !element.marginTop.toString().match(/[a-z%]/)
                        ? `${element.marginTop}px`
                        : element.marginTop;
                }
                if (element.marginBottom) {
                    styles.marginBottom = typeof element.marginBottom === 'number' || !element.marginBottom.toString().match(/[a-z%]/)
                        ? `${element.marginBottom}px`
                        : element.marginBottom;
                }
                if (element.marginLeft) {
                    styles.marginLeft = typeof element.marginLeft === 'number' || !element.marginLeft.toString().match(/[a-z%]/)
                        ? `${element.marginLeft}px`
                        : element.marginLeft;
                }
                if (element.marginRight) {
                    styles.marginRight = typeof element.marginRight === 'number' || !element.marginRight.toString().match(/[a-z%]/)
                        ? `${element.marginRight}px`
                        : element.marginRight;
                }
                
                return styles;
            };
            
            const buttonContent = (
                <button
                    className={`${element.buttonFontSize || 'text-base'} font-medium transition-all hover:opacity-90`}
                    style={{
                        backgroundColor: element.buttonBgColor || '#3b82f6',
                        color: element.buttonTextColor || '#ffffff',
                        borderRadius: buttonBorderRadius,
                        border: 'none',
                        cursor: 'pointer',
                        padding: `${element.paddingTop || '12'}px ${element.paddingRight || '24'}px ${element.paddingBottom || '12'}px ${element.paddingLeft || '24'}px`,
                        display: 'inline-block',
                    }}
                >
                    {element.buttonText || element.value || 'Button'}
                </button>
            );

            const buttonWrapper = (
                <div key={index} style={{ ...buttonElementStyles(), textAlign: element.align || 'left' }}>
                    {buttonContent}
                </div>
            );

            if (element.buttonHref && element.buttonHref.trim() !== '') {
                const finalHref = normalizeUrl(element.buttonHref);
                
                return (
                    <div key={index} style={{ ...buttonElementStyles(), textAlign: element.align || 'left' }}>
                        <a
                            href={finalHref}
                            target={element.buttonTarget || '_self'}
                            rel={element.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                        >
                            {buttonContent}
                        </a>
                    </div>
                );
            }

            return buttonWrapper;
        }

        return null;
    };

    const renderColumn = (column: Column, isCard: boolean) => {
        // Use column's card property if available, otherwise fallback to section's isCard
        const shouldBeCard = column.card !== undefined ? column.card : isCard;
        
        // Get responsive column widths
        const desktopWidth = column.width || 12;
        const tabletWidth = column.widthTablet || desktopWidth;
        const mobileWidth = column.widthMobile || 12;
        
        // Build responsive grid column classes
        const getResponsiveClass = () => {
            const classes = [];
            
            // Mobile first (default)
            classes.push(`col-span-${mobileWidth}`);
            
            // Tablet (md: breakpoint)
            if (tabletWidth !== mobileWidth) {
                classes.push(`md:col-span-${tabletWidth}`);
            }
            
            // Desktop (lg: breakpoint)
            if (desktopWidth !== tabletWidth) {
                classes.push(`lg:col-span-${desktopWidth}`);
            }
            
            return classes.join(' ');
        };

        // Build margin and padding styles
        const getSpacingStyles = () => {
            const styles: React.CSSProperties = {};
            
            // Margin
            if (column.marginTop) styles.marginTop = `${column.marginTop}px`;
            if (column.marginRight) styles.marginRight = `${column.marginRight}px`;
            if (column.marginBottom) styles.marginBottom = `${column.marginBottom}px`;
            if (column.marginLeft) styles.marginLeft = `${column.marginLeft}px`;
            
            // Padding
            if (column.paddingTop) styles.paddingTop = `${column.paddingTop}px`;
            if (column.paddingRight) styles.paddingRight = `${column.paddingRight}px`;
            if (column.paddingBottom) styles.paddingBottom = `${column.paddingBottom}px`;
            if (column.paddingLeft) styles.paddingLeft = `${column.paddingLeft}px`;
            
            return styles;
        };

        const elements = column.elements || [];
        const hasNestedColumns = !!(column.columns && column.columns.length > 0);
        const baseNestedColumnsIndex = typeof column.nestedColumnsIndex === 'number'
            ? Math.min(Math.max(column.nestedColumnsIndex, 0), elements.length)
            : elements.length;
        const nestedColumnsIndex = hasNestedColumns ? baseNestedColumnsIndex : elements.length;
        const elementsBefore = elements.slice(0, nestedColumnsIndex);
        const elementsAfter = elements.slice(nestedColumnsIndex);
        
        return (
            <div
                key={column.id}
                className={`${getResponsiveClass()} ${shouldBeCard 
                    ? 'bg-white rounded-lg shadow-sm border border-gray-200' 
                    : ''
                }`}
                style={getSpacingStyles()}
            >
                {/* Render direct elements */}
                {elementsBefore.length > 0 && (
                    <div className="space-y-2">
                        {elementsBefore.map((element, index) => renderElement(element, index))}
                    </div>
                )}
                
                {/* Render nested columns if they exist */}
                {column.columns && column.columns.length > 0 && (
                    <div className="grid grid-cols-12 gap-4 mt-4">
                        {column.columns.map((nestedCol) => (
                            <div
                                key={nestedCol.id}
                                style={{ gridColumn: `span ${nestedCol.width}` }}
                            >
                                {nestedCol.elements && nestedCol.elements.length > 0 && (
                                    <div className="space-y-2">
                                        {nestedCol.elements.map((element, index) => renderElement(element, index))}
                                    </div>
                                )}
                                {!nestedCol.elements || nestedCol.elements.length === 0 && (
                                    <div className="text-gray-400 text-sm">Empty nested column</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Render elements after nested columns */}
                {elementsAfter.length > 0 && (
                    <div className="space-y-2 mt-4">
                        {elementsAfter.map((element, index) => renderElement(element, nestedColumnsIndex + index))}
                    </div>
                )}
                
                {/* Show empty message if no content at all */}
                {elementsBefore.length === 0 &&
                 elementsAfter.length === 0 && 
                 (!column.columns || column.columns.length === 0) && (
                    <div className="text-gray-400 text-sm">Empty column</div>
                )}
            </div>
        );
    };

    // Use sections if available, otherwise fall back to rows
    const dataToRender = content.sections || content.rows || [];

    const getBackgroundStyle = (config?: BackgroundConfig) => {
        if (!config) return {};
        
        if (config.type === 'gradient' && config.gradient) {
            return {
                background: `linear-gradient(${config.gradient.angle}deg, ${config.gradient.color1}, ${config.gradient.color2})`
            };
        }
        
        return {
            backgroundColor: config.color || '#ffffff'
        };
    };

    const getContainerPadding = (config?: ContainerConfig) => {
        if (!config) return { paddingTop: '48px', paddingBottom: '48px' };
        
        // Individual padding takes priority
        const paddingTop = config.paddingTop || config.verticalPadding || '32';
        const paddingBottom = config.paddingBottom || config.verticalPadding || '32';
        const paddingLeft = config.paddingLeft || config.horizontalPadding || '16';
        const paddingRight = config.paddingRight || config.horizontalPadding || '16';
        
        return {
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
            paddingLeft: `${paddingLeft}px`,
            paddingRight: `${paddingRight}px`,
        };
    };

    return (
        <>
            <div className="space-y-0">
                {dataToRender.map((item) => {
                    const section = item as Section;
                    const backgroundStyle = getBackgroundStyle(section.background_config);
                    const paddingStyle = getContainerPadding(section.container_config);
                    const maxWidthClass = section.container_config?.maxWidth || 'max-w-7xl';
                    
                    return (
                        <div 
                            key={item.id} 
                            style={backgroundStyle}
                        >
                            <div 
                                className={`mx-auto ${maxWidthClass}`}
                                style={paddingStyle}
                            >
                                <div className="grid grid-cols-12 gap-4">
                                    {item.columns.map((column) => renderColumn(column, false))}
                                </div>
                            </div>
                        </div>
                    );
                })}
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
        </>
    );
}
