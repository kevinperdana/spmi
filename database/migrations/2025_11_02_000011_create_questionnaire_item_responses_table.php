<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_item_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('questionnaire_response_id')
                ->constrained('questionnaire_responses')
                ->cascadeOnDelete();
            $table->foreignId('questionnaire_item_id')
                ->constrained('questionnaire_items')
                ->cascadeOnDelete();
            $table->foreignId('questionnaire_option_id')
                ->constrained('questionnaire_options')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['questionnaire_response_id', 'questionnaire_option_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_item_responses');
    }
};
