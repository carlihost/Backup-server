const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.TZ = 'Asia/Jakarta';

const SERVER_DIR = '/var/lib/pterodactyl/volumes/<UUID_SERVER_KAMU>';
const REMOTE = 'mega:NexSoraBackups';
const LOG_FILE = '/root/backup-server/backup.log';
const RETENTION_DAYS = '7d';

function getDate() {
  return new Date().toISOString().split('T')[0];
}

function getTime() {
  return new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }) + ' WIB';
}

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

function boxTop() { log('┌──────────────────────────────────────────┐'); }
function boxMid() { log('├──────────────────────────────────────────┤'); }
function boxBot() { log('└──────────────────────────────────────────┘'); }
function boxLine(text) { log('│ ' + text.padEnd(42) + ' │'); }

function drawBar(pct) {
  const filled = Math.floor(pct / 5);
  const empty = 20 - filled;
  const bar = '#'.repeat(filled) + '.'.repeat(empty);
  log(`>> [${bar}] ${pct}%`);
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)}${units[i]}`;
}

function compressWithProgress(serverDir, tarFile) {
  return new Promise((resolve) => {
    const tar = spawn('tar', ['-czvf', tarFile, '-C', serverDir, '.']);

    tar.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach(line => log(`   -> ${line}`));
    });

    tar.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function runBackup() {
  const DATE = getDate();
  const TIME = getTime();
  const BACKUP_DIR = `/tmp/backup-${DATE}`;
  const TAR_FILE = path.join(BACKUP_DIR, `nexsora-${DATE}.tar.gz`);

  let compressStatus = '-';
  let uploadStatus = '-';
  let fileSize = '-';

  boxTop();
  boxLine('NEXSORA BACKUP');
  boxMid();
  boxLine(`Mulai   : ${TIME}`);
  boxLine(`Server  : ${SERVER_DIR}`);
  boxBot();

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  log('>> Compressing, memproses file:');

  const success = await compressWithProgress(SERVER_DIR, TAR_FILE);
  drawBar(100);

  if (success) {
    compressStatus = 'OK';
    const stats = fs.statSync(TAR_FILE);
    fileSize = formatSize(stats.size);

    log('>> Uploading ke Mega...');
    try {
      execSync(`rclone copy "${TAR_FILE}" "${REMOTE}/"`, { stdio: 'ignore' });
      uploadStatus = 'OK';
    } catch (err) {
      uploadStatus = 'GAGAL';
      log(`>> Upload error: ${err.message}`);
    }
  } else {
    compressStatus = 'GAGAL';
  }

  fs.rmSync(BACKUP_DIR, { recursive: true, force: true });

  try {
    execSync(`rclone delete --min-age ${RETENTION_DAYS} "${REMOTE}/"`, { stdio: 'ignore' });
  } catch (err) {
    log(`>> Cleanup error: ${err.message}`);
  }

  const FINISH_TIME = getTime();

  boxTop();
  boxLine('RINGKASAN BACKUP');
  boxMid();
  boxLine(`Compress   : ${compressStatus}`);
  boxLine(`Ukuran     : ${fileSize}`);
  boxLine(`Upload     : ${uploadStatus}`);
  boxLine(`Cleanup    : Backup >${RETENTION_DAYS.replace('d', '')} hari dihapus`);
  boxMid();
  boxLine(`Selesai    : ${FINISH_TIME}`);
  boxBot();
  log('');
}

runBackup().catch(err => {
  log(`>> FATAL ERROR: ${err.message}`);
  process.exit(1);
});
