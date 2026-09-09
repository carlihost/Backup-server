module.exports = {
  apps: [{
    name: "nexsora-backup",
    script: "/root/Backup-server/backup-nexsora.js",
    interpreter: "node",
    cron_restart: "0 20 * * *",
    autorestart: false,
    watch: false
  }]
}
