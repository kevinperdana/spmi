<?php

namespace App\Http\Controllers;

use App\Models\LandingPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pages = LandingPage::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Builder/Index', [
            'pages' => $pages,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Builder/Editor', [
            'page' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:landing_pages,slug',
            'sections' => 'required|array',
            'global_styles' => 'nullable|array',
            'published' => 'boolean',
        ]);

        $page = LandingPage::create([
            'user_id' => auth()->id(),
            ...$validated,
        ]);

        return redirect()->route('landing-pages.edit', $page->id)
            ->with('success', 'Landing page created successfully');
    }

    /**
     * Display the specified resource (public view).
     */
    public function show(string $slug)
    {
        $page = LandingPage::where('slug', $slug)
            ->where('published', true)
            ->firstOrFail();

        return Inertia::render('Builder/Preview', [
            'page' => $page,
            'isPublic' => true,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LandingPage $landingPage)
    {
        $this->authorize('update', $landingPage);

        return Inertia::render('Builder/Editor', [
            'page' => $landingPage,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LandingPage $landingPage)
    {
        $this->authorize('update', $landingPage);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:landing_pages,slug,' . $landingPage->id,
            'sections' => 'required|array',
            'global_styles' => 'nullable|array',
            'published' => 'boolean',
        ]);

        $landingPage->update($validated);

        return back()->with('success', 'Landing page updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LandingPage $landingPage)
    {
        $this->authorize('delete', $landingPage);

        $landingPage->delete();

        return redirect()->route('landing-pages.index')
            ->with('success', 'Landing page deleted successfully');
    }

    /**
     * Preview the landing page.
     */
    public function preview(LandingPage $landingPage)
    {
        $this->authorize('update', $landingPage);

        return Inertia::render('Builder/Preview', [
            'page' => $landingPage,
            'isPublic' => false,
        ]);
    }
}
