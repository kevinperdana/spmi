import { Type, Heading, Image, MousePointer, Video, Mail, Space } from 'lucide-react';
import { Button } from '../ui/button';
import type { Component, ComponentType } from '../../types/builder';

interface ComponentPaletteProps {
  onAddComponent: (component: Omit<Component, 'id'>) => void;
}

const componentTemplates: Array<{
  type: ComponentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  template: Omit<Component, 'id'>;
}> = [
  {
    type: 'text',
    label: 'Text',
    icon: Type,
    template: {
      type: 'text',
      content: 'Edit text di sini...',
      style: { padding: '10px' },
    },
  },
  {
    type: 'heading',
    label: 'Heading',
    icon: Heading,
    template: {
      type: 'heading',
      content: 'Heading',
      level: 2,
      style: { padding: '10px' },
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    template: {
      type: 'image',
      content: {
        src: 'https://via.placeholder.com/600x400',
        alt: 'Placeholder image',
      },
      style: { padding: '10px' },
    },
  },
  {
    type: 'button',
    label: 'Button',
    icon: MousePointer,
    template: {
      type: 'button',
      content: {
        text: 'Click Me',
        link: '#',
        target: '_self',
      },
      style: { padding: '10px' },
    },
  },
  {
    type: 'video',
    label: 'Video',
    icon: Video,
    template: {
      type: 'video',
      content: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube',
      },
      style: { padding: '10px' },
    },
  },
  {
    type: 'form',
    label: 'Form',
    icon: Mail,
    template: {
      type: 'form',
      content: {
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Name',
            placeholder: 'Your name',
            required: true,
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'your@email.com',
            required: true,
          },
        ],
        submitText: 'Submit',
      },
      style: { padding: '10px' },
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: Space,
    template: {
      type: 'spacer',
      content: {
        height: '50px',
      },
      style: {},
    },
  },
];

export const ComponentPalette = ({ onAddComponent }: ComponentPaletteProps) => {
  return (
    <div className="p-4 bg-white border-b">
      <h3 className="text-sm font-semibold mb-3">Components</h3>
      <div className="grid grid-cols-2 gap-2">
        {componentTemplates.map((item) => (
          <Button
            key={item.type}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => onAddComponent(item.template)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
