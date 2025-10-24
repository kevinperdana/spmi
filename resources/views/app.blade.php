<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Light theme is default, but dashboard can use dark mode --}}
        <script>
            // Check if page needs dark mode (e.g. dashboard)
            const isDashboard = window.location.pathname.includes('/dashboard') || 
                               window.location.pathname.includes('/landing-pages') ||
                               window.location.pathname.includes('/settings');
            
            if (isDashboard) {
                // Enable dark mode for dashboard
                document.documentElement.classList.add('dark');
            } else {
                // Force light mode for other pages
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                }
            }
        </script>

        {{-- Inline style to set the HTML background color to light theme --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'SPMI') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=poppins:300,400,500,600,700|montserrat:700" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white text-gray-900">
        @inertia
    </body>
</html>
