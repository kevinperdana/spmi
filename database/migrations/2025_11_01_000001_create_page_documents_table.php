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
        Schema::create('page_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')
                ->constrained('page_document_sections')
                ->onDelete('cascade');
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('file_label')->default('PDF');
            $table->string('file_path');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_documents');
    }
};
