import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Block, PageContent } from '@/types/page-builder';

interface PageBuilderContextType {
    blocks: Block[];
    selectedBlockId: string | null;
    addBlock: (type: Block['type']) => void;
    addBlockToColumn: (rowId: string, columnId: string, type: Block['type']) => void;
    updateBlock: (id: string, data: Partial<Block['data']>) => void;
    removeBlock: (id: string) => void;
    selectBlock: (id: string | null) => void;
    moveBlock: (fromIndex: number, toIndex: number) => void;
    getContent: () => PageContent;
    setContent: (content: PageContent) => void;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

export function PageBuilderProvider({ children, initialContent, initialBlocks }: { children: ReactNode; initialContent?: PageContent; initialBlocks?: Block[] }) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks || initialContent?.blocks || []);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: generateId(),
            type,
            data: getDefaultData(type),
        } as Block;

        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const addBlockToColumn = (rowId: string, columnId: string, type: Block['type']) => {
        const newBlock: Block = {
            id: generateId(),
            type,
            data: getDefaultData(type),
        } as Block;

        setBlocks(blocks.map(block => {
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
            return block;
        }));
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

        setBlocks(blocks.map(updateNestedBlock));
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

        setBlocks(blocks.map(removeNestedBlock).filter((b): b is Block => b !== null));
        if (selectedBlockId === id) {
            setSelectedBlockId(null);
        }
    };

    const selectBlock = (id: string | null) => {
        setSelectedBlockId(id);
    };

    const moveBlock = (fromIndex: number, toIndex: number) => {
        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, movedBlock);
        setBlocks(newBlocks);
    };

    const getContent = (): PageContent => {
        return { blocks };
    };

    const setContent = (content: PageContent) => {
        setBlocks(content.blocks || []);
        setSelectedBlockId(null);
    };

    return (
        <PageBuilderContext.Provider
            value={{
                blocks,
                selectedBlockId,
                addBlock,
                addBlockToColumn,
                updateBlock,
                removeBlock,
                selectBlock,
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
