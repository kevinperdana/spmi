<?php

namespace App\Http\Middleware;

use App\Models\BrandSetting;
use App\Models\Page;
use App\Models\MenuItem;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $brand = BrandSetting::firstOrCreate([], [
            'name' => 'SPMI',
        ]);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'brand' => [
                'name' => $brand->name,
                'logoUrl' => $brand->logo_url,
            ],
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'menuItems' => MenuItem::with(['page', 'children' => function($query) {
                    $query->where('is_published', true)
                        ->orderBy('order')
                        ->with(['page', 'children.page']);
                }])
                ->whereNull('parent_id')
                ->where('is_published', true)
                ->orderBy('order')
                ->get(),
        ];
    }
}
