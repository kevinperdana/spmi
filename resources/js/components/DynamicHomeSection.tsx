interface ColumnElement {
    type: 'heading' | 'text' | 'image';
    value: string;
}

interface Column {
    card: boolean;
    elements: ColumnElement[];
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
    columns: Column[];
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
        switch (element.type) {
            case 'heading':
                return (
                    <h2 key={index} className="text-3xl font-bold text-gray-900 mb-4">
                        {element.value}
                    </h2>
                );
            case 'text':
                return (
                    <p key={index} className="text-gray-600 text-lg leading-relaxed mb-4">
                        {element.value}
                    </p>
                );
            case 'image':
                return (
                    <div key={index} className="mb-4 rounded-lg overflow-hidden">
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

    const renderColumn = (column: Column, index: number) => {
        const columnContent = (
            <div className="space-y-4">
                {column.elements.map((element, elemIndex) => 
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
    };

    const getGridClass = () => {
        const numColumns = section.content.columns.length;
        if (numColumns === 1) return '';
        if (numColumns === 2) return 'grid md:grid-cols-2 gap-6';
        if (numColumns === 3) return 'grid md:grid-cols-3 gap-6';
        if (numColumns === 4) return 'grid md:grid-cols-2 lg:grid-cols-4 gap-6';
        return 'grid gap-6';
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

    return (
        <div style={getBackgroundStyle()}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={getGridClass()}>
                    {section.content.columns.map((column, index) => 
                        renderColumn(column, index)
                    )}
                </div>
            </div>
        </div>
    );
}
