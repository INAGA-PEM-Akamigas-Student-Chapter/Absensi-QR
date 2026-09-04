# Presensi INAGA PEM Akamigas SC

Absensi kartu QR untuk INAGA PEM Akamigas Student Chapter.

Berjalan sepenuhnya di browser: pemindai QR, pembuat kartu QR, rekap harian, dan ekspor
Excel maupun CSV.

## Pakai

1. **Peserta** — tambah nama, kode/NIS, dan kelas atau divisi. Setiap peserta punya
   tombol **Kartu QR**; unduh PNG-nya lalu cetak sebagai kartu. Isi QR berformat
   `PRESENSI:<kode>` (kartu lama berawalan `PRESENSIA:` tetap terbaca).
2. **Pindai** — pilih *Jam masuk* atau *Jam pulang*, nyalakan kamera, arahkan kartu.
   Alternatif tanpa kamera: unggah foto kartu QR, tempel tangkapan layar, seret berkas
   gambar, atau ketik kodenya langsung.
3. **Rekap** — pilih tanggal, lihat grafik tujuh hari, tabel lengkap, lalu unduh
   **Excel** atau **CSV**.

   Berkas Excel (`.xlsx`) berisi dua lembar: *Rekap* dengan satu baris per peserta
   (baris kepala dibekukan dan sudah berfilter otomatis, siap disortir atau di-pivot)
   dan *Ringkasan* berisi jumlah hadir, terlambat, belum hadir, serta aturan jam yang
   dipakai saat itu. Angka disimpan sebagai angka, bukan teks, jadi rumus langsung
   bekerja. CSV memakai BOM UTF-8 supaya huruf beraksen tidak rusak di Excel.

Status **hadir** atau **terlambat** dihitung dari aturan jam di tab Pindai
(bawaan 07:30 dengan toleransi 10 menit).

## Penyimpanan data

Aplikasi memilih tempat simpan secara otomatis:

| Kondisi | Data disimpan di | Sinkron antar-perangkat |
|---|---|---|
| `firebase-config.js` sudah diisi dan Anda sudah masuk | Firestore | **ya, langsung** |
| Belum dikonfigurasi | `localStorage` browser | tidak |

Selama `firebase-config.js` masih berisi nilai `GANTI...`, aplikasi jalan normal dengan
penyimpanan lokal dan **tanpa** layar masuk. Jadi mengaktifkan sinkronisasi sepenuhnya
opsional.

Apa pun modenya, tab **Rekap** menyediakan **Cadangkan (JSON)** dan **Pulihkan dari
berkas**. Tetap cadangkan berkala — terutama bila memakai penyimpanan lokal di iPhone,
karena Safari menghapus data situs yang tidak dibuka selama tujuh hari.

## Mengaktifkan sinkronisasi HP ↔ laptop

Sekali siapkan, berlaku untuk semua perangkat.

### 1. Buat proyek Firebase

<https://console.firebase.google.com> → **Add project** → beri nama, misalnya
`absensi-qr`. Google Analytics boleh dimatikan.

### 2. Buat basis data Firestore

**Build → Firestore Database → Create database.** Pilih lokasi terdekat
(`asia-southeast1` / Singapore untuk Indonesia). Mode awal bebas — aturannya kita ganti
di langkah 5.

### 3. Aktifkan login email

**Build → Authentication → Get started → Email/Password → Enable → Save.**

Lalu buat akun untuk diri Anda: tab **Users → Add user**, isi email dan kata sandi.
Akun inilah yang dipakai masuk di HP maupun laptop.

Supaya orang lain tidak bisa mendaftar sendiri: **Authentication → Settings → User
actions**, hilangkan centang *Enable create (sign-up)*.

### 4. Daftarkan diri Anda sebagai admin

Peran diambil dari koleksi `pengguna` di Firestore. **Buat dokumen pertama secara
manual sebelum memasang aturan**, kalau tidak semua orang termasuk Anda akan terkunci.

**Firestore Database → Start collection** → Collection ID: `pengguna` → Document ID:
isi dengan **email Anda** (misalnya `nama@gmail.com`), lalu tambahkan tiga kolom:

| Field | Type | Value |
|---|---|---|
| `email` | string | email yang sama |
| `nama` | string | nama Anda |
| `peran` | string | `admin` |

Setelah aplikasi berjalan, akun berikutnya cukup ditambahkan lewat
**Pengaturan → Akun pengguna** — tidak perlu kembali ke Console.

### 5. Pasang aturan keamanan

**Firestore Database → Rules**, ganti seluruh isinya dengan:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function terdaftar() {
      return request.auth != null
          && exists(/databases/$(database)/documents/pengguna/$(request.auth.token.email));
    }
    function peran() {
      return terdaftar()
        ? get(/databases/$(database)/documents/pengguna/$(request.auth.token.email)).data.peran
        : '';
    }

    match /pengguna/{email} {
      allow read:  if terdaftar();
      allow write: if peran() == 'admin';
    }
    match /peserta/{kode} {
      allow read:  if terdaftar();
      allow write: if peran() == 'admin';
    }
    match /absensi/{tanggal} {
      allow read:  if terdaftar();
      allow write: if peran() in ['admin', 'petugas'];
    }
    match /pengaturan/{doc} {
      allow read:  if terdaftar();
      allow write: if peran() == 'admin';
    }
  }
}
```

Klik **Publish**.

Yang dijamin aturan ini: hanya email yang ada di koleksi `pengguna` yang bisa membaca
apa pun; hanya **admin** yang boleh mengubah peserta, aturan jam, dan daftar akun;
**petugas** boleh mencatat kehadiran tetapi tidak mengubah data induk; **pengamat**
hanya membaca.

Pembatasan di dalam aplikasi hanya menyembunyikan tombol yang tidak berlaku. Aturan
inilah yang benar-benar menahan, termasuk terhadap orang yang memanggil API langsung.

## Peran akun

| Peran | Pindai | Rekap & Dasbor | Kelola peserta | Aturan jam | Kelola akun |
|---|---|---|---|---|---|
| **Admin** | ya | ya | ya | ya | ya |
| **Petugas** | ya | ya | — | — | — |
| **Pengamat** | — | ya | — | — | — |

Kelola lewat **Pengaturan → Akun pengguna**. Menambahkan email di sana hanya mengatur
perannya; akun untuk masuk tetap dibuat di **Authentication → Users**.

### 6. Salin konfigurasi ke repositori

**Project settings** (ikon gerigi) → **Your apps** → **Web** (`</>`) → daftarkan
aplikasi → salin isi objek `firebaseConfig`, lalu tempelkan ke `firebase-config.js` di
repositori ini menggantikan nilai `GANTI...`. Commit dan push.

Tunggu satu-dua menit sampai GitHub Pages membangun ulang, buka halamannya, lalu masuk
dengan akun dari langkah 3. Setelah itu HP dan laptop melihat data yang sama, dan
perubahan di satu perangkat langsung muncul di perangkat lain.

### 7. Kunci pendaftaran (WAJIB)

Kunci API di `firebase-config.js` bersifat publik — setiap browser pengunjung
menerimanya, dan itu memang rancangan Firebase. Menyembunyikannya tidak mungkin dan
tidak perlu. Yang menjaga data adalah dua setelan berikut, dan keduanya harus dipasang:

- **Authentication → Settings → User actions**, hilangkan centang
  *Enable create (sign-up)*. Tanpa ini, siapa pun bisa membuat akun di proyek Anda
  dengan memanggil API Firebase langsung, tanpa perlu menyentuh halaman ini.
- **Rules** pada langkah 5 mensyaratkan email ada di koleksi `pengguna`, bukan sekadar
  `request.auth != null`. Akun yang tidak terdaftar tetap ditolak walau berhasil masuk,
  dan yang terdaftar pun dibatasi sesuai perannya.

Periksa juga **Authentication → Users** dan hapus akun yang bukan Anda buat.

### 8. Firebase App Check (opsional, lapisan tambahan)

App Check membuat Firebase menolak permintaan yang tidak datang dari halaman ini,
bahkan bila penyerang memegang kunci API Anda.

1. **App Check → Apps** → pilih aplikasi web → provider **reCAPTCHA v3**.
2. Buat kunci reCAPTCHA v3 di <https://www.google.com/recaptcha/admin> dengan domain
   `radja4100.github.io`. Tempel **secret key**-nya ke Firebase Console — secret key
   tidak pernah masuk ke repositori ini.
3. Salin **site key**-nya ke `APPCHECK_SITE_KEY` di `firebase-config.js`, lalu push.
4. Buka halaman, masuk, pastikan semuanya masih normal. Di **App Check → APIs**,
   biarkan status **Monitor** dulu dan tunggu sampai lalu lintas terlihat masuk
   sebagai *verified*.
5. Baru setelah itu tekan **Enforce** untuk **Cloud Firestore** dan
   **Firebase Authentication**.

Jangan membalik urutan langkah 3–5. Menyalakan *Enforce* sebelum site key terpasang
akan membuat seluruh permintaan ditolak dan aplikasi berhenti bekerja.

Perlu diketahui: App Check bergantung pada reCAPTCHA yang memanggil server Google. Bila
jaringan Anda memblokir `google.com` atau `recaptcha.net`, token gagal terbit dan —
setelah *Enforce* menyala — aplikasi berhenti berfungsi. Itulah sebabnya tahap
**Monitor** ada.

### Struktur data di Firestore

```
peserta/<kode>          { kode, nama, grup }
absensi/<YYYY-MM-DD>    { tanggal, catatan: { <kode>: { nama, grup, masuk, pulang, status } } }
pengaturan/umum         { jamMasuk, toleransi }
pengguna/<email>        { email, nama, peran }        peran: admin | petugas | pengamat
```

Pemindaian tetap berfungsi saat sinyal putus — Firestore menyimpan salinan luring dan
mengirimkannya begitu koneksi kembali.

## Kamera

Browser hanya mengizinkan kamera pada `https://` atau `localhost`. Lewat GitHub Pages
syarat itu terpenuhi, jadi pemindaian langsung berfungsi, termasuk dari HP. Bila izin
kamera tetap ditolak, tombol **Pindai dari gambar** tetap bisa dipakai — di HP, pemilih
berkasnya juga menawarkan "Ambil Foto".

## Catatan teknis

Ekspor `.xlsx` ditulis sendiri oleh aplikasi (sebuah berkas xlsx pada dasarnya adalah
arsip ZIP berisi XML), jadi tidak ada pustaka spreadsheet yang perlu diunduh. Hasilnya
diuji terbuka bersih oleh openpyxl tanpa peringatan.

Semua pustaka disimpan di dalam repositori, tidak ada satu pun permintaan ke CDN:
[jsQR](https://github.com/cozmo/jsQR) (MIT) dan
[QRious](https://github.com/neocotic/qrious) (GPL-3.0) ditanam langsung di dalam
`index.html`, sedangkan SDK Firebase ada di `vendor/`.

`index.html` adalah hasil bangunan, bukan berkas yang diedit langsung. Sumbernya
`presensia/index.html` beserta `presensia/bangun.py` di mesin pengembang.
