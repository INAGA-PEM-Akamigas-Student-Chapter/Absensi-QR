# Presensia — absensi QR mandiri

Aplikasi presensi kartu QR yang berjalan sepenuhnya di browser. Tidak butuh claude.ai,
tidak butuh internet, tidak butuh pemasangan apa pun.

```
presensia/
  index.html          seluruh aplikasi
  lib/jsQR.js         pembaca kode QR
  lib/qrious.min.js   pembuat kode QR
```

## Menjalankan

**Cara 1 — buka langsung.** Klik dua kali `index.html`. Semua fitur jalan, tetapi
sebagian browser menolak akses kamera pada berkas lokal. Kalau tombol "Nyalakan kamera"
gagal, pakai cara 2 atau gunakan "Pindai dari gambar".

**Cara 2 — server lokal (disarankan, kamera dijamin bisa).** Dari folder ini:

```bash
python -m http.server 8765
```

Lalu buka <http://localhost:8765> di browser. `localhost` dihitung sebagai konteks aman,
jadi izin kamera akan ditanyakan secara normal.

## Memakai dari HP (misalnya HP jadi alat pindai)

Kamera web hanya diizinkan pada `localhost` atau `https://`. Membuka
`http://192.168.x.x:8765` dari HP **tidak** akan mendapat izin kamera — halaman tetap
terbuka, tapi tombol kamera ditolak browser. Pilihannya:

- Pakai **Pindai dari gambar** di HP: tombol itu membuka pemilih berkas yang juga
  menawarkan "Ambil Foto", sehingga kamera bawaan HP tetap terpakai.
- Atau hosting dengan HTTPS (GitHub Pages, Netlify, Cloudflare Pages — cukup unggah
  ketiga berkas di atas), lalu buka alamat `https://`-nya.

## Penyimpanan data

Data (peserta, absensi harian, aturan jam) disimpan di `localStorage` browser, pada kunci
`presensia.v1`. Artinya:

- Data melekat pada **satu browser di satu perangkat**. Browser lain = data kosong.
- Membersihkan "data situs"/cookies akan menghapusnya.
- Mode penyamaran tidak menyimpan apa pun setelah jendela ditutup.

Karena itu tab **Rekap** menyediakan **Cadangkan (JSON)** dan **Pulihkan dari berkas**.
Cadangkan secara berkala, dan pakai berkas itu untuk memindahkan data ke perangkat lain.

Kalau butuh satu basis data bersama untuk beberapa alat pindai sekaligus, versi ini tidak
cukup — perlu backend (misalnya PHP + MySQL, atau Node + SQLite).

## Alur pemakaian

1. **Peserta** — tambah nama, kode/NIS, kelas atau divisi. Tiap peserta punya tombol
   **Kartu QR**; unduh PNG-nya lalu cetak sebagai kartu. Isi QR-nya berformat
   `PRESENSIA:<kode>`.
2. **Pindai** — pilih *Jam masuk* atau *Jam pulang*, nyalakan kamera, arahkan kartu.
   Alternatifnya: unggah/tempel/seret foto kartu QR, atau ketik kodenya langsung.
3. **Rekap** — pilih tanggal, lihat grafik tujuh hari, tabel lengkap, dan unduh CSV
   (CSV memakai BOM UTF-8 sehingga langsung rapi dibuka di Excel).

Status **hadir** atau **terlambat** dihitung dari **Aturan jam** di tab Pindai
(bawaan: 07:30 dengan toleransi 10 menit).

## Data contoh

Saat pertama dibuka, enam peserta dan absensi hari ini ditampilkan sebagai gambaran.
Data contoh tidak pernah ditulis ke penyimpanan — menekan "Mulai dari kosong" atau
menambah peserta pertama akan menghapusnya dari layar.
