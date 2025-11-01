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

    const renderElement = (element: ColumnElement, index: number) => {
        const textAlign = element.align || 'left';
        const color = element.color || '#000000';
        const fontSize = element.fontSize || 'text-base';

        if (element.type === 'heading') {
            return (
                <h2
                    key={index}
                    className={`font-bold ${fontSize}`}
                    style={{ 
                        textAlign, 
                        color,
                        marginBottom: '1rem'
                    }}
                >
                    {element.value}
                </h2>
            );
        }

        if (element.type === 'text') {
            return (
                <p
                    key={index}
                    className={fontSize}
                    style={{ 
                        textAlign, 
                        color,
                        marginBottom: '1rem',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {element.value}
                </p>
            );
        }

        if (element.type === 'image' && element.value) {
            return (
                <div
                    key={index}
                    style={{ textAlign, marginBottom: '1rem' }}
                >
                    <img
                        src={element.value}
                        alt="Page content"
                        className="max-w-full h-auto rounded"
                    />
                </div>
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
