<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|mimes:jpeg,jpg,png,gif,webp,svg|max:5120', // max 5MB
            ]);

            $file = $request->file('image');
            
            if (!$file) {
                return response()->json([
                    'error' => 'No file uploaded'
                ], 400);
            }
            
            $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
            
            // Store in public disk under 'images' folder
            $path = $file->storeAs('images', $filename, 'public');
            
            if (!$path) {
                return response()->json([
                    'error' => 'Failed to store file'
                ], 500);
            }
            
            $url = Storage::url($path);
            
            Log::info('Image uploaded successfully', [
                'filename' => $filename,
                'path' => $path,
                'url' => $url
            ]);
            
            // Return URL
            return response()->json([
                'url' => $url,
                'path' => $path,
                'success' => true
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Image upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadMultiple(Request $request)
    {
        try {
            $request->validate([
                'images' => 'required|array',
                'images.*' => 'file|mimes:jpeg,jpg,png,gif,webp,svg|max:5120', // max 5MB each
            ]);

            $files = $request->file('images');
            
            if (!$files || count($files) === 0) {
                return response()->json([
                    'error' => 'No files uploaded'
                ], 400);
            }
            
            $urls = [];
            $paths = [];
            
            foreach ($files as $file) {
                $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
                
                // Store in public disk under 'images' folder
                $path = $file->storeAs('images', $filename, 'public');
                
                if ($path) {
                    $url = Storage::url($path);
                    $urls[] = $url;
                    $paths[] = $path;
                    
                    Log::info('Image uploaded successfully', [
                        'filename' => $filename,
                        'path' => $path,
                        'url' => $url
                    ]);
                }
            }
            
            if (count($urls) === 0) {
                return response()->json([
                    'error' => 'Failed to store files'
                ], 500);
            }
            
            // Return URLs
            return response()->json([
                'urls' => $urls,
                'paths' => $paths,
                'success' => true
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Multiple image upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
