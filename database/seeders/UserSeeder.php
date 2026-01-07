<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'role' => 'auditor',
            ],
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Auditor',
                'email' => 'auditor@example.com',
                'role' => 'auditor',
            ],
            [
                'name' => 'Auditie',
                'email' => 'auditie@example.com',
                'role' => 'auditie',
            ],
        ];

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'role' => $user['role'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Seeded users: demo@example.com, admin@example.com, auditor@example.com, auditie@example.com');
        $this->command->info('  Password for all: password');
    }
}
