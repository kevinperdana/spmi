<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Throwable;

class DeveloperController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Developer/Index', [
            'commands' => $this->commands(),
        ]);
    }

    public function run(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403);
        }

        $allowed = collect($this->commands())->pluck('key')->all();

        $validated = $request->validate([
            'command' => ['required', 'string', Rule::in($allowed)],
        ]);

        $commandKey = $validated['command'];

        [$artisanCommand, $arguments] = $this->resolveCommand($commandKey);

        try {
            $exitCode = Artisan::call($artisanCommand, $arguments);
            $output = trim(Artisan::output());

            return response()->json([
                'success' => $exitCode === 0,
                'command' => $commandKey,
                'exitCode' => $exitCode,
                'message' => $exitCode === 0
                    ? 'Perintah berhasil dijalankan.'
                    : 'Perintah selesai dengan error.',
                'output' => $output,
            ], $exitCode === 0 ? 200 : 422);
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'command' => $commandKey,
                'exitCode' => 1,
                'message' => 'Terjadi error saat menjalankan perintah.',
                'output' => $th->getMessage(),
            ], 500);
        }
    }

    private function commands(): array
    {
        return [
            [
                'key' => 'migrate',
                'command' => 'php artisan migrate',
                'description' => 'Menjalankan migration database yang belum dieksekusi.',
                'buttonLabel' => 'Jalankan php artisan migrate',
            ],
            [
                'key' => 'optimize-clear',
                'command' => 'php artisan optimize:clear',
                'description' => 'Membersihkan cache config, route, view, dan cache aplikasi.',
                'buttonLabel' => 'Jalankan php artisan optimize:clear',
            ],
            [
                'key' => 'view-cache',
                'command' => 'php artisan view:cache',
                'description' => 'Membangun ulang cache Blade view agar render lebih cepat.',
                'buttonLabel' => 'Jalankan php artisan view:cache',
            ],
            [
                'key' => 'route-cache',
                'command' => 'php artisan route:cache',
                'description' => 'Membuat cache route untuk meningkatkan performa routing.',
                'buttonLabel' => 'Jalankan php artisan route:cache',
            ],
            [
                'key' => 'config-cache',
                'command' => 'php artisan config:cache',
                'description' => 'Menggabungkan config ke file cache untuk performa lebih baik.',
                'buttonLabel' => 'Jalankan php artisan config:cache',
            ],
        ];
    }

    private function resolveCommand(string $commandKey): array
    {
        return match ($commandKey) {
            'migrate' => ['migrate', ['--force' => true]],
            'optimize-clear' => ['optimize:clear', []],
            'view-cache' => ['view:cache', []],
            'route-cache' => ['route:cache', []],
            'config-cache' => ['config:cache', []],
            default => throw new \InvalidArgumentException('Invalid command.'),
        };
    }
}
