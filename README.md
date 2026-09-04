# Presensia — absensi kartu QR

Aplikasi presensi berbasis pemindaian kode QR. Satu berkas HTML, tanpa pemasangan dan
tanpa server: pemindai QR, pembuat kartu QR, rekap harian, dan ekspor CSV semuanya ada
di dalam `index.html`.

**Halaman langsung:** <https://radja4100.github.io/Absensi-QR/>

## Pakai

1. **Peserta** — tambah nama, kode/NIS, dan kelas atau divisi. Setiap peserta punya
   tombol **Kartu QR**; unduh PNG-nya lalu cetak sebagai kartu. Isi QR berformat
   `PRESENSIA:<kode>`.
2. **Pindai** — pilih *Jam masuk* atau *Jam pulang*, nyalakan kamera, arahkan kartu.
   Alternatif tanpa kamera: unggah foto kartu QR, tempel tangkapan layar, seret berkas
   gambar, atau ketik kodenya langsung.
3. **Rekap** — pilih tanggal, lihat grafik tujuh hari, tabel lengkap, dan unduh CSV
   (memakai BOM UTF-8 sehingga rapi dibuka di Excel).

Status **hadir** atau **terlambat** dihitung dari aturan jam di tab Pindai
(bawaan 07:30 dengan toleransi 10 menit).

## Penyimpanan data

Data disimpan di `localStorage` browser masing-masing pengunjung, pada kunci
`presensia.v1`. Halaman ini tidak punya server dan tidak mengirim apa pun ke mana pun.

Konsekuensinya: data melekat pada satu browser di satu perangkat, dan hilang bila data
situs dibersihkan. Tab **Rekap** menyediakan **Cadangkan (JSON)** dan **Pulihkan dari
berkas** — pakai secara berkala, terutama di iPhone, karena Safari menghapus data situs
yang tidak dibuka selama tujuh hari.

## Kamera

Browser hanya mengizinkan kamera pada `https://` atau `localhost`. Lewat GitHub Pages
syarat itu terpenuhi, jadi pemindaian langsung berfungsi, termasuk dari HP. Bila izin
kamera tetap ditolak, tombol **Pindai dari gambar** tetap bisa dipakai — di HP, pemilih
berkasnya juga menawarkan "Ambil Foto".

## Catatan teknis

`index.html` sengaja dibuat mandiri: pustaka [jsQR](https://github.com/cozmo/jsQR) (MIT)
dan [QRious](https://github.com/neocotic/qrious) (GPL-3.0) ditanam di dalam berkas,
sehingga tidak ada satu pun permintaan ke CDN yang bisa tertahan jaringan atau pemblokir
iklan. Jangan pecah berkas ini menjadi `lib/` terpisah kecuali folder itu ikut diunggah.
