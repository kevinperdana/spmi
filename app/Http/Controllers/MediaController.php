<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Media/Index', [
            'media' => $media,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => ['required', 'array'],
            'files.*' => [
                'file',
                'max:51200',
                'mimes:jpeg,jpg,png,gif,webp,svg,pdf,mp4,webm,ogg,mov,avi,doc,docx,xls,xlsx,ppt,pptx,txt,csv,rtf',
            ],
        ]);

        $files = $request->file('files', []);
        $uploaded = [];

        try {
            foreach ($files as $file) {
                $extension = strtolower($file->getClientOriginalExtension());
                $filename = Str::random(40) . ($extension ? '.' . $extension : '');
                $path = $file->storeAs('media', $filename, 'public');

                if (!$path) {
                    continue;
                }

                $uploaded[] = Media::create([
                    'user_id' => auth()->id(),
                    'disk' => 'public',
                    'path' => $path,
                    'file_name' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'extension' => $extension ?: null,
                    'size' => $file->getSize() ?? 0,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Media upload failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }

        if (empty($uploaded)) {
            return response()->json([
                'error' => 'No files were uploaded.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'items' => $uploaded,
        ]);
    }

    public function update(Request $request, Media $media)
    {
        if ($media->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'original_name' => ['required', 'string', 'max:255'],
        ]);

        $media->update([
            'original_name' => $validated['original_name'],
        ]);

        return response()->json([
            'success' => true,
            'item' => $media,
        ]);
    }

    public function rename(Request $request, Media $media)
    {
        return $this->update($request, $media);
    }

    public function destroy(Media $media)
    {
        if ($media->user_id !== auth()->id()) {
            abort(403);
        }

        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return redirect()->route('media.index')
            ->with('success', 'Media deleted successfully.');
    }
}
