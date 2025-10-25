// Page Builder Types

export type BlockType = 'heading' | 'text' | 'list' | 'image' | 'link' | 'card' | 'row' | 'spacer' | 'video' | 'table' | 'gallery' | 'accordion' | 'carousel' | 'tabs';

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

export interface ListBlock extends BaseBlock {
    type: 'list';
    data: {
        items: string[];
        listType?: 'bullet' | 'numbered';
        color?: string;
        fontSize?: string;
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

export interface GalleryBlock extends BaseBlock {
    type: 'gallery';
    data: {
        images: Array<{
            src: string;
            alt?: string;
            caption?: string;
        }>;
        style?: 'single' | 'grid-2' | 'grid-3';
        gap?: string;
    };
}

export interface AccordionBlock extends BaseBlock {
    type: 'accordion';
    data: {
        items: Array<{
            title: string;
            content: string;
        }>;
        allowMultiple?: boolean;
        defaultOpen?: number; // index of default open item
    };
}

export interface CarouselBlock extends BaseBlock {
    type: 'carousel';
    data: {
        slides: Array<{
            image: string;
            title?: string;
            description?: string;
        }>;
        autoplay?: boolean;
        interval?: number; // milliseconds
        showIndicators?: boolean;
        showArrows?: boolean;
    };
}

export interface TabsBlock extends BaseBlock {
    type: 'tabs';
    data: {
        tabs: Array<{
            label: string;
            content: string;
        }>;
        defaultTab?: number; // index of default active tab
        tabStyle?: 'underline' | 'pills' | 'boxed';
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
    | ListBlock 
    | ImageBlock 
    | LinkBlock 
    | SpacerBlock 
    | VideoBlock 
    | CardBlock 
    | RowBlock
    | GalleryBlock
    | AccordionBlock
    | CarouselBlock
    | TabsBlock;

export interface PageContent {
    blocks: Block[];
}
