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
        Schema::table('pages', function (Blueprint $table) {
            $table->string('secondary_slug')->nullable()->unique()->after('slug');
            $table->string('active_slug_source')->default('primary')->after('secondary_slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn('active_slug_source');
            $table->dropUnique(['secondary_slug']);
            $table->dropColumn('secondary_slug');
        });
    }
};
