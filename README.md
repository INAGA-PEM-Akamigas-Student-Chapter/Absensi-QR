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

    function diizinkan() {
      return request.auth != null
          && request.auth.token.email in [
               'email-anda@contoh.com'
             ];
    }
    function punyaAkun() {
      return exists(/databases/$(database)/documents/pengguna/$(request.auth.token.email));
    }
    function hak() {
      return get(/databases/$(database)/documents/pengguna/$(request.auth.token.email)).data;
    }
    function kelola()  { return diizinkan() && punyaAkun() && hak().kelola  == true; }
    function penilai() { return diizinkan() && punyaAkun() && hak().penilai == true; }

    // Semua akun yang diizinkan boleh memindai dan melihat
    match /absensi/{tanggal} { allow read, write: if diizinkan(); }
    match /peserta/{kode}    { allow read: if diizinkan(); allow write: if kelola(); }
    match /pengaturan/{doc}  { allow read: if diizinkan(); allow write: if kelola(); }

    // Hanya akun penilai
    match /evaluasi/{id}     { allow read, write: if penilai(); }

    // Hak hanya diubah dari Firebase Console, bukan dari aplikasi
    match /pengguna/{email}  { allow read: if diizinkan(); allow write: if false; }
  }
}
```

Ganti `email-anda@contoh.com` dengan email akun dari langkah 3, lalu klik **Publish**.
Untuk menambah petugas, tambahkan emailnya di dalam kurung siku dipisah koma:

```
               'email-anda@contoh.com',
               'petugas-dua@contoh.com'
```

Daftar email ini penting: `request.auth != null` saja tidak cukup, karena berarti
siapa pun yang berhasil membuat akun boleh membaca dan mengubah seluruh absensi.

### 5. Salin konfigurasi ke repositori

**Project settings** (ikon gerigi) → **Your apps** → **Web** (`</>`) → daftarkan
aplikasi → salin isi objek `firebaseConfig`, lalu tempelkan ke `firebase-config.js` di
repositori ini menggantikan nilai `GANTI...`. Commit dan push.

Tunggu satu-dua menit sampai GitHub Pages membangun ulang, buka halamannya, lalu masuk
dengan akun dari langkah 3. Setelah itu HP dan laptop melihat data yang sama, dan
perubahan di satu perangkat langsung muncul di perangkat lain.

### 6. Kunci pendaftaran (WAJIB)

Kunci API di `firebase-config.js` bersifat publik — setiap browser pengunjung
menerimanya, dan itu memang rancangan Firebase. Menyembunyikannya tidak mungkin dan
tidak perlu. Yang menjaga data adalah dua setelan berikut, dan keduanya harus dipasang:

- **Authentication → Settings → User actions**, hilangkan centang
  *Enable create (sign-up)*. Tanpa ini, siapa pun bisa membuat akun di proyek Anda
  dengan memanggil API Firebase langsung, tanpa perlu menyentuh halaman ini.
- **Rules** pada langkah 4 memakai daftar email, bukan sekadar `request.auth != null`.
  Akun di luar daftar tetap ditolak walau berhasil masuk.

Periksa juga **Authentication → Users** dan hapus akun yang bukan Anda buat.

### 7. Firebase App Check (opsional, lapisan tambahan)

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

## Tingkat akun

Aplikasi terbagi dua bagian: **Absensi QR** dan **Evaluasi Staff**. Hak diberikan lewat
dua kolom pada dokumen `pengguna/<email>`, dan boleh dikombinasikan.

| Akun | `kelola` | `penilai` | Pindai & lihat | Ubah peserta / aturan jam | Evaluasi staff |
|---|---|---|---|---|---|
| Petugas absensi | — | — | ya | — | — |
| Penilai | — | `true` | ya | — | ya |
| Pengelola | `true` | `true` | ya | ya | ya |

Email harus **tetap ada** di daftar `diizinkan()` pada Rules — itu pintu pertamanya.
Dokumen `pengguna` hanya menambah hak di atas akses dasar tersebut.

**Membuat akun petugas absensi:** cukup tambahkan emailnya ke daftar di Rules. Tanpa
dokumen `pengguna`, akun itu bisa memindai dan melihat rekap, tetapi tidak dapat
menambah, mengubah, atau menghapus peserta, dan tidak melihat bagian evaluasi.

**Membuat akun penilai:** tambahkan emailnya ke daftar di Rules, lalu buat dokumen di
**Firestore → koleksi `pengguna`** dengan Document ID berisi email itu:

| Field | Type | Value |
|---|---|---|
| `penilai` | **boolean** | `true` |

**Akun Anda sendiri** sebaiknya punya keduanya:

| Field | Type | Value |
|---|---|---|
| `kelola` | **boolean** | `true` |
| `penilai` | **boolean** | `true` |

Tipenya harus boolean, bukan string — `"true"` dalam tanda kutip tidak dikenali.

Kolom `kelola` dan `penilai` sengaja tidak dapat ditulis dari aplikasi
(`allow write: if false`), supaya tidak ada akun yang menaikkan haknya sendiri.
Penyembunyian tombol di aplikasi hanya kenyamanan tampilan; aturan di atas yang
benar-benar menahan.

Status hak akun yang sedang masuk terlihat di **Pengaturan → Tentang**.

## Evaluasi staff

Aplikasi terbagi dua tab besar di bagian atas: **Absensi QR** dan **Evaluasi Staff**.
Tab kedua hanya muncul untuk akun penilai, dan isi menunya menyesuaikan tab yang aktif.

Peserta dianggap staff bila **Kelas / Divisi**-nya diawali kata "Staff", misalnya
`Staff of Professionalism` atau `Staff of Academic`. Jadi daftar peserta yang sudah ada
langsung terbaca tanpa perlu disunting satu per satu.

Untuk jabatan yang tidak memakai penamaan itu, tersedia centang **Tandai staff** di form
peserta sebagai penunjukan manual.

Satu penilaian berisi tanggal, nilai 0–100, dan catatan. Penilaian boleh dibuat kapan
saja dan sebanyak yang diperlukan — **penilaian lama tidak pernah tertimpa**, sehingga
riwayatnya terbaca seperti rapor: nilai per tanggal, beserta rata-ratanya.

**Penilaian bersifat anonim.** Identitas penilai tidak disimpan sama sekali, bukan
sekadar disembunyikan dari tampilan — dokumen `evaluasi` hanya memuat kode peserta,
tanggal, nilai, catatan, dan waktu pembuatan. Konsekuensinya, tidak ada cara menelusuri
siapa yang memberi nilai tertentu, termasuk oleh pemilik proyek.

### Struktur data di Firestore

```
peserta/<kode>          { kode, nama, grup, staff }
evaluasi/<id>           { kode, tanggal, nilai, catatan, dibuat }   tanpa identitas penilai
pengguna/<email>        { kelola, penilai }                          hanya dari Firebase Console
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
