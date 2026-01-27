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
        DB::table('pages')->whereIn('slug', ['rtm', 'rtl'])->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $userId = DB::table('users')
            ->where('email', 'admin@example.com')
            ->value('id');

        if (!$userId) {
            return;
        }

        $pages = [
            [
                'title' => 'RTM',
                'slug' => 'rtm',
            ],
            [
                'title' => 'RTL',
                'slug' => 'rtl',
            ],
        ];

        foreach ($pages as $page) {
            $exists = DB::table('pages')->where('slug', $page['slug'])->exists();
            if ($exists) {
                continue;
            }

            DB::table('pages')->insert([
                'user_id' => $userId,
                'title' => $page['title'],
                'slug' => $page['slug'],
                'content' => null,
                'layout_type' => null,
                'is_published' => true,
                'order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
