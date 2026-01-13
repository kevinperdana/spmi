<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\QuestionnaireField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QuestionnaireFieldController extends Controller
{
    public function create(Page $page)
    {
        $this->ensureQuestionnaire($page);

        return Inertia::render('Questionnaires/Fields/Create', [
            'page' => $page->only(['id', 'title']),
        ]);
    }

    public function store(Request $request, Page $page)
    {
        $this->ensureQuestionnaire($page);

        $validated = $request->validate([
            'type' => ['required', 'in:input,select,text'],
            'label' => ['nullable', 'string', 'max:255'],
            'placeholder' => ['nullable', 'string', 'max:255'],
            'input_type' => ['nullable', 'string', 'max:50'],
            'content' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
            'options' => ['nullable', 'array'],
            'options.*.label' => ['required_if:type,select', 'string', 'max:255'],
        ]);

        $this->validateFieldRequirements($validated);

        $order = $validated['order']
            ?? (($page->questionnaireFields()->max('order') ?? -1) + 1);

        $optionRows = $this->mapOptions($validated);

        DB::transaction(function () use ($page, $validated, $order, $optionRows) {
            $field = $page->questionnaireFields()->create([
                'type' => $validated['type'],
                'label' => $validated['type'] === 'text' ? null : $validated['label'],
                'placeholder' => $validated['type'] === 'text' ? null : ($validated['placeholder'] ?? null),
                'input_type' => $validated['type'] === 'input' ? ($validated['input_type'] ?? 'text') : null,
                'content' => $validated['type'] === 'text' ? $validated['content'] : null,
                'is_required' => $validated['type'] === 'text'
                    ? false
                    : (bool) ($validated['is_required'] ?? false),
                'order' => $order,
            ]);

            if ($optionRows->isNotEmpty()) {
                $field->options()->createMany($optionRows->all());
            }
        });

        return redirect()
            ->route('questionnaire-items.index', $page)
            ->with('success', 'Field kuesioner dibuat.');
    }

    public function edit(Page $page, QuestionnaireField $questionnaireField)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureFieldBelongsToPage($page, $questionnaireField);

        $questionnaireField->load(['options' => function ($query) {
            $query->orderBy('order')->orderBy('created_at');
        }]);

        return Inertia::render('Questionnaires/Fields/Edit', [
            'page' => $page->only(['id', 'title']),
            'field' => [
                'id' => $questionnaireField->id,
                'type' => $questionnaireField->type,
                'label' => $questionnaireField->label,
                'placeholder' => $questionnaireField->placeholder,
                'input_type' => $questionnaireField->input_type,
                'content' => $questionnaireField->content,
                'is_required' => $questionnaireField->is_required,
                'order' => $questionnaireField->order,
                'options' => $questionnaireField->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'order' => $option->order,
                    ];
                })->values(),
            ],
        ]);
    }

    public function update(Request $request, Page $page, QuestionnaireField $questionnaireField)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureFieldBelongsToPage($page, $questionnaireField);

        $validated = $request->validate([
            'type' => ['required', 'in:input,select,text'],
            'label' => ['nullable', 'string', 'max:255'],
            'placeholder' => ['nullable', 'string', 'max:255'],
            'input_type' => ['nullable', 'string', 'max:50'],
            'content' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
            'options' => ['nullable', 'array'],
            'options.*.label' => ['required_if:type,select', 'string', 'max:255'],
        ]);

        $this->validateFieldRequirements($validated);

        $optionRows = $this->mapOptions($validated);

        DB::transaction(function () use ($questionnaireField, $validated, $optionRows) {
            $questionnaireField->update([
                'type' => $validated['type'],
                'label' => $validated['type'] === 'text' ? null : $validated['label'],
                'placeholder' => $validated['type'] === 'text' ? null : ($validated['placeholder'] ?? null),
                'input_type' => $validated['type'] === 'input' ? ($validated['input_type'] ?? 'text') : null,
                'content' => $validated['type'] === 'text' ? $validated['content'] : null,
                'is_required' => $validated['type'] === 'text'
                    ? false
                    : (bool) ($validated['is_required'] ?? false),
                'order' => $validated['order'] ?? $questionnaireField->order,
            ]);

            $questionnaireField->options()->delete();
            if ($optionRows->isNotEmpty()) {
                $questionnaireField->options()->createMany($optionRows->all());
            }
        });

        return redirect()
            ->route('questionnaire-items.index', $page)
            ->with('success', 'Field kuesioner diperbarui.');
    }

    public function destroy(Page $page, QuestionnaireField $questionnaireField)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureFieldBelongsToPage($page, $questionnaireField);

        $questionnaireField->delete();

        return redirect()
            ->route('questionnaire-items.index', $page)
            ->with('success', 'Field kuesioner dihapus.');
    }

    private function ensureQuestionnaire(Page $page): void
    {
        if ($page->layout_type !== 'kuesioner') {
            abort(404);
        }
    }

    private function ensureFieldBelongsToPage(Page $page, QuestionnaireField $field): void
    {
        if ($field->page_id !== $page->id) {
            abort(404);
        }
    }

    private function validateFieldRequirements(array $validated): void
    {
        $type = $validated['type'];
        $label = trim((string) ($validated['label'] ?? ''));
        $content = trim((string) ($validated['content'] ?? ''));

        if ($type === 'text' && $content === '') {
            throw ValidationException::withMessages([
                'content' => 'Konten wajib diisi.',
            ]);
        }

        if ($type !== 'text' && $label === '') {
            throw ValidationException::withMessages([
                'label' => 'Label wajib diisi.',
            ]);
        }

        if ($type === 'select') {
            $options = $validated['options'] ?? [];
            $hasOptions = is_array($options) && count($options) > 0;
            if (!$hasOptions) {
                throw ValidationException::withMessages([
                    'options' => 'Minimal 1 opsi wajib diisi.',
                ]);
            }
        }
    }

    private function mapOptions(array $validated)
    {
        if (($validated['type'] ?? '') !== 'select') {
            return collect();
        }

        return collect($validated['options'] ?? [])
            ->values()
            ->map(function ($option, $index) {
                return [
                    'label' => $option['label'],
                    'order' => $option['order'] ?? $index,
                ];
            });
    }
}
