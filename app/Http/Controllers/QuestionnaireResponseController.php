<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\QuestionnaireItem;
use App\Models\QuestionnaireItemResponse;
use App\Models\QuestionnaireResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuestionnaireResponseController extends Controller
{
    public function index(Page $page)
    {
        $this->ensureQuestionnaire($page);

        $fields = $page->questionnaireFields()
            ->where('type', '!=', 'text')
            ->orderBy('order')
            ->orderBy('created_at')
            ->get()
            ->map(function ($field) {
                return [
                    'id' => $field->id,
                    'label' => $field->label,
                    'type' => $field->type,
                ];
            })
            ->values();

        $sections = $page->questionnaireSections()
            ->with(['items' => function ($query) {
                $query->orderBy('order')
                    ->orderBy('created_at')
                    ->with(['options' => function ($optionQuery) {
                        $optionQuery->orderBy('order')->orderBy('created_at');
                    }]);
            }])
            ->orderBy('order')
            ->orderBy('created_at')
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'description' => $section->description,
                    'items' => $section->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'question' => $item->question,
                            'description' => $item->description,
                            'type' => $item->type,
                            'options' => $item->options->map(function ($option) {
                                return [
                                    'id' => $option->id,
                                    'label' => $option->label,
                                ];
                            })->values(),
                        ];
                    })->values(),
                ];
            })
            ->values();

        $items = $page->questionnaireItems()
            ->whereNull('section_id')
            ->with(['options' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            }])
            ->orderBy('order')
            ->orderBy('created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'question' => $item->question,
                    'description' => $item->description,
                    'type' => $item->type,
                    'options' => $item->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'label' => $option->label,
                        ];
                    })->values(),
                ];
            })
            ->values();

        if ($sections->isNotEmpty()) {
            if ($items->isNotEmpty()) {
                $sections = $sections->concat([
                    [
                        'id' => 0,
                        'title' => 'Tanpa Section',
                        'description' => null,
                        'items' => $items,
                    ],
                ])->values();
            }
            $items = collect();
        }

        $responses = QuestionnaireResponse::query()
            ->where('page_id', $page->id)
            ->with([
                'fieldResponses',
                'itemResponses.option',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($response) {
                $fieldMap = $response->fieldResponses
                    ->mapWithKeys(function ($fieldResponse) {
                        return [
                            $fieldResponse->questionnaire_field_id => $fieldResponse->value,
                        ];
                    })
                    ->toArray();

                $itemMap = $response->itemResponses
                    ->groupBy('questionnaire_item_id')
                    ->map(function ($group) {
                        return $group
                            ->map(function ($itemResponse) {
                                return $itemResponse->option?->label;
                            })
                            ->filter()
                            ->values()
                            ->all();
                    })
                    ->toArray();

                return [
                    'id' => $response->id,
                    'created_at' => optional($response->created_at)->toIso8601String(),
                    'fields' => $fieldMap,
                    'items' => $itemMap,
                ];
            })
            ->values();

        return Inertia::render('Questionnaires/Responses/Index', [
            'page' => $page->only(['id', 'title']),
            'fields' => $fields,
            'sections' => $sections,
            'items' => $items,
            'responses' => $responses,
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->where('layout_type', 'kuesioner')
            ->where('is_published', true)
            ->firstOrFail();

        $fields = $page->questionnaireFields()
            ->where('type', '!=', 'text')
            ->with('options')
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        $items = QuestionnaireItem::query()
            ->where('page_id', $page->id)
            ->with('options')
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        $fieldInput = $request->input('fields', []);
        $itemInput = $request->input('items', []);

        if (!is_array($fieldInput)) {
            $fieldInput = [];
        }

        if (!is_array($itemInput)) {
            $itemInput = [];
        }

        $errors = [];
        $fieldInputLookup = collect($fieldInput)
            ->mapWithKeys(function ($value, $key) {
                return [(string) $key => $value];
            });

        foreach ($fields as $field) {
            $rawValue = $fieldInputLookup->get((string) $field->id);
            $value = is_string($rawValue) ? trim($rawValue) : $rawValue;

            if ($field->is_required && ($value === null || $value === '')) {
                $errors["fields.{$field->id}"] = 'Wajib diisi.';
                continue;
            }

            if ($value !== null && $value !== '' && $field->type === 'select') {
                $allowedLabels = $field->options->pluck('label')->all();
                if (!in_array($value, $allowedLabels, true)) {
                    $errors["fields.{$field->id}"] = 'Pilihan tidak valid.';
                }
            }
        }

        $itemMap = $items->keyBy('id');
        foreach ($itemInput as $itemId => $selected) {
            $itemId = (int) $itemId;
            $item = $itemMap->get($itemId);
            if (!$item) {
                continue;
            }

            $selectedValues = is_array($selected) ? $selected : [$selected];
            $selectedValues = array_values(array_filter($selectedValues, function ($value) {
                return $value !== null && $value !== '';
            }));

            if ($item->type === 'radio' && count($selectedValues) > 1) {
                $errors["items.{$itemId}"] = 'Pilih satu jawaban.';
                continue;
            }

            $allowedOptionIds = $item->options->pluck('id')->map(function ($id) {
                return (string) $id;
            })->all();

            foreach ($selectedValues as $optionId) {
                if (!in_array((string) $optionId, $allowedOptionIds, true)) {
                    $errors["items.{$itemId}"] = 'Pilihan tidak valid.';
                    break;
                }
            }
        }

        if (!empty($errors)) {
            return back()->withErrors($errors)->withInput();
        }

        $fieldRows = [];
        foreach ($fields as $field) {
            $rawValue = $fieldInputLookup->get((string) $field->id);
            $value = is_string($rawValue) ? trim($rawValue) : $rawValue;

            if ($value === null || $value === '') {
                continue;
            }

            $fieldRows[] = [
                'questionnaire_field_id' => $field->id,
                'value' => (string) $value,
            ];
        }

        $itemRows = [];
        foreach ($itemInput as $itemId => $selected) {
            $itemId = (int) $itemId;
            $item = $itemMap->get($itemId);
            if (!$item) {
                continue;
            }

            $selectedValues = is_array($selected) ? $selected : [$selected];
            $selectedValues = array_values(array_filter($selectedValues, function ($value) {
                return $value !== null && $value !== '';
            }));

            foreach ($selectedValues as $optionId) {
                $itemRows[] = [
                    'questionnaire_item_id' => $item->id,
                    'questionnaire_option_id' => (int) $optionId,
                ];
            }
        }

        DB::transaction(function () use ($page, $fieldRows, $itemRows) {
            $response = QuestionnaireResponse::create([
                'page_id' => $page->id,
            ]);

            if (!empty($fieldRows)) {
                $response->fieldResponses()->createMany($fieldRows);
            }

            if (!empty($itemRows)) {
                $response->itemResponses()->createMany($itemRows);
            }
        });

        return redirect()->route('pages.show', $page->slug);
    }

    public function charts(Page $page)
    {
        $this->ensureQuestionnaire($page);
        if (! $page->is_published) {
            abort(404);
        }

        $sections = $page->questionnaireSections()
            ->with(['items' => function ($query) {
                $query->orderBy('order')
                    ->orderBy('created_at')
                    ->with(['options' => function ($optionQuery) {
                        $optionQuery->orderBy('order')->orderBy('created_at');
                    }]);
            }])
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        $unsectionedItems = $page->questionnaireItems()
            ->whereNull('section_id')
            ->with(['options' => function ($query) {
                $query->orderBy('order')->orderBy('created_at');
            }])
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        $groups = collect();

        if ($sections->isNotEmpty()) {
            foreach ($sections as $section) {
                $groups->push($this->buildQuestionnaireGroup(
                    $section->id,
                    $section->title,
                    $section->description,
                    $section->items
                ));
            }

            if ($unsectionedItems->isNotEmpty()) {
                $groups->push($this->buildQuestionnaireGroup(
                    0,
                    'Tanpa Section',
                    null,
                    $unsectionedItems
                ));
            }
        } else {
            $groups->push($this->buildQuestionnaireGroup(
                $page->id,
                $page->title,
                null,
                $unsectionedItems
            ));
        }

        $responseCount = QuestionnaireResponse::query()
            ->where('page_id', $page->id)
            ->count();

        return Inertia::render('Pages/Show', [
            'page' => $page->only([
                'id',
                'title',
                'slug',
                'layout_type',
                'content',
                'is_published',
                'order',
                'created_at',
                'updated_at',
            ]),
            'questionnaireChartResponseCount' => $responseCount,
            'questionnaireChartGroups' => $groups->values()->all(),
            'isQuestionnaireChartsPage' => true,
        ]);
    }

    private function ensureQuestionnaire(Page $page): void
    {
        if ($page->layout_type !== 'kuesioner') {
            abort(404);
        }
    }

    private function buildQuestionnaireGroup(
        int $id,
        string $title,
        ?string $description,
        Collection $items
    ): array {
        return [
            'id' => $id,
            'title' => $title,
            'description' => $description,
            'items' => $this->buildQuestionnaireItems($items),
        ];
    }

    private function buildQuestionnaireItems(Collection $items): array
    {
        $itemIds = $items->pluck('id')->filter()->values();
        $counts = collect();

        if ($itemIds->isNotEmpty()) {
            $counts = QuestionnaireItemResponse::query()
                ->select(
                    'questionnaire_item_responses.questionnaire_item_id',
                    'questionnaire_options.id as option_id',
                    'questionnaire_options.label',
                    DB::raw('count(*) as total')
                )
                ->join(
                    'questionnaire_options',
                    'questionnaire_item_responses.questionnaire_option_id',
                    '=',
                    'questionnaire_options.id'
                )
                ->whereIn('questionnaire_item_responses.questionnaire_item_id', $itemIds->all())
                ->groupBy(
                    'questionnaire_item_responses.questionnaire_item_id',
                    'questionnaire_options.id',
                    'questionnaire_options.label'
                )
                ->get()
                ->groupBy('questionnaire_item_id');
        }

        return $items->map(function ($item) use ($counts) {
            $itemCounts = $counts->get($item->id, collect());
            $countMap = $itemCounts->mapWithKeys(function ($row) {
                return [(int) $row->option_id => (int) $row->total];
            });

            $total = (int) $countMap->sum();
            $stats = $item->options->map(function ($option) use ($countMap, $total) {
                $count = (int) ($countMap[$option->id] ?? 0);
                $percent = $total > 0 ? round(($count / $total) * 100, 1) : 0;

                return [
                    'id' => $option->id,
                    'label' => $option->label,
                    'count' => $count,
                    'percent' => $percent,
                ];
            })->values();

            return [
                'id' => $item->id,
                'question' => $item->question,
                'description' => $item->description,
                'total' => $total,
                'stats' => $stats,
            ];
        })->values()->all();
    }
}
