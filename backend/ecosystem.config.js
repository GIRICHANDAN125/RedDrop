module.exports = {
  apps: [
    {
      name: 'reddropai-backend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      combine_logs: true,
      max_memory_restart: '1G'
    }
  ]
};
