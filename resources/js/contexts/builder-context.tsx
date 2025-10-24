import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import type { 
  BuilderState, 
  LandingPage, 
  Section, 
  Column, 
  Component 
} from '../types/builder';

interface BuilderContextType extends BuilderState {
  addSection: (index?: number) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  
  addColumn: (sectionId: string, width?: number) => void;
  removeColumn: (sectionId: string, columnId: string) => void;
  updateColumnWidth: (sectionId: string, columnId: string, width: number) => void;
  
  addComponent: (sectionId: string, columnId: string, component: Component) => void;
  removeComponent: (sectionId: string, columnId: string, componentId: string) => void;
  updateComponent: (sectionId: string, columnId: string, componentId: string, updates: Partial<Component>) => void;
  duplicateComponent: (sectionId: string, columnId: string, componentId: string) => void;
  moveComponent: (sectionId: string, columnId: string, componentId: string, direction: 'up' | 'down') => void;
  
  updateSectionStyle: (sectionId: string, style: any) => void;
  updateColumnStyle: (sectionId: string, columnId: string, style: any) => void;
  
  selectElement: (type: 'section' | 'column' | 'component' | null, id: string | null) => void;
  
  setLandingPage: (page: LandingPage) => void;
  updatePageMetadata: (metadata: Partial<LandingPage>) => void;
  
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialLandingPage: LandingPage = {
  title: 'Untitled Page',
  sections: [],
  globalStyles: {},
};

interface BuilderProviderProps {
  children: ReactNode;
  initialPage?: LandingPage;
}

export const BuilderProvider = ({ children, initialPage }: BuilderProviderProps) => {
  const [landingPage, setLandingPageState] = useState<LandingPage>(initialPage || initialLandingPage);
  const [selectedElement, setSelectedElement] = useState<BuilderState['selectedElement']>({
    type: null,
    id: null,
  });
  const [history, setHistory] = useState<LandingPage[]>([initialPage || initialLandingPage]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const saveToHistory = useCallback((newPage: LandingPage) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      return [...newHistory, newPage];
    });
    setCurrentHistoryIndex(prev => prev + 1);
  }, [currentHistoryIndex]);

  const updateLandingPage = useCallback((updater: (prev: LandingPage) => LandingPage) => {
    setLandingPageState(prev => {
      const newPage = updater(prev);
      saveToHistory(newPage);
      return newPage;
    });
  }, [saveToHistory]);

  // Section operations
  const addSection = useCallback((index?: number) => {
    updateLandingPage(prev => {
      const newSection: Section = {
        id: generateId(),
        columns: [{
          id: generateId(),
          width: 12,
          components: [],
        }],
        style: {},
      };
      
      const sections = [...prev.sections];
      if (index !== undefined) {
        sections.splice(index, 0, newSection);
      } else {
        sections.push(newSection);
      }
      
      return { ...prev, sections };
    });
  }, [updateLandingPage]);

  const removeSection = useCallback((sectionId: string) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  }, [updateLandingPage]);

  const duplicateSection = useCallback((sectionId: string) => {
    updateLandingPage(prev => {
      const sectionIndex = prev.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;
      
      const section = prev.sections[sectionIndex];
      const duplicated: Section = {
        ...section,
        id: generateId(),
        columns: section.columns.map(col => ({
          ...col,
          id: generateId(),
          components: col.components.map(comp => ({
            ...comp,
            id: generateId(),
          })),
        })),
      };
      
      const sections = [...prev.sections];
      sections.splice(sectionIndex + 1, 0, duplicated);
      
      return { ...prev, sections };
    });
  }, [updateLandingPage]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    updateLandingPage(prev => {
      const index = prev.sections.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.sections.length) return prev;
      
      const sections = [...prev.sections];
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      
      return { ...prev, sections };
    });
  }, [updateLandingPage]);

  // Column operations
  const addColumn = useCallback((sectionId: string, width: number = 6) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: [
                ...section.columns,
                {
                  id: generateId(),
                  width,
                  components: [],
                },
              ],
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  const removeColumn = useCallback((sectionId: string, columnId: string) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.filter(col => col.id !== columnId),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  const updateColumnWidth = useCallback((sectionId: string, columnId: string, width: number) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col =>
                col.id === columnId ? { ...col, width } : col
              ),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  // Component operations
  const addComponent = useCallback((sectionId: string, columnId: string, component: Component) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col =>
                col.id === columnId
                  ? { ...col, components: [...col.components, { ...component, id: generateId() }] }
                  : col
              ),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  const removeComponent = useCallback((sectionId: string, columnId: string, componentId: string) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col =>
                col.id === columnId
                  ? { ...col, components: col.components.filter(c => c.id !== componentId) }
                  : col
              ),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  const updateComponent = useCallback((
    sectionId: string,
    columnId: string,
    componentId: string,
    updates: Partial<Component>
  ) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col =>
                col.id === columnId
                  ? {
                      ...col,
                      components: col.components.map(comp =>
                        comp.id === componentId ? { ...comp, ...updates } : comp
                      ),
                    }
                  : col
              ),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  const duplicateComponent = useCallback((sectionId: string, columnId: string, componentId: string) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col =>
                col.id === columnId
                  ? {
                      ...col,
                      components: col.components.flatMap(comp =>
                        comp.id === componentId ? [comp, { ...comp, id: generateId() }] : [comp]
                      ),
                    }
                  : col
              ),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  const moveComponent = useCallback((
    sectionId: string,
    columnId: string,
    componentId: string,
    direction: 'up' | 'down'
  ) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col => {
                if (col.id !== columnId) return col;
                
                const index = col.components.findIndex(c => c.id === componentId);
                if (index === -1) return col;
                
                const newIndex = direction === 'up' ? index - 1 : index + 1;
                if (newIndex < 0 || newIndex >= col.components.length) return col;
                
                const components = [...col.components];
                [components[index], components[newIndex]] = [components[newIndex], components[index]];
                
                return { ...col, components };
              }),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  // Style operations
  const updateSectionStyle = useCallback((sectionId: string, style: any) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, style: { ...section.style, ...style } } : section
      ),
    }));
  }, [updateLandingPage]);

  const updateColumnStyle = useCallback((sectionId: string, columnId: string, style: any) => {
    updateLandingPage(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map(col =>
                col.id === columnId ? { ...col, style: { ...col.style, ...style } } : col
              ),
            }
          : section
      ),
    }));
  }, [updateLandingPage]);

  // Selection
  const selectElement = useCallback((type: 'section' | 'column' | 'component' | null, id: string | null) => {
    setSelectedElement({ type, id });
  }, []);

  // Page operations
  const setLandingPage = useCallback((page: LandingPage) => {
    setLandingPageState(page);
    setHistory([page]);
    setCurrentHistoryIndex(0);
  }, []);

  const updatePageMetadata = useCallback((metadata: Partial<LandingPage>) => {
    updateLandingPage(prev => ({ ...prev, ...metadata }));
  }, [updateLandingPage]);

  // History operations
  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setLandingPageState(history[newIndex]);
    }
  }, [currentHistoryIndex, history]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setLandingPageState(history[newIndex]);
    }
  }, [currentHistoryIndex, history]);

  const value: BuilderContextType = {
    landingPage,
    selectedElement,
    history,
    currentHistoryIndex,
    addSection,
    removeSection,
    duplicateSection,
    moveSection,
    addColumn,
    removeColumn,
    updateColumnWidth,
    addComponent,
    removeComponent,
    updateComponent,
    duplicateComponent,
    moveComponent,
    updateSectionStyle,
    updateColumnStyle,
    selectElement,
    setLandingPage,
    updatePageMetadata,
    undo,
    redo,
    canUndo: currentHistoryIndex > 0,
    canRedo: currentHistoryIndex < history.length - 1,
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
};
