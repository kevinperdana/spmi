<?php

namespace App\Http\Controllers;

use App\Models\AmiForm;
use App\Models\AmiFormItem;
use App\Models\AmiFormSection;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AmiFormItemController extends Controller
{
    private const SATUAN_OPTIONS = [
        'tersedia',
        'persen',
        'ipk',
        'tahun',
    ];
    private const TARGET_OPTIONS = [
        'dokumen',
        'angka',
    ];
    private const CAPAIAN_OPTIONS = [
        'dokumen_tersedia',
        'angka',
    ];
    private const PERSENTASE_UNIT = 'persen';

    public function index(AmiForm $amiForm, AmiFormSection $amiFormSection)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);

        $items = $amiFormSection->items()
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('AmiForms/Sections/Items/Index', [
            'form' => $amiForm,
            'section' => $amiFormSection,
            'items' => $items,
        ]);
    }

    public function create(AmiForm $amiForm, AmiFormSection $amiFormSection)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);

        return Inertia::render('AmiForms/Sections/Items/Create', [
            'form' => $amiForm,
            'section' => $amiFormSection,
            'satuanOptions' => self::SATUAN_OPTIONS,
            'targetOptions' => self::TARGET_OPTIONS,
            'capaianOptions' => self::CAPAIAN_OPTIONS,
        ]);
    }

    public function store(Request $request, AmiForm $amiForm, AmiFormSection $amiFormSection)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);

        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50'],
            'indicator' => ['required', 'string'],
            'satuan_unit' => ['required', Rule::in(self::SATUAN_OPTIONS)],
            'target_unit' => ['required', Rule::in(self::TARGET_OPTIONS)],
            'capaian_unit' => ['required', Rule::in(self::CAPAIAN_OPTIONS)],
            'order' => ['nullable', 'integer'],
        ]);

        $order = $validated['order'] ?? ($amiFormSection->items()->max('order') ?? -1) + 1;

        $amiFormSection->items()->create([
            'code' => $validated['code'] ?? null,
            'indicator' => $validated['indicator'],
            'satuan_unit' => $validated['satuan_unit'],
            'target_unit' => $validated['target_unit'],
            'capaian_unit' => $validated['capaian_unit'],
            'persentase_unit' => self::PERSENTASE_UNIT,
            'order' => $order,
        ]);

        return redirect()
            ->route('ami-form-sections.items.index', [$amiForm, $amiFormSection])
            ->with('success', 'Item created successfully.');
    }

    public function edit(AmiForm $amiForm, AmiFormSection $amiFormSection, AmiFormItem $amiFormItem)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);
        $this->ensureItemBelongsToSection($amiFormSection, $amiFormItem);

        return Inertia::render('AmiForms/Sections/Items/Edit', [
            'form' => $amiForm,
            'section' => $amiFormSection,
            'item' => $amiFormItem,
            'satuanOptions' => self::SATUAN_OPTIONS,
            'targetOptions' => self::TARGET_OPTIONS,
            'capaianOptions' => self::CAPAIAN_OPTIONS,
        ]);
    }

    public function update(Request $request, AmiForm $amiForm, AmiFormSection $amiFormSection, AmiFormItem $amiFormItem)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);
        $this->ensureItemBelongsToSection($amiFormSection, $amiFormItem);

        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50'],
            'indicator' => ['required', 'string'],
            'satuan_unit' => ['required', Rule::in(self::SATUAN_OPTIONS)],
            'target_unit' => ['required', Rule::in(self::TARGET_OPTIONS)],
            'capaian_unit' => ['required', Rule::in(self::CAPAIAN_OPTIONS)],
            'order' => ['nullable', 'integer'],
        ]);

        $amiFormItem->update([
            'code' => $validated['code'] ?? null,
            'indicator' => $validated['indicator'],
            'satuan_unit' => $validated['satuan_unit'],
            'target_unit' => $validated['target_unit'],
            'capaian_unit' => $validated['capaian_unit'],
            'persentase_unit' => self::PERSENTASE_UNIT,
            'order' => $validated['order'] ?? $amiFormItem->order,
        ]);

        return redirect()
            ->route('ami-form-sections.items.index', [$amiForm, $amiFormSection])
            ->with('success', 'Item updated successfully.');
    }

    public function destroy(AmiForm $amiForm, AmiFormSection $amiFormSection, AmiFormItem $amiFormItem)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);
        $this->ensureItemBelongsToSection($amiFormSection, $amiFormItem);

        $amiFormItem->delete();

        return redirect()
            ->route('ami-form-sections.items.index', [$amiForm, $amiFormSection])
            ->with('success', 'Item deleted successfully.');
    }

    private function ensureSectionBelongsToForm(AmiForm $amiForm, AmiFormSection $amiFormSection): void
    {
        if ($amiFormSection->ami_form_id !== $amiForm->id) {
            abort(404);
        }
    }

    private function ensureItemBelongsToSection(AmiFormSection $amiFormSection, AmiFormItem $amiFormItem): void
    {
        if ($amiFormItem->section_id !== $amiFormSection->id) {
            abort(404);
        }
    }
}
