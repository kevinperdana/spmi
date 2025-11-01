import React, { useState } from 'react';

interface TabItem {
    title: string;
    content: string;
}

interface TabsProps {
    items: TabItem[];
    style?: 'default' | 'pills' | 'underline';
    position?: 'top' | 'left';
    borderColor?: string;
    activeColor?: string;
    inactiveColor?: string;
    activeBg?: string;
    inactiveBg?: string;
    contentBg?: string;
    contentTextColor?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    items,
    style = 'default',
    position = 'top',
    borderColor = '#e5e7eb',
    activeColor = '#3b82f6',
    inactiveColor = '#6b7280',
    activeBg = '#eff6ff',
    inactiveBg = 'transparent',
    contentBg = '#ffffff',
    contentTextColor = '#374151',
    marginTop = '0px',
    marginBottom = '0px',
    marginLeft = '0px',
    marginRight = '0px',
    paddingTop = '0px',
    paddingBottom = '0px',
    paddingLeft = '0px',
    paddingRight = '0px',
}) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!items || items.length === 0) {
        return null;
    }

    const getTabButtonClass = (isActive: boolean) => {
        const baseClass = 'px-4 py-2 font-medium transition-colors duration-200';
        
        switch (style) {
            case 'pills':
                return `${baseClass} rounded-full ${
                    isActive ? 'shadow-sm' : ''
                }`;
            case 'underline':
                return `${baseClass} border-b-2 ${
                    isActive ? '' : 'border-transparent'
                }`;
            default:
                return `${baseClass} ${
                    isActive ? 'border border-b-0 rounded-t-lg' : 'border-b'
                }`;
        }
    };

    const getContainerClass = () => {
        if (position === 'left') {
            return 'flex gap-4';
        }
        return 'w-full';
    };

    const getTabListClass = () => {
        if (position === 'left') {
            return 'flex flex-col gap-1 min-w-[200px]';
        }
        return 'flex gap-0 border-b';
    };

    return (
        <div 
            className={`tabs-container ${getContainerClass()}`}
            style={{
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
            <div 
                className={getTabListClass()}
                style={{ borderColor: style !== 'pills' ? borderColor : 'transparent' }}
            >
                {items.map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setActiveTab(index)}
                        className={getTabButtonClass(activeTab === index)}
                        style={{
                            color: activeTab === index ? activeColor : inactiveColor,
                            backgroundColor: activeTab === index ? activeBg : inactiveBg,
                            borderColor: style === 'underline' && activeTab === index ? activeColor : borderColor,
                        }}
                    >
                        {item.title}
                    </button>
                ))}
            </div>
            
            <div 
                className={`tab-content flex-1 p-4 ${style === 'default' ? 'border border-t-0 rounded-b-lg' : style === 'pills' ? 'border rounded-lg' : ''}`}
                style={{
                    backgroundColor: contentBg,
                    color: contentTextColor,
                    borderColor: style !== 'underline' ? borderColor : 'transparent',
                }}
            >
                {items[activeTab]?.content}
            </div>
        </div>
    );
};
