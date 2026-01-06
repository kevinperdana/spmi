# 🔐 Login Credentials

## User Accounts

Silakan gunakan kredensial berikut untuk login:

### User 1 - Demo
```
Email: demo@example.com
Password: password
```

### User 2 - Admin
```
Email: admin@example.com
Password: password
```

### User 3 - Auditor
```
Email: auditor@example.com
Password: password
```

### User 4 - Auditie
```
Email: auditie@example.com
Password: password
```

## Akses Aplikasi

1. Buka browser dan akses: `http://127.0.0.1:8000`
2. Klik tombol **"Log in"** di navbar
3. Masukkan salah satu kredensial di atas
4. Setelah login, Anda bisa akses:
   - **Builder**: `/landing-pages` - Untuk membuat landing page
   - **Dashboard**: `/dashboard` - Halaman dashboard
   - **Settings**: `/settings/profile` - Pengaturan profil

## Halaman Public

- **Home**: `http://127.0.0.1:8000/` - Halaman utama (sekarang sudah ada navbar, banner, sidebar & konten)
- **Landing Page Public**: `/p/{slug}` - Untuk melihat published landing page

## Menjalankan Aplikasi

```bash
# Terminal 1 - Laravel backend
php artisan serve

# Terminal 2 - Vite frontend (jika belum running)
npm run dev
```

---

**Note**: Password default adalah `password` untuk semua user testing. Ganti di production!
