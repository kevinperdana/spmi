<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::with(['page', 'children' => function($query) {
                $query->with(['page', 'children.page']);
            }])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $pages = Page::where('is_published', true)->orderBy('title')->get();
        $questionnaireCharts = Page::where('layout_type', 'kuesioner')
            ->where('is_published', true)
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('MenuItems/Index', [
            'menuItems' => $menuItems,
            'pages' => $pages,
            'questionnaireCharts' => $questionnaireCharts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|exists:pages,id',
            'parent_id' => 'nullable|exists:menu_items,id',
            'is_published' => 'boolean',
        ]);

        // Get the next order number
        $maxOrder = MenuItem::where('parent_id', $validated['parent_id'] ?? null)->max('order');
        $validated['order'] = ($maxOrder ?? -1) + 1;

        MenuItem::create($validated);

        return redirect()->route('menu-items.index')
            ->with('success', 'Menu item created successfully.');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|exists:pages,id',
            'parent_id' => 'nullable|exists:menu_items,id',
            'is_published' => 'boolean',
        ]);

        // Prevent setting itself as parent
        if (isset($validated['parent_id']) && $validated['parent_id'] == $menuItem->id) {
            return back()->withErrors(['parent_id' => 'A menu item cannot be its own parent.']);
        }

        $menuItem->update($validated);

        return redirect()->route('menu-items.index')
            ->with('success', 'Menu item updated successfully.');
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();

        return redirect()->route('menu-items.index')
            ->with('success', 'Menu item deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.order' => 'required|integer',
            'items.*.parent_id' => 'nullable|exists:menu_items,id',
        ]);

        foreach ($validated['items'] as $item) {
            MenuItem::where('id', $item['id'])->update([
                'order' => $item['order'],
                'parent_id' => $item['parent_id'],
            ]);
        }

        return response()->json(['message' => 'Menu reordered successfully.']);
    }
}
