<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
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
        $pages = Page::where('user_id', auth()->id())
            ->where(function ($query) {
                $query->whereNull('layout_type')
                    ->orWhere('layout_type', '!=', 'kuesioner');
            })
            ->orderBy('order')
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

        if (in_array($page->slug, ['audit-mutu-internal', 'sop', 'pedoman', 'kebijakan', 'dokumen-spmi'], true)) {
            $user = auth()->user();
            $canDownload = $user && $user->role === 'auditie';

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
                ->with(['items.options' => function ($query) {
                    $query->orderBy('order')->orderBy('created_at');
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

            if ($questionnaireSections->isEmpty()) {
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

                if ($questionnaireItems->isNotEmpty()) {
                    $questionnaireSections = collect([
                        [
                            'id' => 0,
                            'title' => 'Kuesioner',
                            'description' => null,
                            'items' => $questionnaireItems,
                        ],
                    ]);
                }
            }
        }

        return Inertia::render('Pages/Show', [
            'page' => $page,
            'documentSections' => $documentSections,
            'questionnaireFields' => $questionnaireFields,
            'questionnaireSections' => $questionnaireSections,
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
