### Kriteria Masuk ke Release Note (Pop-up)
Sebuah perubahan layak masuk ke pop-up jika memenuhi salah satu dari syarat ini:
1. Ada Fitur Baru yang Terlihat / Bisa Diklik (User-Facing Feature)
Masuk: "Sekarang Anda bisa melacak status tiket pengaduan di Halo Dekan."
Alasan: User butuh dikasih tau kalau ada tombol atau halaman baru yang bisa mereka pakai.

2. Perubahan Alur Kerja (Workflow/UI Change)
Masuk: "Tombol Upload Bukti sekarang dipindah ke dalam tabel Detail."
Alasan: Kalau mengubah letak tombol atau cara user nginput sesuatu, maka wajib beritahu biar user tidak kebingungan mencari-cari.

3. Bug Fixes Mayor yang Dikeluhkan User
Masuk: "Memperbaiki kendala gagal login karena masalah pengiriman email OTP."
Alasan: Kalau sebelumnya ada fitur yang rusak dan bikin user teriak/komplain, setelah diperbaiki, wajib memberitahu mereka kalau sistemnya sudah aman.

4. Peningkatan Performa yang Sangat Terasa
Masuk: "Proses export laporan Excel kini 5x lebih cepat."
Alasan: Ini flexing yang bagus untuk meningkatkan kepercayaan user ke sistem.

### Siklus Waktu Release Note yang Ideal
Untuk aplikasi level fakultas seperti MIRA, idealnya dev memunculkan pop-up ini menggunakan dua pendekatan:
1. Berbasis Waktu (Sprint): Kumpulkan semua fitur dan bug fix kecil-kecil, lalu rilis pop-up sebulan sekali atau setiap 2 minggu.
2. Berbasis Fitur Besar: Jangan munculin pop-up kalau perubahannya cuma 1 biji (kecuali sangat kritis). Tunggu sampai punya minimal 3 poin perubahan di kantong, baru update variabel array newFeatures-nya.