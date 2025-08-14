module.exports = {
  apps: [
    {
      name: 'callbreak',
      script: 'npm start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 5,
      restart_delay: 4000,
      max_memory_restart: '250M',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'LOCAL',
      },
    },
  ],
};
