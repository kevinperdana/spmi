<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageDocumentSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PageDocumentSectionController extends Controller
{
    public function index(Page $page)
    {
        $this->authorizePage($page);

        $sections = $page->documentSections()
            ->withCount('documents')
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Pages/DocumentSections/Index', [
            'page' => $page,
            'sections' => $sections,
        ]);
    }

    public function create(Page $page)
    {
        $this->authorizePage($page);

        return Inertia::render('Pages/DocumentSections/Create', [
            'page' => $page,
        ]);
    }

    public function store(Request $request, Page $page)
    {
        $this->authorizePage($page);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $order = $validated['order'] ?? ($page->documentSections()->max('order') ?? -1) + 1;

        $page->documentSections()->create([
            'title' => $validated['title'],
            'order' => $order,
        ]);

        return redirect()
            ->route('page-document-sections.index', $page)
            ->with('success', 'Section created successfully.');
    }

    public function edit(Page $page, PageDocumentSection $documentSection)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);

        return Inertia::render('Pages/DocumentSections/Edit', [
            'page' => $page,
            'section' => $documentSection,
        ]);
    }

    public function update(Request $request, Page $page, PageDocumentSection $documentSection)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $documentSection->update([
            'title' => $validated['title'],
            'order' => $validated['order'] ?? $documentSection->order,
        ]);

        return redirect()
            ->route('page-document-sections.index', $page)
            ->with('success', 'Section updated successfully.');
    }

    public function destroy(Page $page, PageDocumentSection $documentSection)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);

        $documentSection->load('documents');

        foreach ($documentSection->documents as $document) {
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }
        }

        $documentSection->delete();

        return redirect()
            ->route('page-document-sections.index', $page)
            ->with('success', 'Section deleted successfully.');
    }

    private function authorizePage(Page $page): void
    {
        if ($page->user_id !== auth()->id()) {
            abort(403);
        }
    }

    private function ensureSectionBelongsToPage(Page $page, PageDocumentSection $documentSection): void
    {
        if ($documentSection->page_id !== $page->id) {
            abort(404);
        }
    }
}
