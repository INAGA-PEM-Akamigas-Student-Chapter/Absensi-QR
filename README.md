# Presensia — absensi kartu QR

Aplikasi presensi berbasis pemindaian kode QR. Berjalan sepenuhnya di browser: pemindai
QR, pembuat kartu QR, rekap harian, dan ekspor Excel maupun CSV.

**Halaman langsung:** <https://radja4100.github.io/Absensi-QR/>

## Pakai

1. **Peserta** — tambah nama, kode/NIS, dan kelas atau divisi. Setiap peserta punya
   tombol **Kartu QR**; unduh PNG-nya lalu cetak sebagai kartu. Isi QR berformat
   `PRESENSIA:<kode>`.
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
di langkah 4.

### 3. Aktifkan login email

**Build → Authentication → Get started → Email/Password → Enable → Save.**

Lalu buat akun untuk diri Anda: tab **Users → Add user**, isi email dan kata sandi.
Akun inilah yang dipakai masuk di HP maupun laptop.

Supaya orang lain tidak bisa mendaftar sendiri: **Authentication → Settings → User
actions**, hilangkan centang *Enable create (sign-up)*.

### 4. Pasang aturan keamanan

**Firestore Database → Rules**, ganti seluruh isinya dengan:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Klik **Publish**. Artinya: hanya pengguna yang sudah masuk yang boleh membaca dan
menulis. Tanpa aturan ini, data absensi Anda terbuka untuk siapa pun.

### 5. Salin konfigurasi ke repositori

**Project settings** (ikon gerigi) → **Your apps** → **Web** (`</>`) → daftarkan
aplikasi → salin isi objek `firebaseConfig`, lalu tempelkan ke `firebase-config.js` di
repositori ini menggantikan nilai `GANTI...`. Commit dan push.

Tunggu satu-dua menit sampai GitHub Pages membangun ulang, buka halamannya, lalu masuk
dengan akun dari langkah 3. Setelah itu HP dan laptop melihat data yang sama, dan
perubahan di satu perangkat langsung muncul di perangkat lain.

### Struktur data di Firestore

```
peserta/<kode>          { kode, nama, grup }
absensi/<YYYY-MM-DD>    { tanggal, catatan: { <kode>: { nama, grup, masuk, pulang, status } } }
pengaturan/umum         { jamMasuk, toleransi }
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
