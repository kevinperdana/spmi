import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HomeSection {
    id: number;
    title: string;
    layout_type: string;
    section_type: string;
    background_color: string;
    content: {
        heading?: string;
        text?: string;
        image?: string;
        left?: { heading?: string; text?: string; image?: string };
        right?: { heading?: string; text?: string; image?: string };
    };
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    sections: HomeSection[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home Sections',
        href: '/home-sections',
    },
];

function SortableItem({ section, handleDelete, deletingId }: { section: HomeSection; handleDelete: (id: number) => void; deletingId: number | null }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getLayoutLabel = (layoutType: string) => {
        const labels: Record<string, string> = {
            'full-width': 'Full Width',
            '2-equal': '2 Equal',
            '3-equal': '3 Equal',
            '4-equal': '4 Equal',
            '2-sidebar-left': '2 Sidebar Left',
            '2-sidebar-right': '2 Sidebar Right',
        };
        return labels[layoutType] || layoutType;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400">
                <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {section.title}
                    </h3>
                    {section.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {section.section_type}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={`/home-sections/${section.id}/edit`}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <Edit className="h-5 w-5" />
                </Link>
                <button
                    onClick={() => handleDelete(section.id)}
                    disabled={deletingId === section.id}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

export default function Index({ sections: initialSections }: Props) {
    const [sections, setSections] = useState<HomeSection[]>(initialSections);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update order in backend
                const reorderedSections = newItems.map((item, index) => ({
                    id: item.id,
                    order: index,
                }));

                router.post('/home-sections/reorder', {
                    sections: reorderedSections,
                }, {
                    preserveScroll: true,
                });

                return newItems;
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this section?')) {
            setDeletingId(id);
            router.delete(`/home-sections/${id}`, {
                onSuccess: () => {
                    // Remove from local state
                    setSections((items) => items.filter(item => item.id !== id));
                },
                onFinish: () => setDeletingId(null),
            });
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home Sections" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Home Page Sections
                    </h2>
                    <Link href="/home-sections/create">
                        <Button>
                            <Plus className="mr-0 h-4 w-4" />
                            New Section
                        </Button>
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow-sm dark:bg-neutral-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        {sections.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No sections yet. Create your first section!
                                </p>
                                <Link href="/home-sections/create">
                                    <Button>
                                        <Plus className="mr-0 h-4 w-4" />
                                        Create Section
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={sections.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-4">
                                        {sections.map((section) => (
                                            <SortableItem
                                                key={section.id}
                                                section={section}
                                                handleDelete={handleDelete}
                                                deletingId={deletingId}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
