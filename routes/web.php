<?php

use App\Http\Controllers\HomeSectionController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PageDocumentController;
use App\Http\Controllers\PageDocumentSectionController;
use App\Models\HomeSection;
use App\Models\Page;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $homeSections = HomeSection::where('is_active', true)
        ->orderBy('order')
        ->get();
        
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'homeSections' => $homeSections,
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
    Route::prefix('pages/{page}')->group(function () {
        Route::resource('document-sections', PageDocumentSectionController::class)
            ->except(['show'])
            ->names('page-document-sections');
        Route::resource('document-sections.documents', PageDocumentController::class)
            ->except(['show'])
            ->names('page-document-sections.documents');
    });

    // Media Management Routes
    Route::resource('media', MediaController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('media/{media}/rename', [MediaController::class, 'rename'])->name('media.rename');
    
    // Menu Management Routes
    Route::resource('menu-items', MenuItemController::class)->except(['show', 'create', 'edit']);
    Route::post('menu-items/reorder', [MenuItemController::class, 'reorder'])->name('menu-items.reorder');
    
    // Home Sections Management Routes
    Route::post('home-sections/reorder', [HomeSectionController::class, 'reorder'])->name('home-sections.reorder');
    Route::resource('home-sections', HomeSectionController::class)->except(['show']);
    
    // Image Upload Routes
    Route::post('upload-image', [ImageUploadController::class, 'upload'])->name('upload.image');
    Route::post('api/upload-images', [ImageUploadController::class, 'uploadMultiple'])->name('upload.images.multiple');
});

require __DIR__.'/settings.php';
