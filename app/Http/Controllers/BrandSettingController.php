<?php

namespace App\Http\Controllers;

use App\Models\BrandSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandSettingController extends Controller
{
    public function edit()
    {
        $brand = BrandSetting::firstOrCreate([], [
            'name' => 'SPMI',
        ]);

        return Inertia::render('Branding/Edit', [
            'brand' => [
                'name' => $brand->name,
                'logoUrl' => $brand->logo_url,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logoUrl' => ['nullable', 'string', 'max:2048'],
        ]);

        $brand = BrandSetting::firstOrCreate([], [
            'name' => 'SPMI',
        ]);

        $brand->update([
            'name' => $validated['name'],
            'logo_url' => $validated['logoUrl'] ?: null,
        ]);

        return redirect()
            ->route('branding.edit')
            ->with('success', 'Branding updated successfully.');
    }
}
