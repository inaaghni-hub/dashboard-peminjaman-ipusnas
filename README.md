# Dashboard Peminjaman iPusnas

Halaman statistik peminjaman iPusnas tahun 2026 (Januari sampai Oktober), dibangun dari laporan agregat peminjaman. Hanya angka gabungan yang ditampilkan. Tidak ada data pribadi peminjam.

## Berkas

- `index.html`, halaman utama
- `style.css`, tampilan
- `app.js`, menggambar grafik dan tabel dari berkas data
- `data.json`, agregat: ringkasan, per bulan, 10 judul terlaris, per subjek, per ePustaka, plus daftar subjek untuk memetakan indeks subjek pada berkas judul
- `judul-1.json` sampai `judul-5.json`, daftar lengkap 95.769 judul (judul, indeks subjek, jumlah peminjaman), dipecah per 20.000 judul agar lolos batas ukuran unggahan, dimuat hanya bila pengunjung menekan tombol muat

## Memperbarui data

1. Muat laporan baru ke database SQLite di mesin pengelola.
2. Jalankan skrip ekspor untuk membuat ulang `data.json` dan `judul.json`.
3. Dorong (push) berkas yang berubah ke repositori ini.

## Catatan data

- Februari 2026 tidak ada dalam laporan sumber, jadi ditandai sebagai tidak ada data, bukan nol.
- Kolom pengarang kosong pada seluruh laporan sumber, sehingga nama pengarang tidak ditampilkan.
- Semua rincian (per bulan, per subjek, per ePustaka, per judul) berjumlah tepat sama dengan total peminjaman pada laporan: 2.497.073.
