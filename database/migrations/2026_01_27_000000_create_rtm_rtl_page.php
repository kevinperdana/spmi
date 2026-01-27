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
        $exists = DB::table('pages')->where('slug', 'rtm-rtl')->exists();
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
            'title' => 'RTM & RTL',
            'slug' => 'rtm-rtl',
            'content' => null,
            'layout_type' => null,
            'is_published' => true,
            'order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pageId = DB::table('pages')->where('slug', 'rtm-rtl')->value('id');
        if (!$pageId) {
            return;
        }

        $sectionExists = DB::table('page_document_sections')
            ->where('page_id', $pageId)
            ->exists();

        if ($sectionExists) {
            return;
        }

        DB::table('page_document_sections')->insert([
            'page_id' => $pageId,
            'title' => 'RTM & RTL',
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
        DB::table('pages')->where('slug', 'rtm-rtl')->delete();
    }
};
