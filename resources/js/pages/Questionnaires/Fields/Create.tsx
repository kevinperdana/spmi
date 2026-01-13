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

interface Props {
    page: PageInfo;
}

type OptionForm = {
    label: string;
};

const inputTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Tel' },
];

export default function Create({ page }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'input',
        label: '',
        placeholder: '',
        input_type: 'text',
        content: '',
        is_required: false,
        order: '',
        options: [],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kuesioner', href: '/questionnaires' },
        { title: page.title, href: `/questionnaires/${page.id}/items` },
        { title: 'Tambah Field', href: `/questionnaires/${page.id}/fields/create` },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(`/questionnaires/${page.id}/fields`);
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
        if (data.options.length <= 1) return;
        setData('options', data.options.filter((_: OptionForm, optionIndex: number) => optionIndex !== index));
    };

    const optionError = (index: number) => (errors as Record<string, string>)[`options.${index}.label`];

    const handleTypeChange = (value: string) => {
        setData('type', value);
        if (value === 'select' && data.options.length === 0) {
            setData('options', [{ label: '' }, { label: '' }, { label: '' }]);
        }
        if (value !== 'select') {
            setData('options', []);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Field - ${page.title}`} />

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
                            Tambah Field Form Awal
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {page.title}
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipe Field</Label>
                                <div className="relative">
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(event) => handleTypeChange(event.target.value)}
                                        className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100"
                                    >
                                        <option value="input">Input</option>
                                        <option value="select">Dropdown</option>
                                        <option value="text">Teks</option>
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

                        <div className="space-y-2">
                            <Label htmlFor="label">Label</Label>
                            <Input
                                id="label"
                                value={data.label}
                                onChange={(event) => setData('label', event.target.value)}
                                placeholder={data.type === 'text' ? 'Judul petunjuk (opsional)' : 'Contoh: Nama Lengkap'}
                            />
                            {errors.label && (
                                <p className="text-sm text-red-600">{errors.label}</p>
                            )}
                        </div>

                        {data.type !== 'text' ? (
                            <div className="space-y-2">
                                <Label htmlFor="placeholder">Placeholder (opsional)</Label>
                                <Input
                                    id="placeholder"
                                    value={data.placeholder}
                                    onChange={(event) => setData('placeholder', event.target.value)}
                                    placeholder="Contoh: Masukkan NIM"
                                />
                                {errors.placeholder && (
                                    <p className="text-sm text-red-600">{errors.placeholder}</p>
                                )}
                            </div>
                        ) : null}

                        {data.type !== 'text' ? (
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_required"
                                    type="checkbox"
                                    checked={data.is_required}
                                    onChange={(event) => setData('is_required', event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="is_required">Wajib diisi</Label>
                            </div>
                        ) : null}

                        {data.type === 'input' ? (
                            <div className="space-y-2">
                                <Label htmlFor="input_type">Jenis Input</Label>
                                <div className="relative">
                                    <select
                                        id="input_type"
                                        value={data.input_type}
                                        onChange={(event) => setData('input_type', event.target.value)}
                                        className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white/90 px-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-neutral-900/80 dark:text-gray-100"
                                    >
                                        {inputTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.input_type && (
                                    <p className="text-sm text-red-600">{errors.input_type}</p>
                                )}
                            </div>
                        ) : null}

                        {data.type === 'select' ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Opsi Dropdown</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Tambahkan opsi sesuai kebutuhan.
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
                                                    disabled={data.options.length <= 1}
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
                        ) : null}

                        {data.type === 'text' ? (
                            <div className="space-y-2">
                                <Label htmlFor="content">Konten</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(event) => setData('content', event.target.value)}
                                    placeholder="Tulis petunjuk atau keterangan lain di sini."
                                    rows={5}
                                />
                                {errors.content && (
                                    <p className="text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>
                        ) : null}

                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Field'}
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
