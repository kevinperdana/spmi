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
        Schema::create('ami_form_item_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ami_form_item_id')->constrained('ami_form_items')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('value_bool')->nullable();
            $table->decimal('value_number', 12, 4)->nullable();
            $table->timestamps();
            $table->unique(['ami_form_item_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ami_form_item_responses');
    }
};
