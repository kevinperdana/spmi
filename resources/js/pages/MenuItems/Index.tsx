import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Page {
    id: number;
    title: string;
    slug: string;
}

interface QuestionnaireChart {
    id: number;
    title: string;
}

interface MenuItem {
    id: number;
    title: string;
    url: string | null;
    page_id: number | null;
    parent_id: number | null;
    order: number;
    is_published: boolean;
    page?: Page;
    children?: MenuItem[];
}

interface Props {
    menuItems: MenuItem[];
    pages: Page[];
    questionnaireCharts: QuestionnaireChart[];
}

const getChartIdFromUrl = (url?: string | null) => {
    if (!url) return '';
    const match = url.match(/^\/questionnaires\/(\d+)\/responses\/charts$/);
    return match ? match[1] : '';
};

const buildChartUrl = (id: string) => `/questionnaires/${id}/responses/charts`;

export default function Index({ menuItems, pages, questionnaireCharts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menu Management', href: '/menu-items' },
    ];

    const [menuItemsState, setMenuItemsState] = useState<MenuItem[]>(menuItems);
    const [showReorderAlert, setShowReorderAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    
    // Auto-expand all items with children on mount
    useEffect(() => {
        const getItemsWithChildren = (items: MenuItem[]): number[] => {
            let result: number[] = [];
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    result.push(item.id);
                    result = result.concat(getItemsWithChildren(item.children));
                }
            });
            return result;
        };
        
        const itemsToExpand = getItemsWithChildren(menuItems);
        setExpandedItems(new Set(itemsToExpand));
    }, [menuItems]);

    useEffect(() => {
        setMenuItemsState(menuItems);
    }, [menuItems]);
    
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        page_id: '',
        parent_id: '',
        is_published: true,
    });

    const handleOpenModal = (item: MenuItem | null = null, parentId: number | null = null) => {
        if (item) {
            const chartId = getChartIdFromUrl(item.url);
            setEditingItem(item);
            setFormData({
                title: item.title,
                url: item.url || '',
                page_id: chartId ? '' : item.page_id?.toString() || '',
                parent_id: item.parent_id?.toString() || '',
                is_published: item.is_published,
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                url: '',
                page_id: '',
                parent_id: parentId?.toString() || '',
                is_published: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = {
            ...formData,
            page_id: formData.page_id || null,
            parent_id: formData.parent_id || null,
        };

        if (editingItem) {
            router.put(`/menu-items/${editingItem.id}`, data, {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            router.post('/menu-items', data, {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            router.delete(`/menu-items/${id}`);
        }
    };

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findParentId = (
        items: MenuItem[],
        targetId: number,
        parentId: number | null = null
    ): number | null => {
        for (const item of items) {
            if (item.id === targetId) {
                return parentId;
            }
            if (item.children && item.children.length > 0) {
                const match = findParentId(item.children, targetId, item.id);
                if (match !== null) {
                    return match;
                }
            }
        }
        return null;
    };

    const getSiblings = (items: MenuItem[], parentId: number | null): MenuItem[] => {
        if (parentId === null) {
            return items;
        }
        for (const item of items) {
            if (item.id === parentId) {
                return item.children ?? [];
            }
            if (item.children && item.children.length > 0) {
                const match = getSiblings(item.children, parentId);
                if (match.length > 0) {
                    return match;
                }
            }
        }
        return [];
    };

    const reorderSiblings = (
        items: MenuItem[],
        parentId: number | null,
        activeId: number,
        overId: number
    ): MenuItem[] => {
        if (parentId === null) {
            const oldIndex = items.findIndex((item) => item.id === activeId);
            const newIndex = items.findIndex((item) => item.id === overId);
            if (oldIndex === -1 || newIndex === -1) {
                return items;
            }
            return arrayMove(items, oldIndex, newIndex);
        }

        return items.map((item) => {
            if (item.id === parentId) {
                const children = item.children ?? [];
                const oldIndex = children.findIndex((child) => child.id === activeId);
                const newIndex = children.findIndex((child) => child.id === overId);
                if (oldIndex === -1 || newIndex === -1) {
                    return item;
                }
                return {
                    ...item,
                    children: arrayMove(children, oldIndex, newIndex),
                };
            }

            if (!item.children || item.children.length === 0) {
                return item;
            }

            const updatedChildren = reorderSiblings(item.children, parentId, activeId, overId);
            if (updatedChildren === item.children) {
                return item;
            }
            return { ...item, children: updatedChildren };
        });
    };

    const submitReorder = async (
        items: { id: number; order: number; parent_id: number | null }[]
    ) => {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        const response = await fetch('/menu-items/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { 'X-CSRF-TOKEN': token } : {}),
            },
            credentials: 'same-origin',
            body: JSON.stringify({ items }),
        });

        if (!response.ok) {
            return;
        }

        setShowReorderAlert(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const activeId = typeof active.id === 'number' ? active.id : Number(active.id);
        const overId = typeof over.id === 'number' ? over.id : Number(over.id);

        if (Number.isNaN(activeId) || Number.isNaN(overId)) {
            return;
        }

        const activeParentId = findParentId(menuItemsState, activeId);
        const overParentId = findParentId(menuItemsState, overId);

        if (activeParentId !== overParentId) {
            return;
        }

        const reordered = reorderSiblings(menuItemsState, activeParentId, activeId, overId);
        const siblings = getSiblings(reordered, activeParentId);

        setMenuItemsState(reordered);

        if (siblings.length > 0) {
            const reorderedItems = siblings.map((item, index) => ({
                id: item.id,
                order: index,
                parent_id: activeParentId,
            }));

            void submitReorder(reorderedItems);
        }
    };

    const SortableMenuItem = ({ item, level }: { item: MenuItem; level: number }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: item.id });

        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const indent = level * 24;
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            paddingLeft: `${12 + indent}px`,
        };

        return (
            <div>
                <div
                    ref={setNodeRef}
                    style={style}
                    className={`flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50 ${isDragging ? 'bg-gray-50 dark:bg-neutral-800/60' : ''}`}
                >
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                    
                    {hasChildren && (
                        <button
                            onClick={() => toggleExpand(item.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.title}
                            </span>
                            {!item.is_published && (
                                <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    Draft
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {item.page ? `Page: ${item.page.title}` : item.url || 'No URL'}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(null, item.id)}
                            title="Add Submenu"
                            className="dark:text-white"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="text-xs">Sub</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(item)}
                            className="dark:text-white"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                        >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                    </div>
                </div>
                
                {hasChildren && isExpanded && (
                    <MenuItemsList items={item.children!} level={level + 1} />
                )}
            </div>
        );
    };

    const MenuItemsList = ({ items, level }: { items: MenuItem[]; level: number }) => (
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
                <SortableMenuItem key={item.id} item={item} level={level} />
            ))}
        </SortableContext>
    );

    const getAllMenuItems = (items: MenuItem[]): MenuItem[] => {
        let result: MenuItem[] = [];
        items.forEach(item => {
            result.push(item);
            if (item.children && item.children.length > 0) {
                result = result.concat(getAllMenuItems(item.children));
            }
        });
        return result;
    };

    const allItems = getAllMenuItems(menuItemsState);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Menu Management
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Organize your navigation menu with nested items
                        </p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Menu Item
                    </Button>
                </div>

                {showReorderAlert && (
                    <Alert>
                        <AlertTitle>Reordered Successfully</AlertTitle>
                    </Alert>
                )}

                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    {menuItemsState.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No menu items yet. Click "Add Menu Item" to get started.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <MenuItemsList items={menuItemsState} level={0} />
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="page_id">Link to Page</Label>
                                <select
                                    id="page_id"
                                    value={
                                        formData.page_id
                                            ? `page:${formData.page_id}`
                                            : getChartIdFromUrl(formData.url)
                                                ? `chart:${getChartIdFromUrl(formData.url)}`
                                                : ''
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!value) {
                                            setFormData({ ...formData, page_id: '', url: '' });
                                            return;
                                        }

                                        if (value.startsWith('page:')) {
                                            setFormData({
                                                ...formData,
                                                page_id: value.replace('page:', ''),
                                                url: '',
                                            });
                                            return;
                                        }

                                        if (value.startsWith('chart:')) {
                                            const chartId = value.replace('chart:', '');
                                            setFormData({
                                                ...formData,
                                                page_id: '',
                                                url: buildChartUrl(chartId),
                                            });
                                        }
                                    }}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                                >
                                    <option value="">-- Select Page --</option>
                                    <optgroup label="Halaman">
                                        {pages.map(page => (
                                            <option key={page.id} value={`page:${page.id}`}>
                                                {page.title}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Grafik Kuesioner">
                                        {questionnaireCharts.map(chart => (
                                            <option key={chart.id} value={`chart:${chart.id}`}>
                                                {chart.title}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="url">Or Custom URL</Label>
                                <Input
                                    id="url"
                                    value={formData.url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            url: e.target.value,
                                            page_id: '',
                                        })
                                    }
                                    placeholder="https://example.com"
                                    className="mt-1"
                                    disabled={!!formData.page_id || !!getChartIdFromUrl(formData.url)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="parent_id">Parent Menu</Label>
                                <select
                                    id="parent_id"
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                                >
                                    <option value="">-- No Parent (Top Level) --</option>
                                    {allItems
                                        .filter(item => !editingItem || item.id !== editingItem.id)
                                        .map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.title}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_published"
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <Label htmlFor="is_published" className="ml-2 mb-0">
                                    Published
                                </Label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingItem ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
