<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\QuestionnaireItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class QuestionnaireItemController extends Controller
{
    public function index(Page $page)
    {
        $this->ensureQuestionnaire($page);

        $sections = $page->questionnaireSections()
            ->orderBy('order')
            ->orderBy('created_at')
            ->get(['id', 'title', 'description', 'order']);

        $activeSectionId = request()->get('section');
        $activeSectionId = $activeSectionId ? (int) $activeSectionId : null;

        if ($activeSectionId && !$sections->contains('id', $activeSectionId)) {
            $activeSectionId = null;
        }

        if (!$activeSectionId && $sections->isNotEmpty()) {
            $activeSectionId = $sections->first()->id;
        }

        $fields = $page->questionnaireFields()
            ->with(['options' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            }])
            ->orderBy('order')
            ->orderBy('created_at')
            ->get()
            ->map(function ($field) {
                return [
                    'id' => $field->id,
                    'type' => $field->type,
                    'label' => $field->label,
                    'placeholder' => $field->placeholder,
                    'input_type' => $field->input_type,
                    'content' => $field->content,
                    'order' => $field->order,
                    'options' => $field->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'label' => $option->label,
                            'order' => $option->order,
                        ];
                    })->values(),
                ];
            })
            ->values();

        $items = $page->questionnaireItems()
            ->with(['options' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            }])
            ->when(
                $sections->isNotEmpty() && $activeSectionId,
                fn ($query) => $query->where('section_id', $activeSectionId),
                fn ($query) => $sections->isEmpty() ? $query->whereNull('section_id') : $query
            )
            ->orderBy('order')
            ->orderBy('created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'section_id' => $item->section_id,
                    'question' => $item->question,
                    'description' => $item->description,
                    'type' => $item->type,
                    'order' => $item->order,
                    'options' => $item->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'label' => $option->label,
                            'order' => $option->order,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return Inertia::render('Questionnaires/Items/Index', [
            'page' => $page->only(['id', 'title']),
            'fields' => $fields,
            'sections' => $sections,
            'activeSectionId' => $activeSectionId,
            'items' => $items,
        ]);
    }

    public function create(Page $page)
    {
        $this->ensureQuestionnaire($page);

        $sections = $page->questionnaireSections()
            ->orderBy('order')
            ->orderBy('created_at')
            ->get(['id', 'title']);

        $activeSectionId = request()->get('section');
        $activeSectionId = $activeSectionId ? (int) $activeSectionId : null;

        if ($activeSectionId && !$sections->contains('id', $activeSectionId)) {
            $activeSectionId = null;
        }

        if (!$activeSectionId && $sections->isNotEmpty()) {
            $activeSectionId = $sections->first()->id;
        }

        return Inertia::render('Questionnaires/Items/Create', [
            'page' => $page->only(['id', 'title']),
            'sections' => $sections,
            'activeSectionId' => $activeSectionId,
        ]);
    }

    public function store(Request $request, Page $page)
    {
        $this->ensureQuestionnaire($page);

        $validated = $request->validate([
            'section_id' => [
                'required',
                Rule::exists('questionnaire_sections', 'id')->where('page_id', $page->id),
            ],
            'question' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:checkbox,radio'],
            'order' => ['nullable', 'integer'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.label' => ['required', 'string', 'max:255'],
        ]);

        $order = $validated['order']
            ?? (($page->questionnaireItems()->max('order') ?? -1) + 1);

        $optionRows = collect($validated['options'])
            ->values()
            ->map(function ($option, $index) {
                return [
                    'label' => $option['label'],
                    'order' => $option['order'] ?? $index,
                ];
            });

        DB::transaction(function () use ($page, $validated, $order, $optionRows) {
            $item = $page->questionnaireItems()->create([
                'section_id' => $validated['section_id'],
                'question' => $validated['question'],
                'description' => $validated['description'],
                'type' => $validated['type'],
                'order' => $order,
            ]);

            $item->options()->createMany($optionRows->all());
        });

        return redirect()
            ->route('questionnaire-items.index', ['page' => $page->id, 'section' => $validated['section_id']])
            ->with('success', 'Item kuesioner dibuat.');
    }

    public function edit(Page $page, QuestionnaireItem $questionnaireItem)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureItemBelongsToPage($page, $questionnaireItem);

        $sections = $page->questionnaireSections()
            ->orderBy('order')
            ->orderBy('created_at')
            ->get(['id', 'title']);

        $questionnaireItem->load(['options' => function ($query) {
            $query->orderBy('order')->orderBy('created_at');
        }]);

        return Inertia::render('Questionnaires/Items/Edit', [
            'page' => $page->only(['id', 'title']),
            'sections' => $sections,
            'item' => [
                'id' => $questionnaireItem->id,
                'section_id' => $questionnaireItem->section_id,
                'question' => $questionnaireItem->question,
                'description' => $questionnaireItem->description,
                'type' => $questionnaireItem->type,
                'order' => $questionnaireItem->order,
                'options' => $questionnaireItem->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'order' => $option->order,
                    ];
                })->values(),
            ],
        ]);
    }

    public function update(Request $request, Page $page, QuestionnaireItem $questionnaireItem)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureItemBelongsToPage($page, $questionnaireItem);

        $validated = $request->validate([
            'section_id' => [
                'required',
                Rule::exists('questionnaire_sections', 'id')->where('page_id', $page->id),
            ],
            'question' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:checkbox,radio'],
            'order' => ['nullable', 'integer'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.label' => ['required', 'string', 'max:255'],
        ]);

        $optionRows = collect($validated['options'])
            ->values()
            ->map(function ($option, $index) {
                return [
                    'label' => $option['label'],
                    'order' => $option['order'] ?? $index,
                ];
            });

        DB::transaction(function () use ($questionnaireItem, $validated, $optionRows) {
            $questionnaireItem->update([
                'section_id' => $validated['section_id'],
                'question' => $validated['question'],
                'description' => $validated['description'],
                'type' => $validated['type'],
                'order' => $validated['order'] ?? $questionnaireItem->order,
            ]);

            $questionnaireItem->options()->delete();
            $questionnaireItem->options()->createMany($optionRows->all());
        });

        return redirect()
            ->route('questionnaire-items.index', ['page' => $page->id, 'section' => $validated['section_id']])
            ->with('success', 'Item kuesioner diperbarui.');
    }

    public function destroy(Page $page, QuestionnaireItem $questionnaireItem)
    {
        $this->ensureQuestionnaire($page);
        $this->ensureItemBelongsToPage($page, $questionnaireItem);

        $questionnaireItem->delete();

        return redirect()
            ->route('questionnaire-items.index', $page)
            ->with('success', 'Item kuesioner dihapus.');
    }

    private function ensureQuestionnaire(Page $page): void
    {
        if ($page->layout_type !== 'kuesioner') {
            abort(404);
        }
    }

    private function ensureItemBelongsToPage(Page $page, QuestionnaireItem $item): void
    {
        if ($item->page_id !== $page->id) {
            abort(404);
        }
    }
}
