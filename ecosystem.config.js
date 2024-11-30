module.exports = {
  apps: [{
    name: 'crypto-article',
    script: 'dist/main.js',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    env_file: '.env', // Specify the .env file to load
    watch: true,
    instance_var: 'INSTANCE_ID',
  }]
};
