<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageDocument;
use App\Models\PageDocumentSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageDocumentController extends Controller
{
    public function download(PageDocument $document)
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'auditie') {
            abort(403);
        }

        if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        $safeTitle = $document->title ? Str::slug($document->title) : 'document';
        $filename = $safeTitle . '.pdf';

        return Storage::disk('public')->download($document->file_path, $filename);
    }

    public function index(Page $page, PageDocumentSection $documentSection)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);

        $documents = $documentSection->documents()
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Pages/DocumentSections/Documents/Index', [
            'page' => $page,
            'section' => $documentSection,
            'documents' => $documents,
        ]);
    }

    public function create(Page $page, PageDocumentSection $documentSection)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);

        return Inertia::render('Pages/DocumentSections/Documents/Create', [
            'page' => $page,
            'section' => $documentSection,
        ]);
    }

    public function store(Request $request, Page $page, PageDocumentSection $documentSection)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);

        $isSop = in_array($page->slug, ['sop', 'pedoman'], true);
        $isAmi = $page->slug === 'audit-mutu-internal';

        $validated = $request->validate([
            'doc_number' => $isSop ? 'required|string|max:100' : 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'file' => [
                'required',
                'file',
                'max:51200',
                'mimes:pdf',
            ],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::random(40) . ($extension ? '.' . $extension : '');
        $path = $file->storeAs('page-documents', $filename, 'public');

        $order = $validated['order'] ?? ($documentSection->documents()->max('order') ?? -1) + 1;

        $docNumber = $validated['doc_number'] ?? null;
        $description = $validated['description'] ?? null;

        $documentSection->documents()->create([
            'doc_number' => $docNumber !== '' ? $docNumber : null,
            'title' => $validated['title'],
            'description' => $isAmi ? ($description !== '' ? $description : null) : null,
            'file_label' => 'PDF',
            'file_path' => $path,
            'order' => $order,
        ]);

        return redirect()
            ->route('page-document-sections.documents.index', [$page, $documentSection])
            ->with('success', 'Document created successfully.');
    }

    public function edit(Page $page, PageDocumentSection $documentSection, PageDocument $document)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);
        $this->ensureDocumentBelongsToSection($documentSection, $document);

        return Inertia::render('Pages/DocumentSections/Documents/Edit', [
            'page' => $page,
            'section' => $documentSection,
            'document' => $document,
        ]);
    }

    public function update(Request $request, Page $page, PageDocumentSection $documentSection, PageDocument $document)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);
        $this->ensureDocumentBelongsToSection($documentSection, $document);

        $isSop = in_array($page->slug, ['sop', 'pedoman'], true);
        $isAmi = $page->slug === 'audit-mutu-internal';

        $validated = $request->validate([
            'doc_number' => $isSop ? 'required|string|max:100' : 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'file' => [
                'nullable',
                'file',
                'max:51200',
                'mimes:pdf',
            ],
        ]);

        $docNumber = $validated['doc_number'] ?? null;
        $description = $validated['description'] ?? null;

        $payload = [
            'doc_number' => $docNumber !== '' ? $docNumber : null,
            'title' => $validated['title'],
            'description' => $isAmi ? ($description !== '' ? $description : null) : null,
            'file_label' => 'PDF',
            'order' => $validated['order'] ?? $document->order,
        ];

        if ($request->hasFile('file')) {
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }

            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $filename = Str::random(40) . ($extension ? '.' . $extension : '');
            $path = $file->storeAs('page-documents', $filename, 'public');
            $payload['file_path'] = $path;
        }

        $document->update($payload);

        return redirect()
            ->route('page-document-sections.documents.index', [$page, $documentSection])
            ->with('success', 'Document updated successfully.');
    }

    public function destroy(Page $page, PageDocumentSection $documentSection, PageDocument $document)
    {
        $this->authorizePage($page);
        $this->ensureSectionBelongsToPage($page, $documentSection);
        $this->ensureDocumentBelongsToSection($documentSection, $document);

        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()
            ->route('page-document-sections.documents.index', [$page, $documentSection])
            ->with('success', 'Document deleted successfully.');
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

    private function ensureDocumentBelongsToSection(PageDocumentSection $documentSection, PageDocument $document): void
    {
        if ($document->section_id !== $documentSection->id) {
            abort(404);
        }
    }
}
