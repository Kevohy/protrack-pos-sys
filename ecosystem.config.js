module.exports = {
  apps: [
    {
      name: "pos-saas",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      error_file: "/var/log/pos-saas/error.log",
      out_file: "/var/log/pos-saas/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M",
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
    },
  ],
};
