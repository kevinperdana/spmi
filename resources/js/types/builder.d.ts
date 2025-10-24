export type ComponentType = 'text' | 'heading' | 'image' | 'button' | 'video' | 'form' | 'spacer';

export interface ComponentStyle {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  borderRadius?: string;
  width?: string;
  height?: string;
  [key: string]: string | undefined;
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  content: string | Record<string, any>;
  style?: ComponentStyle;
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  content: string;
}

export interface HeadingComponent extends BaseComponent {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageComponent extends BaseComponent {
  type: 'image';
  content: {
    src: string;
    alt: string;
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  content: {
    text: string;
    link: string;
    target?: '_blank' | '_self';
  };
}

export interface VideoComponent extends BaseComponent {
  type: 'video';
  content: {
    url: string;
    provider: 'youtube' | 'vimeo' | 'custom';
  };
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormComponent extends BaseComponent {
  type: 'form';
  content: {
    fields: FormField[];
    submitText: string;
    action?: string;
  };
}

export interface SpacerComponent extends BaseComponent {
  type: 'spacer';
  content: {
    height: string;
  };
}

export type Component = 
  | TextComponent 
  | HeadingComponent 
  | ImageComponent 
  | ButtonComponent 
  | VideoComponent 
  | FormComponent 
  | SpacerComponent;

export interface Column {
  id: string;
  width: number; // 1-12 untuk grid system
  components: Component[];
  style?: ComponentStyle;
}

export interface Section {
  id: string;
  columns: Column[];
  style?: ComponentStyle;
}

export interface LandingPage {
  id?: number;
  title: string;
  slug?: string;
  sections: Section[];
  globalStyles?: {
    fontFamily?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuilderState {
  landingPage: LandingPage;
  selectedElement: {
    type: 'section' | 'column' | 'component' | null;
    id: string | null;
  };
  history: LandingPage[];
  currentHistoryIndex: number;
}
