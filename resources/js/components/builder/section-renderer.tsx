import { ComponentRenderer } from './component-renderer';
import type { Section, Column, ComponentStyle } from '../../types/builder';
import { Plus, Trash2, Copy, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '../ui/button';

interface SectionRendererProps {
  section: Section;
  isEditing?: boolean;
  onSelectSection?: (sectionId: string) => void;
  onSelectColumn?: (sectionId: string, columnId: string) => void;
  onSelectComponent?: (sectionId: string, columnId: string, componentId: string) => void;
  onRemoveSection?: (sectionId: string) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onMoveSection?: (sectionId: string, direction: 'up' | 'down') => void;
  onAddColumn?: (sectionId: string) => void;
  onRemoveColumn?: (sectionId: string, columnId: string) => void;
  isSelected?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const styleToCSS = (style?: ComponentStyle): React.CSSProperties => {
  if (!style) return {};
  return style as React.CSSProperties;
};

export const SectionRenderer = ({
  section,
  isEditing = false,
  onSelectSection,
  onSelectColumn,
  onSelectComponent,
  onRemoveSection,
  onDuplicateSection,
  onMoveSection,
  onAddColumn,
  onRemoveColumn,
  isSelected = false,
  canMoveUp = true,
  canMoveDown = true,
}: SectionRendererProps) => {
  const sectionStyle = styleToCSS(section.style);

  return (
    <div
      className={`relative group ${isEditing ? 'my-4' : ''} ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
      style={sectionStyle}
      onClick={(e) => {
        if (isEditing && onSelectSection) {
          e.stopPropagation();
          onSelectSection(section.id);
        }
      }}
    >
      {/* Section Controls */}
      {isEditing && (
        <div className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded-md shadow-md p-1 flex gap-1 z-10">
          {canMoveUp && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoveSection?.(section.id, 'up');
              }}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
          )}
          {canMoveDown && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoveSection?.(section.id, 'down');
              }}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateSection?.(section.id);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAddColumn?.(section.id);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSection?.(section.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Grid Container */}
      <div className={`grid grid-cols-12 gap-4 ${isEditing ? 'min-h-[100px]' : ''}`}>
        {section.columns.map((column) => (
          <ColumnRenderer
            key={column.id}
            sectionId={section.id}
            column={column}
            isEditing={isEditing}
            onSelectColumn={onSelectColumn}
            onSelectComponent={onSelectComponent}
            onRemoveColumn={onRemoveColumn}
          />
        ))}
      </div>

      {/* Empty State */}
      {isEditing && section.columns.length === 0 && (
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md">
          <p className="text-gray-400">Section kosong - tambahkan column</p>
        </div>
      )}
    </div>
  );
};

interface ColumnRendererProps {
  sectionId: string;
  column: Column;
  isEditing?: boolean;
  onSelectColumn?: (sectionId: string, columnId: string) => void;
  onSelectComponent?: (sectionId: string, columnId: string, componentId: string) => void;
  onRemoveColumn?: (sectionId: string, columnId: string) => void;
}

const ColumnRenderer = ({
  sectionId,
  column,
  isEditing = false,
  onSelectColumn,
  onSelectComponent,
  onRemoveColumn,
}: ColumnRendererProps) => {
  const columnStyle = styleToCSS(column.style);
  const colSpan = `col-span-${column.width}` as const;

  return (
    <div
      className={`${colSpan} relative group/column ${isEditing ? 'min-h-[80px] border-2 border-dashed border-gray-200 p-2' : ''}`}
      style={columnStyle}
      onClick={(e) => {
        if (isEditing && onSelectColumn) {
          e.stopPropagation();
          onSelectColumn(sectionId, column.id);
        }
      }}
    >
      {/* Column Controls */}
      {isEditing && (
        <div className="absolute -top-8 right-0 opacity-0 group-hover/column:opacity-100 transition-opacity bg-white border rounded-md shadow-md p-1 z-10">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveColumn?.(sectionId, column.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Components */}
      <div className="space-y-4">
        {column.components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            isEditing={isEditing}
            onClick={() => onSelectComponent?.(sectionId, column.id, component.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {isEditing && column.components.length === 0 && (
        <div className="flex items-center justify-center h-full text-xs text-gray-400">
          Drop component di sini
        </div>
      )}
    </div>
  );
};
