import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file immediately
dotenv.config({ path: `${__dirname}/.env` });

console.log('✅ Environment variables loaded');
console.log('  Host:', process.env.DB_HOST);
console.log('  User:', process.env.DB_USER);
console.log('  DB:', process.env.DB_NAME);
