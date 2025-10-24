// Page Builder Types

export type BlockType = 'heading' | 'text' | 'image' | 'link' | 'card' | 'row' | 'spacer' | 'video';

export interface BaseBlock {
    id: string;
    type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    data: {
        text: string;
        level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        color?: string;
        alignment?: 'left' | 'center' | 'right';
    };
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    data: {
        content: string;
        fontSize?: string;
        color?: string;
        alignment?: 'left' | 'center' | 'right' | 'justify';
        lineHeight?: string;
    };
}

export interface ImageBlock extends BaseBlock {
    type: 'image';
    data: {
        src: string;
        alt?: string;
        width?: string;
        height?: string;
        objectFit?: 'cover' | 'contain' | 'fill';
        borderRadius?: string;
        alignment?: 'left' | 'center' | 'right';
    };
}

export interface LinkBlock extends BaseBlock {
    type: 'link';
    data: {
        text: string;
        href: string;
        variant?: 'primary' | 'secondary' | 'outline' | 'text';
        size?: 'sm' | 'md' | 'lg';
        target?: '_self' | '_blank';
        alignment?: 'left' | 'center' | 'right';
    };
}

export interface SpacerBlock extends BaseBlock {
    type: 'spacer';
    data: {
        height: string;
        background?: string;
    };
}

export interface VideoBlock extends BaseBlock {
    type: 'video';
    data: {
        src: string;
        aspectRatio?: '16/9' | '4/3' | '1/1';
        autoplay?: boolean;
        controls?: boolean;
    };
}

export interface CardBlock extends BaseBlock {
    type: 'card';
    data: {
        padding?: string;
        background?: string;
        borderColor?: string;
        borderRadius?: string;
        shadow?: string;
        blocks: Block[];
    };
}

export interface RowBlock extends BaseBlock {
    type: 'row';
    data: {
        gap?: string;
        alignment?: 'start' | 'center' | 'end';
        padding?: string;
        columns: ColumnData[];
    };
}

export interface ColumnData {
    id: string;
    width: number; // 1-12 grid
    blocks: Block[];
}

export type Block = 
    | HeadingBlock 
    | TextBlock 
    | ImageBlock 
    | LinkBlock 
    | SpacerBlock 
    | VideoBlock 
    | CardBlock 
    | RowBlock;

export interface PageContent {
    blocks: Block[];
}
