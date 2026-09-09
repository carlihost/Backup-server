==================================================
 NEXSORA NETWORK - AUTO BACKUP SYSTEM
==================================================

DESKRIPSI
---------
Script ini melakukan backup otomatis harian untuk server
Minecraft NexSora, meng-compress data server, mengupload
hasilnya ke Mega.nz, dan menghapus backup lama secara
otomatis agar penyimpanan tidak penuh.

Tersedia 2 versi script yang bisa dipilih:
    1. Bash    -> backup-nexsora.sh
    2. JavaScript (Node.js) -> backup-nexsora.js
Keduanya punya fungsi yang sama persis.


LOKASI FILE PENTING
--------------------
- Script backup (bash) : /root/backup-nexsora.sh
- Script backup (js)   : /root/backup-nexsora.js
- Log backup           : /root/backup.log
- Config rclone        : /root/.config/rclone/rclone.conf
- Config PM2           : /root/backup-ecosystem.config.js
- Folder server        : /var/lib/pterodactyl/volumes/<UUID_SERVER_KAMU>
- Folder tujuan Mega   : mega:NexSoraBackups


CARA KERJA
----------
1. Script menghitung ukuran folder server
2. Compress seluruh isi folder server menjadi file .tar.gz
   (menampilkan nama tiap file yang sedang diproses ke log)
3. Upload file .tar.gz ke Mega.nz (folder NexSoraBackups)
4. Hapus file backup sementara di VPS (agar disk tidak penuh)
5. Hapus backup lama di Mega yang berumur lebih dari 7 hari
6. Tampilkan ringkasan hasil backup (status compress, ukuran,
   status upload, waktu selesai)


SETUP MEGA.NZ (RCLONE)
------------------------
1. Daftar akun gratis di https://mega.nz (kuota 20GB, bisa
   langsung dari browser HP)

2. Install rclone di VPS (jika belum ada):
    curl https://rclone.org/install.sh | sudo bash

3. Jalankan konfigurasi:
    rclone config

4. Ikuti prompt berikut secara berurutan:
    n/s/q>                      -> n   (New remote)
    name>                       -> mega
    Storage>                    -> pilih nomor untuk "Mega"
    user>                       -> email akun Mega kamu
    y/g>                        -> y   (Yes, type in my own password)
    password:                   -> masukkan password, konfirmasi ulang
    2fa>                        -> kosongkan jika tidak pakai 2FA
    Edit advanced config?       -> n
    Keep this "mega" remote?    -> y
    e/n/d/r/c/s/q>              -> q   (keluar dari config)

5. Test koneksi:
    rclone lsd mega:

6. Buat folder tujuan backup:
    rclone mkdir mega:NexSoraBackups

7. Test upload:
    echo "test backup" > /root/test.txt
    rclone copy /root/test.txt mega:NexSoraBackups/
    rclone ls mega:NexSoraBackups/

   Jika muncul "test.txt" di hasil rclone ls, koneksi ke
   Mega sudah berhasil dan siap dipakai script backup.


INSTALASI SCRIPT
-------------------
Pilih salah satu versi:

--- Versi Bash ---
1. nano /root/backup-nexsora.sh
   (paste isi script, sesuaikan SERVER_DIR)
2. chmod +x /root/backup-nexsora.sh
3. Test: /root/backup-nexsora.sh

--- Versi JavaScript ---
1. Pastikan Node.js sudah terinstall (node -v)
2. nano /root/backup-nexsora.js
   (paste isi script, sesuaikan SERVER_DIR)
3. Test: node /root/backup-nexsora.js


JADWAL OTOMATIS (PM2)
----------------------
Backup dijalankan otomatis setiap hari menggunakan PM2 dengan
fitur cron_restart, dijadwalkan jam 20:00 UTC (= 03:00 WIB),
asumsi VPS menggunakan timezone UTC.

Cek timezone VPS dengan:
    timedatectl

Jika VPS sudah menggunakan Asia/Jakarta, ubah jadwal cron di
/root/backup-ecosystem.config.js menjadi:
    cron_restart: "0 3 * * *"

Isi backup-ecosystem.config.js untuk versi Bash:
    script: "/root/backup-nexsora.sh"

Isi backup-ecosystem.config.js untuk versi JavaScript:
    script: "/root/backup-nexsora.js"
    interpreter: "node"

Jalankan:
    pm2 start /root/backup-ecosystem.config.js
    pm2 save
    pm2 startup


PERINTAH PENTING
-----------------
Jalankan backup manual (bash):
    /root/backup-nexsora.sh

Jalankan backup manual (javascript):
    node /root/backup-nexsora.js

Lihat log backup terakhir:
    cat /root/backup.log

Lihat log lewat PM2:
    pm2 logs nexsora-backup

Cek status proses PM2:
    pm2 list

Restart proses PM2 (setelah edit script):
    pm2 restart nexsora-backup

Simpan konfigurasi PM2 (agar tetap ada setelah reboot):
    pm2 save

Setup PM2 auto-start saat VPS reboot:
    pm2 startup

Cek isi folder backup di Mega:
    rclone ls mega:NexSoraBackups/

Cek daftar folder remote Mega:
    rclone lsd mega:

Test upload manual ke Mega:
    rclone copy /root/test.txt mega:NexSoraBackups/


MENGUBAH RETENSI BACKUP (BERAPA HARI DISIMPAN)
------------------------------------------------
Versi Bash - edit /root/backup-nexsora.sh, cari baris:
    rclone delete --min-age 7d "$REMOTE/"

Versi JavaScript - edit /root/backup-nexsora.js, cari baris:
    const RETENTION_DAYS = '7d';

Ganti angka "7d" sesuai kebutuhan, contoh:
    3d  = simpan 3 hari terakhir
    5d  = simpan 5 hari terakhir
    1d  = simpan 1 hari terakhir (paling hemat storage)

Setelah edit, jalankan:
    pm2 restart nexsora-backup


CATATAN PENTING
-----------------
- Akun Mega gratis memiliki kuota 20GB. Pastikan ukuran
  backup x jumlah hari retensi tidak melebihi kuota ini.
- Proses backup tidak memakan kuota data HP, karena semua
  proses (compress + upload) berjalan di VPS, bukan di HP.
- Jika muncul warning "file changed as we read it" saat
  compress, ini normal karena server Minecraft menulis file
  world secara live saat proses backup berjalan bersamaan.
- Log menampilkan setiap file yang sedang di-compress (mode
  verbose), sehingga file /root/backup.log akan bertambah
  besar cukup cepat karena banyaknya file .mca di server.
  Pantau ukurannya secara berkala dengan:
      du -h /root/backup.log
- Simpan file service account / kredensial apapun dengan
  aman, jangan dibagikan ke pihak lain.


TROUBLESHOOTING
-----------------
Masalah: rclone error "storageQuotaExceeded"
Solusi : Ini terjadi jika menggunakan Google Service Account
         tanpa Shared Drive. Sistem ini sudah beralih
         menggunakan Mega.nz sehingga masalah ini tidak lagi
         relevan.

Masalah: Backup tidak jalan otomatis
Solusi : Cek status PM2 dengan "pm2 list", pastikan proses
         "nexsora-backup" ada di daftar. Cek juga apakah
         "pm2 save" dan "pm2 startup" sudah dijalankan.

Masalah: File log terlalu besar
Solusi : Hapus/kosongkan log lama secara berkala, contoh:
             > /root/backup.log
         atau tambahkan logrotate jika ingin otomatis.


==================================================
 Dibuat untuk NexSora Network - nexsora.biz.id
==================================================
