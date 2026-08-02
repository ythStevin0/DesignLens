DesignLens – Platform Evaluasi UI/UX Website Berbasis AI dan Community Review
Deskripsi

DesignLens merupakan platform yang membantu pemilik website memperoleh masukan terhadap kualitas desain User Interface (UI) dan User Experience (UX). Pengguna dapat mengirimkan website melalui URL maupun upload screenshot, kemudian memilih metode evaluasi sesuai kebutuhan.

Platform menyediakan dua jenis evaluasi yang berjalan secara terpisah:

AI Review

AI akan menganalisis tampilan website berdasarkan prinsip dasar UI/UX, seperti tata letak (layout), tipografi, warna, navigasi, dan Call-to-Action (CTA). Hasil analisis hanya dapat dilihat oleh pemilik website sebagai bahan evaluasi pribadi.

Community Review

Pengguna dapat mempublikasikan website ke halaman komunitas agar memperoleh masukan dari pengguna lain atau reviewer. Community memberikan komentar, saran, dan berdiskusi mengenai desain website tanpa mengetahui hasil analisis AI, sehingga setiap tanggapan bersifat independen dan objektif.

Dengan memisahkan AI Review dan Community Review, pemilik website dapat memperoleh dua sudut pandang yang berbeda, yaitu analisis otomatis dari AI dan pengalaman langsung dari pengguna lain.

Tujuan Sistem
Membantu developer, mahasiswa, UI/UX designer, dan UMKM mengevaluasi kualitas tampilan website.
Memberikan alternatif evaluasi melalui AI maupun komunitas.
Menjadi wadah diskusi dan berbagi masukan mengenai desain website.
Membantu pemilik website melakukan perbaikan desain berdasarkan feedback yang diterima.
Konsep Utama

Platform ini tidak bertujuan menggantikan peran UI/UX Designer, melainkan menjadi media yang mempermudah proses memperoleh feedback terhadap sebuah website. AI digunakan untuk memberikan evaluasi awal secara cepat, sedangkan Community Review menjadi ruang diskusi yang memungkinkan pengguna mendapatkan perspektif manusia secara langsung.

## Panduan Instalasi & Kontribusi (Untuk Tim/Developer Baru)

Jika teman Anda ingin bergabung dan menjalankan project ini secara lokal (termasuk setup database) tanpa kendala, ikuti langkah-langkah berikut:

### 1. Persiapan Kebutuhan Sistem (Prerequisites)
Pastikan Anda sudah menginstal:
- **Node.js** (Versi 18 atau 20+)
- **Git**
- **Docker & Docker Desktop** (Untuk menjalankan database PostgreSQL secara instan)

### 2. Clone Repositori
Clone project ini ke komputer lokal Anda:
```bash
git clone <url-repo-ini>
cd DesignLens
```

### 3. Install Dependensi
Karena project ini menggunakan sistem monorepo (npm workspaces), install semua package dari folder utama (root):
```bash
npm install
```

### 4. Konfigurasi Environment Variables (.env)
Project ini membutuhkan dua file `.env` (satu di folder root, dan satu di folder backend).
Copy file template `.env` ke kedua lokasi:
```bash
# Di OS Windows (PowerShell):
Copy-Item .env.example .env
Copy-Item .env.example apps/api/.env

# Di Mac/Linux:
cp .env.example .env
cp .env.example apps/api/.env
```
*(Catatan: `DATABASE_URL` di dalam file `.env.example` sudah disesuaikan secara default untuk terkoneksi ke Docker container yang akan kita buat di langkah berikutnya).*

### 5. Jalankan Database (PostgreSQL via Docker)
Pastikan Docker Desktop sudah menyala, lalu jalankan perintah ini di folder utama:
```bash
docker-compose up -d
```
*Perintah ini akan mengunduh dan menjalankan database PostgreSQL di port 5433 (sehingga tidak bentrok jika Anda punya postgres lain di PC).*

### 6. Sinkronisasi Skema Database & Seeding Data Awal
Masuk ke folder backend untuk memasukkan struktur tabel dan data awal (seperti kategori website):
```bash
cd apps/api
npx prisma db push
npx prisma db seed
cd ../..
```

### 7. Jalankan Aplikasi (Frontend & Backend)
Dari folder utama (root), Anda bisa menjalankan backend dan frontend secara bersamaan dengan satu perintah:
```bash
npm run dev
```
Tunggu beberapa saat, lalu buka:
- **Frontend (Web):** http://localhost:3000
- **Backend (API):** http://localhost:4000/api

🎉 **Selesai!** Teman Anda sekarang bisa mulai berkontribusi tanpa ada kendala database.
