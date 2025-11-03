interface ColumnElement {
    type: 'heading' | 'text' | 'image' | 'card' | 'list';
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
    // List properties
    listStyle?: 'disc' | 'decimal' | 'none';
    items?: string[];
    iconColor?: string;
    iconSize?: string;
    itemSpacing?: string;
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

export function PageContentRenderer({ content }: Props) {
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
            
            // Handle margin with unit support
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
            if (element.paddingTop) styles.paddingTop = `${element.paddingTop}px`;
            if (element.paddingBottom) styles.paddingBottom = `${element.paddingBottom}px`;
            if (element.paddingLeft) styles.paddingLeft = `${element.paddingLeft}px`;
            if (element.paddingRight) styles.paddingRight = `${element.paddingRight}px`;
            
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

        if (element.type === 'card') {
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
                border: element.cardBorder || '1px solid #e5e7eb',
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
            const itemSpacingValue = element.itemSpacing || '0.5rem';

            const listStyles: React.CSSProperties = {
                ...getElementStyles(),
                listStyleType: listStyleType === 'none' ? 'none' : listStyleType,
                paddingLeft: listStyleType === 'none' ? '0' : '1.5rem',
            };

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
                {column.elements && column.elements.length > 0 && (
                    <div className="space-y-2">
                        {column.elements.map((element, index) => renderElement(element, index))}
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
                
                {/* Show empty message if no content at all */}
                {(!column.elements || column.elements.length === 0) && 
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
    );
}
