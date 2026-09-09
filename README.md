�

🎮 NexSora Network - Auto Backup System
Backup otomatis harian untuk server Minecraft, upload ke Mega.nz, auto-cleanup backup lama

📋 Deskripsi
Script ini melakukan backup otomatis harian untuk server Minecraft, meng-compress data server, mengupload hasilnya ke Mega.nz, dan menghapus backup lama secara otomatis agar penyimpanan tidak penuh.
Kode
📁 Struktur File
File
Lokasi
Keterangan
📜 Script backup
/root/backup-nexsora.js
Script utama (Node.js)
📄 Log backup
/root/backup.log
Riwayat proses backup
🔑 Config rclone
/root/.config/rclone/rclone.conf
Kredensial Mega
⚙️ Config PM2
/root/backup-ecosystem.config.js
Jadwal cron
🗂️ Folder server
/var/lib/pterodactyl/volumes/<UUID>
Data server Minecraft
☁️ Folder tujuan
mega:NexSoraBackups
Tujuan upload backup
⚙️ Cara Kerja
Mermaid
Menghitung ukuran folder server
Compress seluruh isi folder server menjadi .tar.gz
Upload file ke Mega.nz (folder NexSoraBackups)
Hapus file backup sementara di VPS
Hapus backup di Mega yang berumur lebih dari 7 hari
Tampilkan ringkasan hasil backup
🚀 Instalasi
1️⃣ Install dependencies
Bash
2️⃣ Setup rclone untuk Mega.nz
Jalankan:
Bash
Ikuti prompt secara berurutan (isi sesuai urutan ini):
Kode
Test koneksi:
Bash
Buat folder tujuan backup:
Bash
Test upload:
Bash
Jika muncul test.txt di hasil rclone ls, koneksi ke Mega sudah berhasil.
[!TIP]
Belum punya akun Mega? Daftar gratis (kuota 20GB) di mega.nz — bisa langsung dari browser HP, tidak perlu OAuth atau device tambahan.
3️⃣ Simpan script backup
Bash
Paste isi script dari file backup-nexsora.js, sesuaikan variabel SERVER_DIR dengan path folder server kamu.
4️⃣ Test manual
Bash
⏰ Menjalankan Otomatis dengan PM2
Install PM2 (jika belum ada)
Bash
Buat file konfigurasi
Bash
Javascript
💡 Jadwal 0 20 * * * berarti jam 20:00 UTC = 03:00 WIB (asumsi VPS pakai timezone UTC). Cek timezone VPS dengan timedatectl.
Jalankan
Bash
🛠️ Perintah Penting
Bash
🗑️ Mengubah Retensi Backup
Edit /root/backup-nexsora.js, cari baris:
Javascript
Ganti 7d sesuai kebutuhan:
Kode
Setelah edit, jalankan:
Bash
⚠️ Catatan Penting
[!WARNING]
Akun Mega gratis memiliki kuota 20GB — pastikan ukuran backup × jumlah hari retensi tidak melebihi kuota.
[!NOTE]
Proses backup tidak memakan kuota data HP — semua proses berjalan di VPS.
[!TIP]
Warning file changed as we read it saat compress bersifat normal (server menulis file world secara live).
[!CAUTION]
Jangan commit kredensial (email/password Mega, service account, dll) ke repository ini.
🐛 Troubleshooting
�
Backup tidak jalan otomatis
Cek pm2 list, pastikan proses nexsora-backup terdaftar. Pastikan pm2 save dan pm2 startup sudah dijalankan.
�

�
Ingin melihat progress saat compress
Progress bar ditampilkan sekali di akhir proses compress untuk menghindari log yang penuh.
�

�
Error storageQuotaExceeded di Google Drive
Ini terjadi jika menggunakan Google Service Account tanpa Shared Drive. Solusi: gunakan Mega.nz seperti yang diimplementasikan di script ini.
�

�

Dibuat untuk NexSora Network • nexsora.biz.id
⭐ Star repo ini kalau bermanfaat!
�
