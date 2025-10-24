<?php

use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\PageController;
use App\Models\Page;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public Landing Page View
Route::get('/p/{slug}', [LandingPageController::class, 'show'])->name('landing-pages.public');

// Public Page View
Route::get('/page/{slug}', [PageController::class, 'show'])->name('pages.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Landing Page Builder Routes
    Route::resource('landing-pages', LandingPageController::class);
    Route::get('landing-pages/{landingPage}/preview', [LandingPageController::class, 'preview'])
        ->name('landing-pages.preview');

    // Pages Management Routes
    Route::resource('pages', PageController::class)->except(['show']);
    
    // Menu Management Routes
    Route::resource('menu-items', MenuItemController::class)->except(['show', 'create', 'edit']);
    Route::post('menu-items/reorder', [MenuItemController::class, 'reorder'])->name('menu-items.reorder');
    
    // Image Upload Route
    Route::post('upload-image', [ImageUploadController::class, 'upload'])->name('upload.image');
});

require __DIR__.'/settings.php';
