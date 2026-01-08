<?php

namespace App\Http\Controllers;

use App\Models\AmiForm;
use App\Models\AmiFormSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AmiFormSectionController extends Controller
{
    public function index(AmiForm $amiForm)
    {
        $firstSection = $amiForm->sections()
            ->orderBy('order')
            ->orderBy('created_at')
            ->first();

        if (!$firstSection) {
            $firstSection = $amiForm->sections()->create([
                'title' => $amiForm->title,
                'order' => 0,
            ]);
        }

        return redirect()->route('ami-form-sections.items.index', [$amiForm, $firstSection]);
    }

    public function create(AmiForm $amiForm)
    {
        return Inertia::render('AmiForms/Sections/Create', [
            'form' => $amiForm,
        ]);
    }

    public function store(Request $request, AmiForm $amiForm)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
        ]);

        $order = $validated['order'] ?? ($amiForm->sections()->max('order') ?? -1) + 1;

        $section = $amiForm->sections()->create([
            'title' => $validated['title'],
            'order' => $order,
        ]);

        return redirect()
            ->route('ami-form-sections.items.index', [$amiForm, $section])
            ->with('success', 'Section created successfully.');
    }

    public function edit(AmiForm $amiForm, AmiFormSection $amiFormSection)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);

        return Inertia::render('AmiForms/Sections/Edit', [
            'form' => $amiForm,
            'section' => $amiFormSection,
        ]);
    }

    public function update(Request $request, AmiForm $amiForm, AmiFormSection $amiFormSection)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer'],
        ]);

        $amiFormSection->update([
            'title' => $validated['title'],
            'order' => $validated['order'] ?? $amiFormSection->order,
        ]);

        return redirect()
            ->route('ami-form-sections.items.index', [$amiForm, $amiFormSection])
            ->with('success', 'Section updated successfully.');
    }

    public function destroy(AmiForm $amiForm, AmiFormSection $amiFormSection)
    {
        $this->ensureSectionBelongsToForm($amiForm, $amiFormSection);

        $amiFormSection->delete();

        return redirect()
            ->route('ami-form-sections.index', $amiForm)
            ->with('success', 'Section deleted successfully.');
    }

    private function ensureSectionBelongsToForm(AmiForm $amiForm, AmiFormSection $amiFormSection): void
    {
        if ($amiFormSection->ami_form_id !== $amiForm->id) {
            abort(404);
        }
    }
}
