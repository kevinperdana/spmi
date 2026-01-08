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
        Schema::table('ami_form_items', function (Blueprint $table) {
            $table->decimal('target_value', 12, 4)->nullable()->after('target_unit');
            $table->decimal('capaian_value', 12, 4)->nullable()->after('capaian_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ami_form_items', function (Blueprint $table) {
            $table->dropColumn(['target_value', 'capaian_value']);
        });
    }
};
