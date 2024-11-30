console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Environment variables:');
console.log('TELEGRAM_BOT_TOKEN exists:', !!process.env.TELEGRAM_BOT_TOKEN);
console.log('TELEGRAM_CHAT_ID exists:', !!process.env.TELEGRAM_CHAT_ID);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
