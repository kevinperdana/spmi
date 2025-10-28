interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
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
    card: boolean;
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
    content: HomeSectionContent;
    order: number;
    is_active: boolean;
}

interface DynamicHomeSectionProps {
    section: HomeSection;
}

export function DynamicHomeSection({ section }: DynamicHomeSectionProps) {
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
                return (
                    <div 
                        key={index} 
                        className={`rounded-lg overflow-hidden ${alignmentClass}`}
                        style={spacingStyle}
                    >
                        <img 
                            src={element.value} 
                            alt="Content image"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderNestedColumn = (nestedCol: NestedColumn, index: number) => {
        // Nested columns are always plain (no card styling)
        return (
            <div key={index}>
                {nestedCol.elements && nestedCol.elements.map((element, elemIndex) => 
                    renderElement(element, elemIndex)
                )}
            </div>
        );
    };

    const renderColumn = (column: Column, colIndex: number) => {
        // Render direct elements if exist
        const directElements = column.elements && column.elements.length > 0 ? (
            <div>
                {column.elements.map((element, elemIndex) => 
                    renderElement(element, elemIndex)
                )}
            </div>
        ) : null;

        // Render nested columns if exist
        const nestedColumnsContent = column.columns && column.columns.length > 0 ? (
            <div className="grid grid-cols-12">
                {column.columns.map((nestedCol, nestedIndex) => (
                    <div key={nestedCol.id || nestedIndex} className={getColumnWidthClass(nestedCol.width)}>
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
            '12-12-3': 'col-span-12 md:col-span-12 lg:col-span-3',
            '12-6-6': 'col-span-12 md:col-span-6 lg:col-span-6',
            '12-6-4': 'col-span-12 md:col-span-6 lg:col-span-4',
            '12-6-3': 'col-span-12 md:col-span-6 lg:col-span-3',
            '12-6-12': 'col-span-12 md:col-span-6 lg:col-span-12',
            '12-4-4': 'col-span-12 md:col-span-4 lg:col-span-4',
            '12-4-6': 'col-span-12 md:col-span-4 lg:col-span-6',
            '12-4-3': 'col-span-12 md:col-span-4 lg:col-span-3',
            '12-3-3': 'col-span-12 md:col-span-3 lg:col-span-3',
            '12-3-4': 'col-span-12 md:col-span-3 lg:col-span-4',
            '12-3-6': 'col-span-12 md:col-span-3 lg:col-span-6',
            '6-6-6': 'col-span-6 md:col-span-6 lg:col-span-6',
            '6-6-12': 'col-span-6 md:col-span-6 lg:col-span-12',
            '6-12-6': 'col-span-6 md:col-span-12 lg:col-span-6',
            '6-12-12': 'col-span-6 md:col-span-12 lg:col-span-12',
            '4-4-4': 'col-span-4 md:col-span-4 lg:col-span-4',
            '4-6-6': 'col-span-4 md:col-span-6 lg:col-span-6',
            '4-12-12': 'col-span-4 md:col-span-12 lg:col-span-12',
            '3-3-3': 'col-span-3 md:col-span-3 lg:col-span-3',
            '3-6-6': 'col-span-3 md:col-span-6 lg:col-span-6',
            '3-12-12': 'col-span-3 md:col-span-12 lg:col-span-12',
            // Additional common combinations
            '1-1-1': 'col-span-1 md:col-span-1 lg:col-span-1',
            '2-2-2': 'col-span-2 md:col-span-2 lg:col-span-2',
            '5-5-5': 'col-span-5 md:col-span-5 lg:col-span-5',
            '7-7-7': 'col-span-7 md:col-span-7 lg:col-span-7',
            '8-8-8': 'col-span-8 md:col-span-8 lg:col-span-8',
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

    return (
        <div style={getBackgroundStyle()}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
    );
}
