import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create a direct connection for the seed script
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'talha', // Put your DB password here
    database: 'supply_chain_db3' // Ensure this matches your DB name
});

const seedAdmin = async () => {
    const email = 'admin@besspas.com';
    const password = 'admin123'; // The password you want to use
    const role = 'Admin';

    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    connection.connect();

    // 2. Insert into Users Table
    const userQuery = "INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)";
    
    connection.query(userQuery, [email, passwordHash, role], (err, results) => {
        if (err) {
            console.error("Error creating User:", err);
            connection.end();
            return;
        }

        const adminId = results.insertId;
        console.log(`User created with ID: ${adminId}`);

        // 3. Insert into Admins Table
        // Note: admin_id matches the user_id (1-to-1 relationship)
        const adminQuery = "INSERT INTO Admins (admin_id, permissions_level, department) VALUES (?, ?, ?)";
        
        connection.query(adminQuery, [adminId, 'SuperAdmin', 'IT Support'], (err, res) => {
            if (err) {
                console.error("Error creating Admin profile:", err);
            } else {
                console.log("✅ Admin Seeded Successfully!");
                console.log(`Login with -> Email: ${email} | Password: ${password}`);
            }
            connection.end();
        });
    });
};

seedAdmin();