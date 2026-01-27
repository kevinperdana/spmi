<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\QuestionnaireItemResponse;
use App\Models\QuestionnaireResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        $query = Page::query()
            ->where(function ($query) {
                $query->whereNull('layout_type')
                    ->orWhere('layout_type', '!=', 'kuesioner');
            });

        if (! $user || $user->role !== 'admin') {
            $query->where('user_id', $user?->id);
        }

        $pages = $query->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Pages/Index', [
            'pages' => $pages,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pages/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'layout_type' => 'nullable|string',
            'content' => 'nullable',  // Can be string or JSON
            'is_published' => 'boolean',
            'order' => 'integer',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Convert content array to JSON string if needed
        if (isset($validated['content']) && is_array($validated['content'])) {
            $validated['content'] = json_encode($validated['content']);
        }

        $page = auth()->user()->pages()->create($validated);

        return redirect()->route('pages.index')
            ->with('success', 'Page created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        $page = Page::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $documentSections = collect();
        $canDownload = false;
        $questionnaireItems = collect();
        $questionnaireFields = collect();
        $questionnaireSections = collect();
        $questionnaireResults = collect();
        $isQuestionnaireResultsPage = $page->slug === 'hasil-kuesioner';

        if (in_array($page->slug, ['audit-mutu-internal', 'sop', 'pedoman', 'kebijakan', 'dokumen-spmi', 'rtm-rtl'], true)) {
            $canDownload = true;

            $documentSections = $page->documentSections()
                ->with(['documents' => function ($query) {
                    $query->orderBy('order')->orderBy('created_at');
                }])
                ->orderBy('order')
                ->orderBy('created_at')
                ->get()
                ->map(function ($section) use ($canDownload) {
                    return [
                        'id' => $section->id,
                        'title' => $section->title,
                        'documents' => $section->documents->map(function ($document) use ($canDownload) {
                            return [
                                'id' => $document->id,
                                'doc_number' => $document->doc_number,
                                'title' => $document->title,
                                'description' => $document->description,
                                'file_label' => $document->file_label,
                                'download_url' => $canDownload ? route('page-documents.download', $document) : null,
                            ];
                        })->values(),
                    ];
                })
                ->values();
        }

        if ($page->layout_type === 'kuesioner') {
            $questionnaireFields = $page->questionnaireFields()
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
                        'is_required' => $field->is_required,
                        'options' => $field->options->map(function ($option) {
                            return [
                                'id' => $option->id,
                                'label' => $option->label,
                            ];
                        })->values(),
                    ];
                })
                ->values();

            $questionnaireSections = $page->questionnaireSections()
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

            $questionnaireItems = $page->questionnaireItems()
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

            if ($questionnaireSections->isNotEmpty() && $questionnaireItems->isNotEmpty()) {
                $questionnaireSections = $questionnaireSections->concat([
                    [
                        'id' => 0,
                        'title' => 'Tanpa Section',
                        'description' => null,
                        'items' => $questionnaireItems,
                    ],
                ])->values();
            }
        }

        if ($isQuestionnaireResultsPage) {
            $questionnaireResults = $this->buildQuestionnaireResults();
        }

        return Inertia::render('Pages/Show', [
            'page' => $page,
            'documentSections' => $documentSections,
            'questionnaireFields' => $questionnaireFields,
            'questionnaireItems' => $questionnaireItems,
            'questionnaireSections' => $questionnaireSections,
            'questionnaireResults' => $questionnaireResults,
            'isQuestionnaireResultsPage' => $isQuestionnaireResultsPage,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Page $page)
    {
        $this->authorize('update', $page);

        return Inertia::render('Pages/Edit', [
            'page' => $page,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        $this->authorize('update', $page);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $page->id,
            'layout_type' => 'nullable|string',
            'content' => 'nullable',  // Can be string or JSON
            'is_published' => 'boolean',
            'order' => 'integer',
        ]);

        // Convert content array to JSON string if needed
        if (isset($validated['content']) && is_array($validated['content'])) {
            $validated['content'] = json_encode($validated['content']);
        }

        $page->update($validated);

        return redirect()->route('pages.index')
            ->with('success', 'Page updated successfully.');
    }

    private function buildQuestionnaireResults(): Collection
    {
        $questionnaires = Page::query()
            ->where('layout_type', 'kuesioner')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'slug']);

        return $questionnaires->map(function (Page $questionnaire) {
            $sections = $questionnaire->questionnaireSections()
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

            $unsectionedItems = $questionnaire->questionnaireItems()
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
                        $section->items
                    ));
                }

                if ($unsectionedItems->isNotEmpty()) {
                    $groups->push($this->buildQuestionnaireGroup(
                        0,
                        'Tanpa Section',
                        $unsectionedItems
                    ));
                }
            } else {
                $groups->push($this->buildQuestionnaireGroup(
                    $questionnaire->id,
                    $questionnaire->title,
                    $unsectionedItems
                ));
            }

            $responseCount = QuestionnaireResponse::query()
                ->where('page_id', $questionnaire->id)
                ->count();

            return [
                'id' => $questionnaire->id,
                'title' => $questionnaire->title,
                'slug' => $questionnaire->slug,
                'response_count' => $responseCount,
                'groups' => $groups->values()->all(),
            ];
        });
    }

    private function buildQuestionnaireGroup(int $id, string $title, Collection $items): array
    {
        $itemIds = $items->pluck('id')->filter()->values();
        $optionLabels = $items
            ->flatMap(function ($item) {
                return $item->options->pluck('label');
            })
            ->filter()
            ->unique()
            ->values();

        $counts = collect();
        if ($itemIds->isNotEmpty()) {
            $counts = QuestionnaireItemResponse::query()
                ->select('questionnaire_options.label', DB::raw('count(*) as total'))
                ->join('questionnaire_options', 'questionnaire_item_responses.questionnaire_option_id', '=', 'questionnaire_options.id')
                ->whereIn('questionnaire_item_responses.questionnaire_item_id', $itemIds->all())
                ->groupBy('questionnaire_options.label')
                ->pluck('total', 'label');
        }

        $total = (int) $counts->sum();
        $stats = $optionLabels->map(function ($label) use ($counts, $total) {
            $count = (int) ($counts[$label] ?? 0);
            $percent = $total > 0 ? round(($count / $total) * 100, 1) : 0;

            return [
                'label' => $label,
                'count' => $count,
                'percent' => $percent,
            ];
        })->values();

        return [
            'id' => $id,
            'title' => $title,
            'total' => $total,
            'item_count' => $items->count(),
            'stats' => $stats,
        ];
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $this->authorize('delete', $page);

        $page->delete();

        return redirect()->route('pages.index')
            ->with('success', 'Page deleted successfully.');
    }
}
