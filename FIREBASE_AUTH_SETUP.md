# Dokumentasi Setup Firebase Authentication, App Check & Firestore Rules
## Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) — Team Senyap Nusantara (TSN)

---

### 1. Ringkasan Arsitektur Keamanan

Sistem portal dan manajemen anggota Team Senyap Nusantara telah ditingkatkan dari sistem PIN frontend sederhana menjadi arsitektur cloud tingkat produksi yang aman, mematuhi prinsip **Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022)** dan **Role-Based Access Control (RBAC)**:

1. **Firebase Authentication**: Digunakan secara eksklusif untuk otentikasi administrator pusat dan cabang. Kredensial hardcoded dan PIN frontend telah dihapus seluruhnya.
2. **Pemisahan Data Publik vs. Privat Anggota**:
   - **Koleksi Publik (`members/{memberId}`)**: Hanya menyimpan data non-sensitif (Nama, Nomor Registrasi/ID, Divisi, Wilayah, Foto Profil, Tanggal Bergabung, dan Status Verifikasi).
   - **Subkoleksi Privat (`members/{memberId}/private/data`)**: Menyimpan data sensitif (NIK, Nomor Telepon/WhatsApp, Alamat Domisili KTP, Tanda Tangan, dan URL Scan KTP). Subkoleksi ini hanya dapat diakses oleh administrator terotentikasi.
3. **Proteksi Pengaduan Konsumen (`legalAidCases/{caseId}`)**:
   - Masyarakat dapat mengajukan permohonan pendampingan hukum baru.
   - Pengecekan status kasus publik **diwajibkan** menyertakan Nomor Berkas dan PIN Akses Rahasia yang diperoleh saat pelaporan, mencegah pencurian data konsultasi hukum oleh pihak luar.
4. **Buku Kas & Transaksi Keuangan (`transactions/{id}`)**:
   - Transparansi publik: Publik dapat melihat laporan kas masuk & keluar.
   - Integritas data: Operasi penambahan, pengeditan, atau penghapusan transaksi dikunci hanya untuk pengurus/admin yang login.
5. **Mekanisme Audit Trail (`audit_logs/{id}`)**:
   - Setiap operasi verifikasi anggota, modifikasi data, mutasi kas, atau perubahan konfigurasi situs secara otomatis tercatat dengan timestamp, ID target, detail aksi, dan identitas admin pelaksana.
6. **Firebase App Check**:
   - Terintegrasi dengan reCAPTCHA v3 untuk mencegah serangan bot, scraping, dan abuse terhadap backend Firestore.

---

### 2. Panduan Setup Akun Pengurus / Administrator

#### A. Membuat Akun Admin Pertama di Firebase Console
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek Anda: `ai-studio-teamsenyapnusant-412d643f-bc7f-46be-9604-4fbeb53ea7f0`.
3. Masuk ke menu **Build** > **Authentication** > tab **Users**.
4. Klik tombol **Add User**:
   - **Email**: `ptsynergyconsultinggroup@gmail.com` (atau email resmi pengurus TSN lainnya).
   - **Password**: Tetapkan kata sandi yang kuat (minimal 8 karakter dengan kombinasi huruf, angka, dan simbol).
5. Salin **UID** dari pengguna baru tersebut.

#### B. Menetapkan Peran Administrator (RBAC)

Aturan keamanan `firestore.rules` mendukung dua metode verifikasi hak admin:

##### Metode 1: Koleksi `admins/{uid}` (Direkomendasikan & Langsung Berfungsi)
1. Di Firebase Console, buka **Firestore Database**.
2. Buat dokumen pada koleksi `admins` dengan Document ID berupa **UID pengguna** atau **email**:
   - **Collection**: `admins`
   - **Document ID**: `<UID_ADMIN>` atau `ptsynergyconsultinggroup@gmail.com`
   - **Fields**:
     ```json
     {
       "role": "admin",
       "active": true,
       "email": "ptsynergyconsultinggroup@gmail.com",
       "createdAt": "2026-09-14T00:00:00Z"
     }
     ```

##### Metode 2: Custom Claims Firebase Auth (Level Performa Tinggi)
Jalankan script Firebase Admin SDK Node.js untuk mengatur klaim kustom:
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function setAdminRole(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Custom claim admin: true berhasil diberikan ke ${uid}`);
}

setAdminRole('<UID_ADMIN>');
```

---

### 3. Struktur Koleksi Firestore & Keamanan (Security Rules)

| Koleksi | Hak Akses Baca (Read) | Hak Akses Tulis (Create/Update/Delete) | Keterangan |
|---|---|---|---|
| `members/{id}` | Publik (`allow read: if true`) | Admin saja / Pendaftaran Anggota Baru | Data ringkas kartu tanda anggota |
| `members/{id}/private/data` | **Admin saja** (`request.auth != null`) | **Admin saja / Anggota Baru** saat registrasi | Data NIK, KTP, Telepon, Alamat |
| `transactions/{id}` | Publik (`allow read: if true`) | **Admin saja** | Transparansi kas & akuntabilitas publik |
| `legalAidCases/{id}` | **Admin atau Pemilik PIN Kasus** | **Publik (Create Validated)** / **Admin (Manage)** | Perlindungan privasi korban/konsumen |
| `site_config/main` | Publik (`allow read: if true`) | **Admin saja** | Logo, profil pimpinan, kontak resmi |
| `audit_logs/{id}` | **Admin saja** | **Admin / Sistem Terautentikasi** | Rekam jejak audit digital |
| `admins/{id}` | **Admin saja** | **Admin saja** | Daftar hak akses administrator |

---

### 4. Konfigurasi Firebase App Check

App Check telah diinisialisasi pada `src/firebase.ts` menggunakan Google reCAPTCHA v3.

#### Pengaturan di Firebase Console:
1. Buka **Firebase Console** > **App Check**.
2. Daftarkan aplikasi web Anda dan masukkan **reCAPTCHA v3 Secret Key** dari Google Cloud / reCAPTCHA Console.
3. Tambahkan Site Key ke environment variable `.env`:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key_here
   ```
4. Di lingkungan pengembangan lokal (localhost), debug token diaktifkan secara otomatis (`self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;`) untuk mencegah pemblokiran saat pengujian.

---

### 5. Panduan Reset Kata Sandi & Pemulihan Akses

Jika pengurus lupa kata sandi:
1. Klik menu **Pengurus TSN** pada header website.
2. Pada modal login, pilih **"Lupa kata sandi? Kirim email pemulihan"**.
3. Masukkan email administrator resmi (`ptsynergyconsultinggroup@gmail.com`).
4. Buka kotak masuk email dan ikuti tautan resmi dari Firebase untuk memperbarui sandi secara aman.
5. Sebagai alternatif, administrator lain yang sedang login dapat mengirimkan email reset sandi langsung dari tab **Pengaturan Website** di Admin Dashboard.

---

*Lembaga Perlindungan Konsumen Swadaya Masyarakat (LPKSM) — Team Senyap Nusantara*
