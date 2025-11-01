import React, { useState } from 'react';

interface AccordionItem {
    title: string;
    content: string;
}

interface AccordionProps {
    items: AccordionItem[];
    style?: 'default' | 'bordered' | 'separated';
    iconPosition?: 'left' | 'right';
    openMultiple?: boolean;
    borderColor?: string;
    headerBg?: string;
    headerTextColor?: string;
    contentBg?: string;
    contentTextColor?: string;
    borderRadius?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    items,
    style = 'default',
    iconPosition = 'right',
    openMultiple = false,
    borderColor = '#e5e7eb',
    headerBg = '#f9fafb',
    headerTextColor = '#111827',
    contentBg = '#ffffff',
    contentTextColor = '#374151',
    borderRadius = '8px',
    marginTop = '0px',
    marginBottom = '0px',
    marginLeft = '0px',
    marginRight = '0px',
    paddingTop = '0px',
    paddingBottom = '0px',
    paddingLeft = '0px',
    paddingRight = '0px',
}) => {
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    const toggleItem = (index: number) => {
        if (openMultiple) {
            if (openIndexes.includes(index)) {
                setOpenIndexes(openIndexes.filter(i => i !== index));
            } else {
                setOpenIndexes([...openIndexes, index]);
            }
        } else {
            if (openIndexes.includes(index)) {
                setOpenIndexes([]);
            } else {
                setOpenIndexes([index]);
            }
        }
    };

    const isOpen = (index: number) => openIndexes.includes(index);

    if (!items || items.length === 0) {
        return null;
    }

    const getAccordionStyles = () => {
        switch (style) {
            case 'bordered':
                return {
                    container: 'border rounded-lg overflow-hidden',
                    item: 'border-b last:border-b-0',
                    spacing: ''
                };
            case 'separated':
                return {
                    container: 'space-y-3',
                    item: 'border rounded-lg overflow-hidden',
                    spacing: ''
                };
            default:
                return {
                    container: 'border rounded-lg overflow-hidden',
                    item: 'border-b last:border-b-0',
                    spacing: ''
                };
        }
    };

    const styles = getAccordionStyles();

    return (
        <div 
            className={`accordion-container ${styles.container}`}
            style={{
                borderColor,
                borderRadius: style === 'separated' ? '0' : borderRadius,
                marginTop,
                marginBottom,
                marginLeft,
                marginRight,
                paddingTop,
                paddingBottom,
                paddingLeft,
                paddingRight,
            }}
        >
            {items.map((item, index) => (
                <div 
                    key={index} 
                    className={`accordion-item ${styles.item}`}
                    style={{
                        borderColor,
                        borderRadius: style === 'separated' ? borderRadius : '0',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => toggleItem(index)}
                        className={`accordion-header w-full px-4 py-3 flex items-center justify-between text-left transition-colors duration-200 hover:opacity-80 ${
                            iconPosition === 'left' ? 'flex-row-reverse' : ''
                        }`}
                        style={{
                            backgroundColor: headerBg,
                            color: headerTextColor,
                        }}
                    >
                        <span className="font-medium flex-1">{item.title}</span>
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${
                                isOpen(index) ? 'rotate-180' : ''
                            } ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    <div
                        className={`accordion-content overflow-hidden transition-all duration-300 ${
                            isOpen(index) ? 'max-h-[1000px]' : 'max-h-0'
                        }`}
                    >
                        <div 
                            className="px-4 py-3"
                            style={{
                                backgroundColor: contentBg,
                                color: contentTextColor,
                            }}
                        >
                            {item.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
