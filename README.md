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

## *Design Pattern* yang Digunakan

Berikut adalah beberapa *design pattern* yang digunakan dalam proyek ini:

  * **Repository Pattern:** Pola ini bertindak sebagai perantara antara logika bisnis dan akses data dengan menyediakan abstraksi untuk operasi database. Dalam proyek ini, *Repository Pattern* digunakan di seluruh *service* melalui TypeORM (misalnya, `UserRepository` di `UsersService`) untuk memisahkan logika aplikasi dari kueri database PostgreSQL. Tujuannya adalah agar kode menjadi lebih bersih, tidak terikat langsung dengan implementasi database, dan lebih mudah untuk diuji atau diganti sumber datanya di kemudian hari.
  * **Strategy Pattern:** Pola ini memungkinkan sebuah objek (*subject*) untuk memberitahu objek-objek lain (*observer*) secara otomatis ketika keadaannya berubah. Design pattern ini digunakan untuk mengimplementasikan fitur **Long Polling** di `CoursesController`, di mana *backend* (*subject*) akan memberitahu semua klien (*observer*) yang terhubung ketika ada data kursus baru. Hal ini dilakukan agar pengguna bisa melihat pembaruan data secara *real-time* tanpa perlu me-*refresh* halaman.
  * **Decorator Pattern:** *Dependency Injection* adalah pola di mana dependensi sebuah objek (misalnya, sebuah *service*) "disuntikkan" oleh *framework* dari luar, bukan dibuat sendiri oleh objek tersebut. Pola ini menjadi inti dari *framework* NestJS dan digunakan di seluruh aplikasi, seperti saat meng-*inject* `CoursesService` ke dalam `CoursesController`. Tujuannya adalah untuk menciptakan komponen yang *loosely coupled* (tidak saling terikat erat), sehingga lebih mudah untuk dikelola, diskalakan, dan terutama lebih mudah untuk diuji secara terpisah dengan menggunakan *mock*.

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
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/382ccf8d-525c-4e43-9a3b-d5c02d5083e7" />

*Halaman Register*
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/7a53c078-7697-44a3-8204-b0623b4df0cd" />

*Halaman Daftar Kursus*
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/d381ab6f-338b-49a1-a171-5e7a7d7a77a9" />
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/0ceb0fc1-fed3-4bb5-8b80-8bd51d256331" />

*Halaman Kursus Saya*
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/69ad2469-7ae3-41f2-b8b2-095bcca17f84" />

*Halaman Detail Kursus*
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/67830332-bf44-407f-9d6c-dc8e535dcbf1" />
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/e5d83d29-3477-4742-9be1-020f9be996e4" />

*Halaman Modul Kursus*
<img width="1600" height="850" alt="image" src="https://github.com/user-attachments/assets/60358344-2fac-4fbd-9e68-1eb62bf0d7a1" />

