<?php

namespace App\Http\Controllers;

use App\Models\PageDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DocsManagementController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $documents = PageDocument::query()
            ->with(['section.page'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (PageDocument $document) => $this->transformDocument($document))
            ->values();

        return Inertia::render('DocsManagement/Index', [
            'documents' => $documents,
        ]);
    }

    public function rename(Request $request, PageDocument $document)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $document->update([
            'title' => $validated['title'],
        ]);

        return response()->json([
            'success' => true,
            'document' => $this->transformDocument($document->fresh(['section.page'])),
        ]);
    }

    public function destroy(Request $request, PageDocument $document)
    {
        $this->authorizeAdmin($request);

        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function setManualShortUrl(Request $request, PageDocument $document)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'short_url' => ['required', 'string', 'max:255'],
        ]);

        $normalized = ltrim(trim($validated['short_url']), '/');
        if (!str_starts_with(strtolower($normalized), 'pagedocs/')) {
            throw ValidationException::withMessages([
                'short_url' => 'URL harus diawali dengan pagedocs/',
            ]);
        }

        $key = substr($normalized, strlen('pagedocs/'));
        if ($key === '' || str_contains($key, '/')) {
            throw ValidationException::withMessages([
                'short_url' => 'Format URL manual tidak valid.',
            ]);
        }

        if (str_contains($key, '-')) {
            throw ValidationException::withMessages([
                'short_url' => 'URL manual tidak boleh mengandung karakter dash (-).',
            ]);
        }

        if (!preg_match('/^[A-Za-z0-9.]+$/', $key)) {
            throw ValidationException::withMessages([
                'short_url' => 'URL manual hanya boleh huruf, angka, dan titik.',
            ]);
        }

        $exists = PageDocument::query()
            ->where('short_url_key', $key)
            ->where('id', '!=', $document->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'short_url' => 'URL manual sudah dipakai dokumen lain.',
            ]);
        }

        $document->update([
            'short_url_key' => $key,
        ]);

        return response()->json([
            'success' => true,
            'document' => $this->transformDocument($document->fresh(['section.page'])),
        ]);
    }

    public function generateAutomaticShortUrl(Request $request, PageDocument $document)
    {
        $this->authorizeAdmin($request);

        do {
            $key = (string) random_int(100000, 999999);
        } while (PageDocument::query()
            ->where('short_url_key', $key)
            ->where('id', '!=', $document->id)
            ->exists());

        $document->update([
            'short_url_key' => $key,
        ]);

        return response()->json([
            'success' => true,
            'document' => $this->transformDocument($document->fresh(['section.page'])),
        ]);
    }

    public function resolveShortUrl(string $key)
    {
        if ($key === '' || str_contains($key, '-') || str_contains($key, '/')) {
            abort(404);
        }

        if (!preg_match('/^[A-Za-z0-9.]+$/', $key)) {
            abort(404);
        }

        $document = PageDocument::query()
            ->where('short_url_key', $key)
            ->firstOrFail();

        if (!$document->file_path || !Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return redirect($document->file_url);
    }

    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403);
        }
    }

    private function transformDocument(PageDocument $document): array
    {
        $disk = Storage::disk('public');
        $size = 0;
        $mimeType = null;

        if ($document->file_path && $disk->exists($document->file_path)) {
            try {
                $size = (int) ($disk->size($document->file_path) ?? 0);
            } catch (\Throwable) {
                $size = 0;
            }

            try {
                $mimeType = $disk->mimeType($document->file_path) ?: null;
            } catch (\Throwable) {
                $mimeType = null;
            }
        }

        $extension = strtolower(pathinfo($document->file_path ?? '', PATHINFO_EXTENSION));
        $title = trim($document->title ?? '');
        $hasTitleExtension = $extension !== '' && str_ends_with(strtolower($title), '.' . $extension);

        $displayName = $title !== ''
            ? ($hasTitleExtension ? $title : ($extension !== '' ? $title . '.' . $extension : $title))
            : ($document->file_path ? basename($document->file_path) : 'Untitled');

        return [
            'id' => $document->id,
            'title' => $document->title,
            'display_name' => $displayName,
            'file_path' => $document->file_path,
            'file_url' => $document->file_url,
            'short_url_key' => $document->short_url_key,
            'short_url' => $document->short_url_key ? url('/pagedocs/' . $document->short_url_key) : null,
            'short_url_path' => $document->short_url_key ? 'pagedocs/' . $document->short_url_key : null,
            'mime_type' => $mimeType ?? ($extension === 'pdf' ? 'application/pdf' : null),
            'size' => $size,
            'source' => $document->section?->page?->title ?? ($document->section?->title ?? 'Tanpa Halaman'),
        ];
    }
}
