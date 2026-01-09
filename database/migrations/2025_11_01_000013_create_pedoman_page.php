<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $exists = DB::table('pages')->where('slug', 'pedoman')->exists();
        if ($exists) {
            return;
        }

        $userId = DB::table('users')
            ->where('email', 'admin@example.com')
            ->value('id');

        if (!$userId) {
            return;
        }

        DB::table('pages')->insert([
            'user_id' => $userId,
            'title' => 'Pedoman',
            'slug' => 'pedoman',
            'content' => null,
            'layout_type' => null,
            'is_published' => true,
            'order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('pages')->where('slug', 'pedoman')->delete();
    }
};
