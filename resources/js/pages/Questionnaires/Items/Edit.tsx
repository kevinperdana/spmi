import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface PageInfo {
    id: number;
    title: string;
}

interface SectionInfo {
    id: number;
    title: string;
}

interface OptionInfo {
    id: number;
    label: string;
    order: number;
}

interface ItemInfo {
    id: number;
    section_id?: number | null;
    question: string;
    description?: string | null;
    type: 'checkbox' | 'radio';
    order: number;
    options: OptionInfo[];
}

interface Props {
    page: PageInfo;
    sections: SectionInfo[];
    item: ItemInfo;
}

type OptionForm = {
    label: string;
};

export default function Edit({ page, sections, item }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        section_id: item.section_id || '',
        question: item.question,
        description: item.description || '',
        type: item.type,
        order: item.order ?? '',
        options: item.options.length
            ? item.options.map((option) => ({ label: option.label }))
            : [{ label: '' }, { label: '' }],
    });
    const hasSections = sections.length > 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kuesioner', href: '/questionnaires' },
        { title: page.title, href: `/questionnaires/${page.id}/items` },
        { title: 'Edit Item', href: `/questionnaires/${page.id}/items/${item.id}/edit` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(`/questionnaires/${page.id}/items/${item.id}`);
    };

    const updateOption = (index: number, value: string) => {
        const nextOptions = data.options.map((option: OptionForm, optionIndex: number) =>
            optionIndex === index ? { ...option, label: value } : option
        );
        setData('options', nextOptions);
    };

    const addOption = () => {
        setData('options', [...data.options, { label: '' }]);
    };

    const removeOption = (index: number) => {
        if (data.options.length <= 2) return;
        setData('options', data.options.filter((_: OptionForm, optionIndex: number) => optionIndex !== index));
    };

    const optionError = (index: number) => (errors as Record<string, string>)[`options.${index}.label`];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Item - ${page.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/questionnaires/${page.id}/items`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Edit Item Kuesioner
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {page.title}
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <form onSubmit={submit} className="space-y-6">
                        {hasSections ? (
                            <div className="space-y-2">
                                <Label htmlFor="section_id">Section (opsional)</Label>
                                <div className="relative">
                                    <select
                                        id="section_id"
                                        value={data.section_id}
                                        onChange={(event) => setData('section_id', event.target.value)}
                                        className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100"
                                    >
                                        <option value="">Tanpa Section</option>
                                        {sections.map((section) => (
                                            <option key={section.id} value={section.id}>
                                                {section.title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.section_id && (
                                    <p className="text-sm text-red-600">{errors.section_id}</p>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-neutral-900/40 dark:text-gray-400">
                                Section belum dibuat. Item ini tersimpan tanpa section.
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="question">Pertanyaan</Label>
                            <Input
                                id="question"
                                value={data.question}
                                onChange={(event) => setData('question', event.target.value)}
                                placeholder="Tulis pertanyaan kuesioner"
                            />
                            {errors.question && (
                                <p className="text-sm text-red-600">{errors.question}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi (opsional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                placeholder="Tambahkan penjelasan atau catatan"
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipe Jawaban</Label>
                                <div className="relative">
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(event) => setData('type', event.target.value)}
                                        className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100"
                                    >
                                        <option value="checkbox">Checkbox (multi pilih)</option>
                                        <option value="radio">Radio (pilih satu)</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.type && (
                                    <p className="text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Urutan (opsional)</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(event) => setData('order', event.target.value)}
                                    placeholder="Contoh: 1"
                                />
                                {errors.order && (
                                    <p className="text-sm text-red-600">{errors.order}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Opsi Jawaban</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Minimal 2 opsi. Tambahkan sesuai kebutuhan (3, 4, atau 5 opsi).
                                    </p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Opsi
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {data.options.map((option: OptionForm, index: number) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <Input
                                                value={option.label}
                                                onChange={(event) => updateOption(index, event.target.value)}
                                                placeholder={`Opsi ${index + 1}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(index)}
                                                disabled={data.options.length <= 2}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                        {optionError(index) ? (
                                            <p className="text-sm text-red-600">{optionError(index)}</p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            {errors.options && (
                                <p className="text-sm text-red-600">{errors.options as string}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Button type="button" variant="ghost" asChild>
                                <Link href={`/questionnaires/${page.id}/items`}>Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
