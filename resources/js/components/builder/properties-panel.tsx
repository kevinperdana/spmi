import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import type { Component, Section, Column } from '../../types/builder';

interface PropertiesPanelProps {
  selectedElement: {
    type: 'section' | 'column' | 'component' | null;
    id: string | null;
  };
  landingPage: any;
  onUpdateComponent?: (sectionId: string, columnId: string, componentId: string, updates: Partial<Component>) => void;
  onUpdateSectionStyle?: (sectionId: string, style: any) => void;
  onUpdateColumnStyle?: (sectionId: string, columnId: string, style: any) => void;
  onRemoveComponent?: (sectionId: string, columnId: string, componentId: string) => void;
  onDuplicateComponent?: (sectionId: string, columnId: string, componentId: string) => void;
}

export const PropertiesPanel = ({
  selectedElement,
  landingPage,
  onUpdateComponent,
  onUpdateSectionStyle,
  onUpdateColumnStyle,
  onRemoveComponent,
  onDuplicateComponent,
}: PropertiesPanelProps) => {
  const [localValues, setLocalValues] = useState<any>({});

  // Find selected element
  let element: Component | Section | Column | null = null;
  let sectionId = '';
  let columnId = '';

  if (selectedElement.type === 'component') {
    for (const section of landingPage.sections) {
      for (const column of section.columns) {
        const comp = column.components.find((c: Component) => c.id === selectedElement.id);
        if (comp) {
          element = comp;
          sectionId = section.id;
          columnId = column.id;
          break;
        }
      }
      if (element) break;
    }
  } else if (selectedElement.type === 'section') {
    element = landingPage.sections.find((s: Section) => s.id === selectedElement.id);
    sectionId = selectedElement.id!;
  } else if (selectedElement.type === 'column') {
    for (const section of landingPage.sections) {
      const col = section.columns.find((c: Column) => c.id === selectedElement.id);
      if (col) {
        element = col;
        sectionId = section.id;
        columnId = selectedElement.id!;
        break;
      }
    }
  }

  useEffect(() => {
    if (element) {
      setLocalValues(element);
    }
  }, [selectedElement.id]);

  if (!element) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Pilih element untuk edit properties</p>
      </div>
    );
  }

  const handleUpdateStyle = (key: string, value: string) => {
    if (selectedElement.type === 'component' && onUpdateComponent) {
      onUpdateComponent(sectionId, columnId, selectedElement.id!, {
        style: { ...(element as Component).style, [key]: value },
      });
    } else if (selectedElement.type === 'section' && onUpdateSectionStyle) {
      onUpdateSectionStyle(sectionId, { [key]: value });
    } else if (selectedElement.type === 'column' && onUpdateColumnStyle) {
      onUpdateColumnStyle(sectionId, columnId, { [key]: value });
    }
  };

  const handleUpdateContent = (updates: Partial<Component>) => {
    if (selectedElement.type === 'component' && onUpdateComponent) {
      onUpdateComponent(sectionId, columnId, selectedElement.id!, updates);
    }
  };

  const renderComponentEditor = (comp: Component) => {
    switch (comp.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label>Content</Label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={4}
              value={localValues.content || ''}
              onChange={(e) => {
                setLocalValues({ ...localValues, content: e.target.value });
                handleUpdateContent({ content: e.target.value });
              }}
            />
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-3">
            <div>
              <Label>Content</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={localValues.content || ''}
                onChange={(e) => {
                  setLocalValues({ ...localValues, content: e.target.value });
                  handleUpdateContent({ content: e.target.value });
                }}
              />
            </div>
            <div>
              <Label>Level</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={localValues.level || 2}
                onChange={(e) => {
                  const level = parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6;
                  setLocalValues({ ...localValues, level });
                  handleUpdateContent({ level });
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <option key={l} value={l}>
                    H{l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <Label>Image URL</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={localValues.content?.src || ''}
                onChange={(e) => {
                  const content = { ...localValues.content, src: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={localValues.content?.alt || ''}
                onChange={(e) => {
                  const content = { ...localValues.content, alt: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-3">
            <div>
              <Label>Button Text</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={localValues.content?.text || ''}
                onChange={(e) => {
                  const content = { ...localValues.content, text: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              />
            </div>
            <div>
              <Label>Link</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={localValues.content?.link || ''}
                onChange={(e) => {
                  const content = { ...localValues.content, link: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              />
            </div>
            <div>
              <Label>Target</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={localValues.content?.target || '_self'}
                onChange={(e) => {
                  const content = { ...localValues.content, target: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              >
                <option value="_self">Same Window</option>
                <option value="_blank">New Window</option>
              </select>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <div>
              <Label>Video URL</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={localValues.content?.url || ''}
                onChange={(e) => {
                  const content = { ...localValues.content, url: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              />
            </div>
            <div>
              <Label>Provider</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={localValues.content?.provider || 'youtube'}
                onChange={(e) => {
                  const content = { ...localValues.content, provider: e.target.value };
                  setLocalValues({ ...localValues, content });
                  handleUpdateContent({ content });
                }}
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-2">
            <Label>Height</Label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="e.g., 50px"
              value={localValues.content?.height || ''}
              onChange={(e) => {
                const content = { height: e.target.value };
                setLocalValues({ ...localValues, content });
                handleUpdateContent({ content });
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {selectedElement.type === 'component' && `Edit ${(element as Component).type}`}
          {selectedElement.type === 'section' && 'Section Settings'}
          {selectedElement.type === 'column' && 'Column Settings'}
        </h3>
        {selectedElement.type === 'component' && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicateComponent?.(sectionId, columnId, selectedElement.id!)}
            >
              Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveComponent?.(sectionId, columnId, selectedElement.id!)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Component-specific editor */}
      {selectedElement.type === 'component' && renderComponentEditor(element as Component)}

      {/* Column width editor */}
      {selectedElement.type === 'column' && (
        <div className="space-y-2">
          <Label>Width (1-12)</Label>
          <input
            type="number"
            min="1"
            max="12"
            className="w-full p-2 border rounded-md"
            value={(element as Column).width}
            onChange={(e) => {
              const width = parseInt(e.target.value);
              if (onUpdateColumnStyle) {
                // This should use updateColumnWidth from context instead
                console.log('Update column width:', width);
              }
            }}
          />
        </div>
      )}

      {/* Style Editor */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="text-xs font-semibold text-gray-600">STYLING</h4>

        <div>
          <Label>Padding</Label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="e.g., 20px"
            value={element.style?.padding || ''}
            onChange={(e) => handleUpdateStyle('padding', e.target.value)}
          />
        </div>

        <div>
          <Label>Margin</Label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="e.g., 10px"
            value={element.style?.margin || ''}
            onChange={(e) => handleUpdateStyle('margin', e.target.value)}
          />
        </div>

        <div>
          <Label>Background Color</Label>
          <input
            type="color"
            className="w-full h-10 border rounded-md"
            value={element.style?.backgroundColor || '#ffffff'}
            onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
          />
        </div>

        {selectedElement.type === 'component' && ['text', 'heading'].includes((element as Component).type) && (
          <>
            <div>
              <Label>Text Color</Label>
              <input
                type="color"
                className="w-full h-10 border rounded-md"
                value={element.style?.color || '#000000'}
                onChange={(e) => handleUpdateStyle('color', e.target.value)}
              />
            </div>

            <div>
              <Label>Font Size</Label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 16px"
                value={element.style?.fontSize || ''}
                onChange={(e) => handleUpdateStyle('fontSize', e.target.value)}
              />
            </div>

            <div>
              <Label>Text Align</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={element.style?.textAlign || 'left'}
                onChange={(e) => handleUpdateStyle('textAlign', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
