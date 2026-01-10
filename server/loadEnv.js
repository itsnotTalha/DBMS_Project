import dotenv from 'dotenv';

// Load .env file immediately
dotenv.config();

console.log('✅ Environment variables loaded');
console.log('  Host:', process.env.DB_HOST);
console.log('  User:', process.env.DB_USER);
console.log('  DB:', process.env.DB_NAME);
