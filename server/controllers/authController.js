import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  const connection = await db.getConnection(); // Get dedicated connection for transaction
  
  try {
    await connection.beginTransaction(); // Start Transaction

    const { email, password, role, ...profileData } = req.body;

    // 1. Check if user exists
    const [existingUser] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into Users Table
    const [userResult] = await connection.query(
      'INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    const userId = userResult.insertId;

    // 4. Insert into Specific Role Table based on Role
    // This ensures we satisfy the Foreign Key constraints immediately
    if (role === 'Manufacturer') {
      if (!profileData.company_name || !profileData.license_number) {
        throw new Error('Company Name and License Number are required for Manufacturers');
      }
      await connection.query(
        'INSERT INTO Manufacturers (manufacturer_id, company_name, license_number, contract_details) VALUES (?, ?, ?, ?)',
        [userId, profileData.company_name, profileData.license_number, profileData.contract_details || '']
      );
    } 
    else if (role === 'Retailer') {
      if (!profileData.business_name || !profileData.tax_id || !profileData.headquarters_address) {
        throw new Error('Business Name, Tax ID, and Address are required for Retailers');
      }
      await connection.query(
        'INSERT INTO Retailers (retailer_id, business_name, tax_id, headquarters_address) VALUES (?, ?, ?, ?)',
        [userId, profileData.business_name, profileData.tax_id, profileData.headquarters_address]
      );
    }
    else if (role === 'Customer') {
      if (!profileData.first_name || !profileData.last_name) {
        throw new Error('First Name and Last Name are required for Customers');
      }
      await connection.query(
        'INSERT INTO Customers (customer_id, first_name, last_name, phone_number) VALUES (?, ?, ?, ?)',
        [userId, profileData.first_name, profileData.last_name, profileData.phone_number || '']
      );
    }

    await connection.commit(); // Save everything

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(userId, role),
      user: { id: userId, email, role }
    });

  } catch (error) {
    await connection.rollback(); // If anything fails, undo everything
    console.error(error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release(); // Release connection back to pool
  }
};


// ------------------------------------------------------------------
// LOGIN USER (Updated to fetch Name)
// ------------------------------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Fetch Specific Name based on Role
    let name = "User"; // Fallback
    let detailsQuery = "";

    if (user.role === 'Customer') {
      detailsQuery = 'SELECT first_name, last_name FROM Customers WHERE customer_id = ?';
    } else if (user.role === 'Manufacturer') {
      detailsQuery = 'SELECT company_name FROM Manufacturers WHERE manufacturer_id = ?';
    } else if (user.role === 'Retailer') {
      detailsQuery = 'SELECT business_name FROM Retailers WHERE retailer_id = ?';
    }

    // If a role-specific query exists, execute it
    if (detailsQuery) {
      const [details] = await db.query(detailsQuery, [user.user_id]);
      if (details.length > 0) {
        if (user.role === 'Customer') {
          name = `${details[0].first_name} ${details[0].last_name}`;
        } else if (user.role === 'Manufacturer') {
          name = details[0].company_name;
        } else if (user.role === 'Retailer') {
          name = details[0].business_name;
        }
      }
    } else if (user.role === 'Admin') {
      name = "Administrator";
    }

    // 4. Return Token & User Info (Including Name)
    res.json({
      message: 'Login successful',
      token: generateToken(user.user_id, user.role),
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        name: name // <--- Sending the name to frontend
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};