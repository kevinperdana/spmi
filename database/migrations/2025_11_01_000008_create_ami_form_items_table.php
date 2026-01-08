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
        Schema::create('ami_form_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('ami_form_sections')->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->text('indicator');
            $table->string('satuan_unit')->default('tersedia');
            $table->string('target_unit')->default('tersedia');
            $table->string('capaian_unit')->default('tersedia');
            $table->string('persentase_unit')->default('persen');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ami_form_items');
    }
};
