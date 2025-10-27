interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
    color?: string;
    fontSize?: string;
    align?: 'left' | 'center' | 'right';
}

interface Column {
    id: string;
    width: number;
    card: boolean;
    elements: ColumnElement[];
    columns?: Column[]; // Optional nested columns
}

interface Row {
    id: string;
    columns: Column[];
}

interface Section {
    id: string;
    layout_type: string;
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
        
        return (
            <div
                key={column.id}
                className={shouldBeCard 
                    ? 'bg-white rounded-lg shadow-sm p-6 border border-gray-200' 
                    : 'p-6'
                }
                style={{ gridColumn: `span ${column.width}` }}
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

    return (
        <div className="space-y-6">
            {dataToRender.map((item) => {
                // For backward compatibility: use section_type if exists, otherwise false
                const sectionIsCard = (item as any).section_type === 'card';
                return (
                    <div key={item.id} className="grid grid-cols-12 gap-4">
                        {item.columns.map((column) => renderColumn(column, sectionIsCard))}
                    </div>
                );
            })}
        </div>
    );
}
