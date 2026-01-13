import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { defineConfig } from 'vite';

const phpBinary = (() => {
    if (process.env.WAYFINDER_PHP) {
        return process.env.WAYFINDER_PHP;
    }
    if (process.platform === 'darwin' && fs.existsSync('/usr/bin/php')) {
        return '/usr/bin/php';
    }
    return 'php';
})();

const canRunWayfinder = (() => {
    try {
        const version = execSync(`${phpBinary} -r "echo PHP_VERSION;"`, {
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString()
            .trim();
        const [major, minor] = version.split('.').map((part) => Number(part));
        if (!Number.isFinite(major) || !Number.isFinite(minor)) {
            return false;
        }
        return major > 8 || (major === 8 && minor >= 2);
    } catch {
        return false;
    }
})();

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        ...(canRunWayfinder
            ? [
                wayfinder({
                    formVariants: true,
                    command: `${phpBinary} artisan wayfinder:generate`,
                }),
            ]
            : []),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
    },
});
