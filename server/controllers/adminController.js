import db from '../config/db.js';

// 1. Get All Users (with details)
export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id, 
        u.email, 
        u.role, 
        u.created_at,
        u.is_active,
        CASE 
          WHEN u.role = 'Manufacturer' THEN m.company_name
          WHEN u.role = 'Retailer' THEN r.business_name
          WHEN u.role = 'Customer' THEN CONCAT(c.first_name, ' ', c.last_name)
          ELSE 'System Admin'
        END as name,
        CASE 
          WHEN u.role = 'Manufacturer' THEN m.license_number
          WHEN u.role = 'Retailer' THEN r.tax_id
          WHEN u.role = 'Customer' THEN c.phone_number
          ELSE NULL
        END as extra_info
      FROM Users u
      LEFT JOIN Manufacturers m ON u.user_id = m.manufacturer_id
      LEFT JOIN Retailers r ON u.user_id = r.retailer_id
      LEFT JOIN Customers c ON u.user_id = c.customer_id
      ORDER BY u.created_at DESC
    `;
    
    // CORRECTED: Removed .promise(), just use await db.query
    const [users] = await db.query(query);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// 2. Monitor Connections (Retailer <-> Manufacturer)
export const getNetworkConnections = async (req, res) => {
  try {
    // CORRECTED SQL: Uses 'Inventory' instead of 'Retailer_Inventory'
    // and correctly joins 'Retailer_Outlets'
    const query = `
      SELECT 
        r.business_name as retailer,
        m.company_name as manufacturer,
        COUNT(i.inventory_id) as products_stocked,
        SUM(i.quantity_on_hand) as total_stock
      FROM Inventory i
      JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
      JOIN Retailers r ON ro.retailer_id = r.retailer_id
      JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
      JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
      GROUP BY r.retailer_id, m.manufacturer_id
    `;
    
    // CORRECTED: Removed .promise()
    const [connections] = await db.query(query);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error fetching network connections' });
  }
};

// 3. Get System Alerts
export const getSystemAlerts = async (req, res) => {
  try {
    // CORRECTED: Removed .promise()
    const [alerts] = await db.query(`
      SELECT 
        ra.alert_id, 
        ra.alert_type, 
        ra.description, 
        ra.created_at as timestamp, 
        ra.severity,
        CASE 
            WHEN ra.related_entity = 'Batch' THEN m_b.company_name
            WHEN ra.related_entity = 'Product' THEN m_p.company_name
            ELSE 'System'
        END as manufacturer,
        'System Alert' as device_type
      FROM Risk_Alerts ra
      LEFT JOIN Batches b ON ra.related_entity = 'Batch' AND ra.entity_id = b.batch_id
      LEFT JOIN Manufacturers m_b ON b.manufacturer_id = m_b.manufacturer_id
      LEFT JOIN Product_Definitions pd ON ra.related_entity = 'Product' AND ra.entity_id = pd.product_def_id
      LEFT JOIN Manufacturers m_p ON pd.manufacturer_id = m_p.manufacturer_id
      ORDER BY ra.created_at DESC
      LIMIT 50
    `);
    
    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
};


export const getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Fetch basic info from Users table (Exclude 'name'/'username' as they don't exist)
    const [users] = await db.query(
      `SELECT user_id, email, role, created_at 
       FROM Users WHERE user_id = ?`, 
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    let details = {};
    let displayName = 'N/A';

    // 2. Fetch details from the specific role table
    const role = user.role.toLowerCase();

    if (role === 'manufacturer') {
      const [m] = await db.query('SELECT * FROM Manufacturers WHERE manufacturer_id = ?', [id]);
      if (m.length > 0) {
        details = m[0];
        displayName = details.company_name;
      }
    } else if (role === 'retailer') {
      const [r] = await db.query('SELECT * FROM Retailers WHERE retailer_id = ?', [id]);
      if (r.length > 0) {
        details = r[0];
        displayName = details.business_name;
      }
    } else if (role === 'customer') {
      const [c] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
      if (c.length > 0) {
        details = c[0];
        displayName = `${details.first_name} ${details.last_name}`;
      }
    }

    // 3. Combine data and map fields for the Frontend
    res.json({ 
      ...user, 
      ...details, 
      username: displayName,           // Send 'username' so the Modal displays the name correctly
      is_verified: user.status === 'active' // Ensure the verify button logic works
    });

  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: error.message });
  }
};