import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Block, PageContent } from '@/types/page-builder';

interface Section {
    id: string;
    width: number;
    blocks: Block[];
}

interface PageBuilderContextType {
    sections: Section[];
    selectedBlockId: string | null;
    selectedSectionId: string | null;
    pageLayout: number[] | null;
    setPageLayout: (columnWidths: number[]) => void;
    addBlock: (sectionId: string, type: Block['type']) => void;
    addBlockToColumn: (rowId: string, columnId: string, type: Block['type']) => void;
    updateBlock: (id: string, data: Partial<Block['data']>) => void;
    removeBlock: (id: string) => void;
    selectBlock: (id: string | null) => void;
    selectSection: (id: string | null) => void;
    moveBlock: (sectionId: string, fromIndex: number, toIndex: number) => void;
    getContent: () => PageContent;
    setContent: (content: PageContent) => void;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function PageBuilderProvider({ children, initialContent, initialBlocks }: { children: ReactNode; initialContent?: PageContent | any; initialBlocks?: Block[] }) {
    // Initialize with single full-width section if no initial data
    const [sections, setSections] = useState<Section[]>(() => {
        // Priority 1: Check if initialContent has sections (new format)
        if (initialContent && (initialContent as any).sections) {
            return (initialContent as any).sections.map((section: any) => ({
                id: section.id || generateId(),
                width: section.width || 12,
                blocks: section.blocks || []
            }));
        }
        // Priority 2: Check if initialContent has blocks (old format)
        if (initialContent && (initialContent as any).blocks) {
            return [{ id: generateId(), width: 12, blocks: (initialContent as any).blocks }];
        }
        // Priority 3: Use initialBlocks prop (legacy)
        if (initialBlocks && initialBlocks.length > 0) {
            return [{ id: generateId(), width: 12, blocks: initialBlocks }];
        }
        // Default: Empty full-width section
        return [{ id: generateId(), width: 12, blocks: [] }];
    });
    const [pageLayout, setPageLayoutState] = useState<number[] | null>(() => {
        // Set initial layout based on sections
        if (initialContent && (initialContent as any).sections) {
            return (initialContent as any).sections.map((s: any) => s.width);
        }
        return [12];
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

    const setPageLayout = (columnWidths: number[]) => {
        const newSections = columnWidths.map(width => ({
            id: generateId(),
            width,
            blocks: []
        }));
        setSections(newSections);
        setPageLayoutState(columnWidths);
        setSelectedSectionId(newSections[0].id);
    };

    const addBlock = (sectionId: string, type: Block['type']) => {
        const newBlock: Block = {
            id: generateId(),
            type,
            data: getDefaultData(type),
        } as Block;

        setSections(sections.map(section => 
            section.id === sectionId
                ? { ...section, blocks: [...section.blocks, newBlock] }
                : section
        ));
        setSelectedBlockId(newBlock.id);
    };

    const addBlockToColumn = (rowId: string, columnId: string, type: Block['type']) => {
        const newBlock: Block = {
            id: generateId(),
            type,
            data: getDefaultData(type),
        } as Block;

        const addToNestedBlock = (block: Block): Block => {
            // Handle adding to Row columns
            if (block.id === rowId && block.type === 'row') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        columns: block.data.columns.map(col => 
                            col.id === columnId 
                                ? { ...col, blocks: [...col.blocks, newBlock] }
                                : col
                        )
                    }
                };
            }
            // Handle adding to Card (columnId is ignored for card, just use cardId as rowId)
            if (block.id === rowId && block.type === 'card') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        blocks: [...(block.data.blocks || []), newBlock]
                    }
                };
            }
            // Recursively check nested blocks
            if (block.type === 'row') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        columns: block.data.columns.map(col => ({
                            ...col,
                            blocks: col.blocks.map(addToNestedBlock)
                        }))
                    }
                };
            }
            if (block.type === 'card') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        blocks: block.data.blocks.map(addToNestedBlock)
                    }
                };
            }
            return block;
        };

        setSections(sections.map(section => ({
            ...section,
            blocks: section.blocks.map(addToNestedBlock)
        })));
        setSelectedBlockId(newBlock.id);
    };

    const getDefaultData = (type: Block['type']): any => {
        switch (type) {
            case 'heading':
                return { text: 'New Heading', level: 'h2', alignment: 'left' };
            case 'text':
                return { content: 'Enter your text here...', fontSize: '16px', lineHeight: '1.6' };
            case 'image':
                return { src: 'https://via.placeholder.com/400x300', alt: 'Image', width: '100%' };
            case 'link':
                return { text: 'Click here', href: '#', variant: 'primary', size: 'md' };
            case 'spacer':
                return { height: '40px' };
            case 'video':
                return { src: '', aspectRatio: '16/9', controls: true };
            case 'card':
                return { padding: '20px', blocks: [] };
            case 'row':
                return { 
                    columns: [
                        { id: generateId(), width: 6, blocks: [] },
                        { id: generateId(), width: 6, blocks: [] }
                    ]
                };
            default:
                return {};
        }
    };

    const updateBlock = (id: string, data: Partial<Block['data']>) => {
        const updateNestedBlock = (block: Block): Block => {
            if (block.id === id) {
                return { ...block, data: { ...block.data, ...data } };
            }
            
            // Handle nested blocks in row
            if (block.type === 'row') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        columns: block.data.columns.map(col => ({
                            ...col,
                            blocks: col.blocks.map(updateNestedBlock)
                        }))
                    }
                };
            }
            
            // Handle nested blocks in card
            if (block.type === 'card') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        blocks: block.data.blocks.map(updateNestedBlock)
                    }
                };
            }
            
            return block;
        };

        setSections(sections.map(section => ({
            ...section,
            blocks: section.blocks.map(updateNestedBlock)
        })));
    };

    const removeBlock = (id: string) => {
        const removeNestedBlock = (block: Block): Block | null => {
            if (block.id === id) {
                return null;
            }
            
            // Handle nested blocks in row
            if (block.type === 'row') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        columns: block.data.columns.map(col => ({
                            ...col,
                            blocks: col.blocks.map(removeNestedBlock).filter((b): b is Block => b !== null)
                        }))
                    }
                };
            }
            
            // Handle nested blocks in card
            if (block.type === 'card') {
                return {
                    ...block,
                    data: {
                        ...block.data,
                        blocks: block.data.blocks.map(removeNestedBlock).filter((b): b is Block => b !== null)
                    }
                };
            }
            
            return block;
        };

        setSections(sections.map(section => ({
            ...section,
            blocks: section.blocks.map(removeNestedBlock).filter((b): b is Block => b !== null)
        })));
        
        if (selectedBlockId === id) {
            setSelectedBlockId(null);
        }
    };

    const selectBlock = (id: string | null) => {
        setSelectedBlockId(id);
    };

    const selectSection = (id: string | null) => {
        setSelectedSectionId(id);
    };

    const moveBlock = (sectionId: string, fromIndex: number, toIndex: number) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                const newBlocks = [...section.blocks];
                const [movedBlock] = newBlocks.splice(fromIndex, 1);
                newBlocks.splice(toIndex, 0, movedBlock);
                return { ...section, blocks: newBlocks };
            }
            return section;
        }));
    };

    const getContent = (): PageContent => {
        // Return new section-based format
        return { 
            sections: sections.map(section => ({
                id: section.id,
                width: section.width,
                blocks: section.blocks
            }))
        } as any;
    };

    const setContent = (content: PageContent) => {
        // Convert old format to new format
        setSections([{ id: generateId(), width: 12, blocks: content.blocks || [] }]);
        setPageLayoutState([12]);
        setSelectedBlockId(null);
    };

    return (
        <PageBuilderContext.Provider
            value={{
                sections,
                selectedBlockId,
                selectedSectionId,
                pageLayout,
                setPageLayout,
                addBlock,
                addBlockToColumn,
                updateBlock,
                removeBlock,
                selectBlock,
                selectSection,
                moveBlock,
                getContent,
                setContent,
            }}
        >
            {children}
        </PageBuilderContext.Provider>
    );
}

export function usePageBuilder() {
    const context = useContext(PageBuilderContext);
    if (!context) {
        throw new Error('usePageBuilder must be used within PageBuilderProvider');
    }
    return context;
}
