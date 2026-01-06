import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


(async () => {
    try {
        const connection = await db.getConnection();
        console.log('MySQL Database Connected Successfully!');
        connection.release();
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
    }
})();

export default db;