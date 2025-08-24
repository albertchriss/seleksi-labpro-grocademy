# Grocademy

  * **Nama:** Albertus Christian Poandy
  * **NIM:** 13523077

-----

## Cara Menjalankan Aplikasi

Kunjungi [https://labpro.cpoandy.me](https://labpro.cpoandy.me)

### Cara menjalankan secara lokal

Pastikan Anda telah menginstal Docker di mesin Anda.

1.  **Clone repositori:**

    ```bash
    git clone https://github.com/albertchriss/seleksi-labpro-grocademy.git
    cd seleksi-labpro-grocademy
    ```

2.  Buat file `.env` dari contoh yang ada dan isi variabel yang diperlukan.

3.  **Jalankan dengan Docker Compose:**

    ```bash
    docker-compose up -d
    ```

4.  **Akses aplikasi:** Buka peramban dan navigasi ke `http://localhost:3000`.

-----

## *Technology Stack*

  * **Backend:**
      * NestJS
      * TypeScript
      * PostgreSQL
      * TypeORM
      * Passport.js (untuk otentikasi)
  * **Frontend:**
      * EJS (Embedded JavaScript templates)
      * Tailwind CSS
  * **Lainnya:**
      * Docker
      * MinIO (untuk penyimpanan objek)
      * Puppeteer (untuk pembuatan PDF)

-----

## *Endpoint* API

Berikut adalah daftar *endpoint* API utama yang telah dibuat:

  * **Autentikasi**
      * `POST /api/auth/login`
      * `POST /api/auth/register`
      * `GET /api/auth/self`
      * `GET /api/auth/google`
      * `GET /api/auth/google/callback`
  * **Kursus**
      * `GET /api/courses`
      * `POST /api/courses`
      * `GET /api/courses/my-courses`
      * `GET /api/courses/subscribe`
      * `GET /api/courses/:id`
      * `PUT /api/courses/:id`
      * `DELETE /api/courses/:id`
      * `POST /api/courses/:id/buy`
      * `GET /api/courses/:id/certificate`
      * `POST /api/courses/:courseId/modules`
      * `GET /api/courses/:courseId/modules`
      * `PATCH /api/courses/:courseId/modules/reorder`
  * **Modul**
      * `GET /api/modules/:id`
      * `PUT /api/modules/:id`
      * `DELETE /api/modules/:id`
      * `PATCH /api/modules/:id/complete`
  * **Pengguna**
      * `GET /api/users`
      * `GET /api/users/:id`
      * `POST /api/users/:id/balance`
      * `PUT /api/users/:id`
      * `DELETE /api/users/:id`
  * **Media**
      * `GET /api/media/:id/view`

-----

## Bonus yang Dikerjakan

  * **B02 - Deployment:** [https://labpro.cpoandy.me](https://labpro.cpoandy.me).
  * **B03 - Polling:** Menerapkan *long polling* pada halaman courses untuk pembaruan real time
  * **B05 - Lighthouse:** Peningkatan performa, aksesibilitas, SEO, dan Best Practices dengan rata-rata skor minimal 95.
    - Page Login
      
      <img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/0804739d-f122-411a-9ea2-ee5e6508198b" />

    - Page Courses

      <img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/36c9bfc6-cc34-46c8-b341-274ff6e9b29d" />

    - Page My Courses

      <img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/7a6cda8e-7999-4f5c-8f5a-26e5df357746" />

    - Page Course Detail

      <img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/2974a812-6e31-4893-997e-bbab768a9773" />

    - Page Modules

      <img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/67503374-4b76-4b2b-852a-a2c4beeef9df" />

  * **B07 - Dokumentasi API:** Dokumentasi API dibuat menggunakan Swagger: [https://labpro.cpoandy.me/docs](https://labpro.cpoandy.me/docs) (tidak dimatikan di production untuk keperluan testing asisten)
  * **B10 - Fitur Tambahan:** Menambahkan fungsionalitas autentikasi melalui Google (OAuth).
  * **B11 - Bucket:** Menggunakan MinIO untuk penyimpanan objek *file* media.

-----

## Cuplikan Aplikasi

*Halaman Login*

*Halaman Pendaftaran*

*Halaman Daftar Kursus*

*Halaman Detail Kursus*

*Halaman Modul Kursus*

*Halaman Kursus Saya*
