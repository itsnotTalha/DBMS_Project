import db from '../config/db.js';

// --- 1. Get All Users (Main User Monitor) ---
export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id, 
        u.email, 
        u.role, 
        u.created_at,
        CASE 
            WHEN u.is_active = 1 THEN 'Active' 
            ELSE 'Inactive' 
        END as status,
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
    
    const [users] = await db.query(query);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// --- 2. Get User Details (For Modal) ---
export const getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query(
      `SELECT user_id, email, role, created_at, is_active FROM Users WHERE user_id = ?`, 
      [id]
    );

    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];
    let details = {};
    let displayName = 'N/A';
    const role = user.role.toLowerCase();

    if (role === 'manufacturer') {
      const [m] = await db.query('SELECT * FROM Manufacturers WHERE manufacturer_id = ?', [id]);
      if (m.length > 0) { details = m[0]; displayName = details.company_name; }
    } else if (role === 'retailer') {
      const [r] = await db.query('SELECT * FROM Retailers WHERE retailer_id = ?', [id]);
      if (r.length > 0) { details = r[0]; displayName = details.business_name; }
    } else if (role === 'customer') {
      const [c] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
      if (c.length > 0) { details = c[0]; displayName = `${details.first_name} ${details.last_name}`; }
    }

    res.json({ 
      ...user, 
      ...details, 
      username: displayName,
      status: user.is_active ? 'Active' : 'Inactive'
    });

  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- 3. Network Connections ---
export const getNetworkConnections = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.business_name as retailer,
        m.company_name as manufacturer,
        COUNT(i.inventory_id) as products_stocked,
        COALESCE(SUM(i.quantity_on_hand), 0) as total_stock
      FROM Inventory i
      JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
      JOIN Retailers r ON ro.retailer_id = r.retailer_id
      JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
      JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
      GROUP BY r.retailer_id, m.manufacturer_id
    `;
    const [connections] = await db.query(query);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error fetching network connections' });
  }
};

// --- 4. System Alerts ---
export const getSystemAlerts = async (req, res) => {
  try {
    const [alerts] = await db.query(`
      SELECT * FROM Risk_Alerts ORDER BY created_at DESC LIMIT 50
    `);
    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
};

// --- 5. Dashboard Stats (NEW - REQUIRED FOR DASHBOARD) ---
export const getDashboardStats = async (req, res) => {
  try {
    // Run counts in parallel
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM Users');
    const [manuCount] = await db.query('SELECT COUNT(*) as count FROM Manufacturers');
    const [alertCount] = await db.query('SELECT COUNT(*) as count FROM Risk_Alerts');
    
    // You can add a transaction count if you have a transactions table, otherwise 0
    const txnValues = 0; 

    res.json({
      total_users: userCount[0].count,
      active_manufacturers: manuCount[0].count,
      system_alerts: alertCount[0].count,
      total_transactions: txnValues
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Stats error' });
  }
};

// --- 6. Recent Activity (NEW - REQUIRED FOR DASHBOARD) ---
export const getRecentActivity = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.email as user_name,
        u.role as user_role,
        'User Joined' as action,
        'Info' as type,
        u.created_at
      FROM Users u
      ORDER BY u.created_at DESC
      LIMIT 5
    `;
    const [activities] = await db.query(query);
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Activity error' });
  }
};