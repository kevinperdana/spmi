import { useState } from 'react';
import { useBuilder } from '../../contexts/builder-context';
import { SectionRenderer } from './section-renderer';
import { ComponentPalette } from './component-palette';
import { PropertiesPanel } from './properties-panel';
import { Button } from '../ui/button';
import { Plus, Eye, Save, Undo, Redo } from 'lucide-react';
import type { Component } from '../../types/builder';

interface PageBuilderProps {
  onSave?: (data: any) => void;
  onPreview?: () => void;
}

export const PageBuilder = ({ onSave, onPreview }: PageBuilderProps) => {
  const builder = useBuilder();
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  const handleAddComponentToColumn = (component: Omit<Component, 'id'>) => {
    if (currentSectionId && currentColumnId) {
      builder.addComponent(currentSectionId, currentColumnId, component as Component);
      setShowPalette(false);
    }
  };

  const handleColumnClick = (sectionId: string, columnId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentColumnId(columnId);
    setShowPalette(true);
    builder.selectElement('column', columnId);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(builder.landingPage);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={builder.landingPage.title}
            onChange={(e) => builder.updatePageMetadata({ title: e.target.value })}
            className="px-3 py-1 border rounded-md font-semibold"
            placeholder="Page Title"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={builder.undo}
            disabled={!builder.canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={builder.redo}
            disabled={!builder.canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button size="sm" variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Palette */}
        <div className="w-64 border-r bg-white overflow-y-auto">
          <ComponentPalette onAddComponent={handleAddComponentToColumn} />

          <div className="p-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Sections</h3>
            <p className="text-xs text-gray-500 mb-3">
              {showPalette && currentColumnId
                ? 'Pilih component untuk ditambahkan'
                : 'Klik column untuk menambah component'}
            </p>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-gray-100 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto bg-white shadow-lg min-h-[600px]">
            {/* Canvas Content */}
            <div className="p-4">
              {builder.landingPage.sections.map((section, index) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  isEditing={true}
                  isSelected={builder.selectedElement.id === section.id}
                  canMoveUp={index > 0}
                  canMoveDown={index < builder.landingPage.sections.length - 1}
                  onSelectSection={(id) => builder.selectElement('section', id)}
                  onSelectColumn={handleColumnClick}
                  onSelectComponent={(sId, cId, compId) => {
                    builder.selectElement('component', compId);
                  }}
                  onRemoveSection={builder.removeSection}
                  onDuplicateSection={builder.duplicateSection}
                  onMoveSection={builder.moveSection}
                  onAddColumn={builder.addColumn}
                  onRemoveColumn={builder.removeColumn}
                />
              ))}

              {/* Add Section Button */}
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => builder.addSection()}
                  className="w-full max-w-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Section
                </Button>
              </div>

              {/* Empty State */}
              {builder.landingPage.sections.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="text-gray-400 mb-4">
                    <Plus className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Mulai Buat Landing Page</h3>
                    <p className="text-sm">
                      Klik tombol di bawah untuk menambahkan section pertama
                    </p>
                  </div>
                  <Button onClick={() => builder.addSection()}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add First Section
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <PropertiesPanel
            selectedElement={builder.selectedElement}
            landingPage={builder.landingPage}
            onUpdateComponent={builder.updateComponent}
            onUpdateSectionStyle={builder.updateSectionStyle}
            onUpdateColumnStyle={builder.updateColumnStyle}
            onRemoveComponent={builder.removeComponent}
            onDuplicateComponent={builder.duplicateComponent}
          />
        </div>
      </div>
    </div>
  );
};
