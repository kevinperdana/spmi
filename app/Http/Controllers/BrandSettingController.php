<?php

namespace App\Http\Controllers;

use App\Models\BrandSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class BrandSettingController extends Controller
{
    public function favicon(Request $request)
    {
        $brand = BrandSetting::first();
        $logoUrl = $brand?->logo_url;

        if (!$logoUrl) {
            return $this->fallbackFavicon();
        }

        $cacheKey = 'branding.favicon.' . md5($logoUrl . '|' . $brand->updated_at);

        $svg = Cache::remember($cacheKey, 3600, function () use ($logoUrl) {
            $logoData = $this->fetchLogoData($logoUrl);
            if (!$logoData) {
                return null;
            }

            $dataUri = 'data:' . $logoData['mime'] . ';base64,' . base64_encode($logoData['contents']);
            $dataUriEscaped = htmlspecialchars($dataUri, ENT_QUOTES, 'UTF-8');

            return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>"
                . "<defs><clipPath id='r'><rect width='64' height='64' rx='30' ry='30'/></clipPath></defs>"
                . "<image href='{$dataUriEscaped}' width='64' height='64' preserveAspectRatio='xMidYMid slice' clip-path='url(#r)'/>"
                . '</svg>';
        });

        if (!$svg) {
            return $this->fallbackFavicon();
        }

        return response($svg, 200)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }

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

    protected function fetchLogoData(string $logoUrl): ?array
    {
        if (str_starts_with($logoUrl, 'data:')) {
            if (preg_match('/^data:([^;]+);base64,(.*)$/', $logoUrl, $matches) !== 1) {
                return null;
            }

            $contents = base64_decode($matches[2], true);
            if ($contents === false) {
                return null;
            }

            return [
                'mime' => $matches[1],
                'contents' => $contents,
            ];
        }

        if (filter_var($logoUrl, FILTER_VALIDATE_URL)) {
            $response = Http::timeout(3)->get($logoUrl);
            if (!$response->ok()) {
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $mime = strtolower(trim(strtok($contentType, ';'))) ?: $this->guessMimeFromUrl($logoUrl);

            return [
                'mime' => $mime,
                'contents' => $response->body(),
            ];
        }

        $publicPath = public_path(ltrim($logoUrl, '/'));
        if (!is_file($publicPath) && str_starts_with($logoUrl, '/storage/')) {
            $storagePath = storage_path('app/public/' . ltrim(substr($logoUrl, 9), '/'));
            if (is_file($storagePath)) {
                $publicPath = $storagePath;
            }
        }

        if (!is_file($publicPath)) {
            return null;
        }

        $contents = file_get_contents($publicPath);
        if ($contents === false) {
            return null;
        }

        $mime = mime_content_type($publicPath) ?: $this->guessMimeFromUrl($logoUrl);

        return [
            'mime' => $mime,
            'contents' => $contents,
        ];
    }

    protected function guessMimeFromUrl(string $logoUrl): string
    {
        $extension = strtolower(pathinfo(parse_url($logoUrl, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
        return match ($extension) {
            'svg' => 'image/svg+xml',
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'image/png',
        };
    }

    protected function fallbackFavicon()
    {
        $svgPath = public_path('favicon.svg');
        if (is_file($svgPath)) {
            return response()->file($svgPath, [
                'Content-Type' => 'image/svg+xml',
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        $icoPath = public_path('favicon.ico');
        if (is_file($icoPath)) {
            return response()->file($icoPath, [
                'Content-Type' => 'image/x-icon',
                'Cache-Control' => 'public, max-age=3600',
            ]);
        }

        return response('', 204);
    }
}
