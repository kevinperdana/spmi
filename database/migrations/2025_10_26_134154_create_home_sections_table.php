<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->integer('order')->default(0);
            $table->string('layout_type'); // 'single', 'two-column', 'two-column-reverse'
            $table->string('section_type')->default('plain'); // 'plain', 'card'
            $table->string('background_color')->default('#ffffff');
            $table->json('content'); // Store heading, text, images, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }
};
