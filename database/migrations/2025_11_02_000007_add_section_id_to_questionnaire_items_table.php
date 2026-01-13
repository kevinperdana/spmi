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
        Schema::table('questionnaire_items', function (Blueprint $table) {
            $table->foreignId('section_id')
                ->nullable()
                ->after('page_id')
                ->constrained('questionnaire_sections')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questionnaire_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('section_id');
        });
    }
};
