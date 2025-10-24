import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    title: string;
    slug: string;
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
}

export default function Index({ menuItems, pages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menu Management', href: '/menu-items' },
    ];

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
    
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        page_id: '',
        parent_id: '',
        is_published: true,
    });

    const handleOpenModal = (item: MenuItem | null = null, parentId: number | null = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                url: item.url || '',
                page_id: item.page_id?.toString() || '',
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

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const indent = level * 24;

        return (
            <div key={item.id}>
                <div 
                    className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                    style={{ paddingLeft: `${12 + indent}px` }}
                >
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    
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
                    <div>
                        {item.children!.map(child => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

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

    const allItems = getAllMenuItems(menuItems);

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

                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    {menuItems.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No menu items yet. Click "Add Menu Item" to get started.
                        </div>
                    ) : (
                        <div>
                            {menuItems.map(item => renderMenuItem(item))}
                        </div>
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
                                    value={formData.page_id}
                                    onChange={(e) => setFormData({ ...formData, page_id: e.target.value, url: '' })}
                                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm"
                                >
                                    <option value="">-- Select Page --</option>
                                    {pages.map(page => (
                                        <option key={page.id} value={page.id}>
                                            {page.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="url">Or Custom URL</Label>
                                <Input
                                    id="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value, page_id: '' })}
                                    placeholder="https://example.com"
                                    className="mt-1"
                                    disabled={!!formData.page_id}
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
