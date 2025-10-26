<?php

namespace App\Http\Controllers;

use App\Models\HomeSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeSectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sections = HomeSection::orderBy('order')->get();
        
        return Inertia::render('HomeSections/Index', [
            'sections' => $sections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('HomeSections/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'layout_type' => 'required|in:full-width,2-equal,3-equal,4-equal,2-sidebar-left,2-sidebar-right',
            'section_type' => 'required|in:plain,card',
            'background_color' => 'required|string',
            'background_config' => 'nullable|array',
            'content' => 'required|array',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if (!isset($validated['order'])) {
            $validated['order'] = HomeSection::max('order') + 1;
        }

        HomeSection::create($validated);

        return redirect()->route('home-sections.index')
            ->with('success', 'Section created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(HomeSection $homeSection)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HomeSection $homeSection)
    {
        return Inertia::render('HomeSections/Edit', [
            'section' => $homeSection,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HomeSection $homeSection)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'layout_type' => 'required|in:full-width,2-equal,3-equal,4-equal,2-sidebar-left,2-sidebar-right',
            'section_type' => 'required|in:plain,card',
            'background_color' => 'required|string',
            'background_config' => 'nullable|array',
            'content' => 'required|array',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $homeSection->update($validated);

        return redirect()->route('home-sections.index')
            ->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HomeSection $homeSection)
    {
        $homeSection->delete();

        return redirect()->route('home-sections.index')
            ->with('success', 'Section deleted successfully.');
    }

    /**
     * Reorder sections.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:home_sections,id',
            'sections.*.order' => 'required|integer',
        ]);

        foreach ($validated['sections'] as $section) {
            HomeSection::where('id', $section['id'])->update(['order' => $section['order']]);
        }

        return back()->with('success', 'Sections reordered successfully.');
    }
}
