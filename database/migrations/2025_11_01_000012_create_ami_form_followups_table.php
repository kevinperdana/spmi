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
        Schema::create('ami_form_followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ami_form_item_id')->constrained('ami_form_items')->cascadeOnDelete();
            $table->string('type');
            $table->text('decision')->nullable();
            $table->string('target_time')->nullable();
            $table->string('responsible')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            $table->unique(['ami_form_item_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ami_form_followups');
    }
};
