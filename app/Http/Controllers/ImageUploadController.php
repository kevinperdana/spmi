<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // max 5MB
        ]);

        $file = $request->file('image');
        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
        
        // Store in public disk under 'images' folder
        $path = $file->storeAs('images', $filename, 'public');
        
        // Return URL
        return response()->json([
            'url' => Storage::url($path),
        ]);
    }
}
