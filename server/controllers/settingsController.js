import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// ------------------------------------------------------------------
// GET USER PROFILE
// ------------------------------------------------------------------
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get base user info
    const [users] = await db.query('SELECT user_id, email, role FROM Users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    let profileData = {};

    // Get role-specific data
    if (userRole === 'Customer') {
      const [customers] = await db.query('SELECT first_name, last_name, phone_number FROM Customers WHERE customer_id = ?', [userId]);
      if (customers.length > 0) {
        profileData = customers[0];
      }
    } else if (userRole === 'Manufacturer') {
      const [manufacturers] = await db.query('SELECT company_name, license_number, contract_details FROM Manufacturers WHERE manufacturer_id = ?', [userId]);
      if (manufacturers.length > 0) {
        profileData = manufacturers[0];
      }
    } else if (userRole === 'Retailer') {
      const [retailers] = await db.query('SELECT business_name, tax_id, headquarters_address FROM Retailers WHERE retailer_id = ?', [userId]);
      if (retailers.length > 0) {
        profileData = retailers[0];
      }
    }

    res.json({
      ...user,
      ...profileData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ------------------------------------------------------------------
// UPDATE USER NAME
// ------------------------------------------------------------------
export const updateUserName = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, first_name, last_name, company_name, business_name } = req.body;

    let updatedName = '';

    if (userRole === 'Customer') {
      const fName = first_name || name?.split(' ')[0] || '';
      const lName = last_name || name?.split(' ').slice(1).join(' ') || '';
      
      if (!fName) {
        throw new Error('First name is required');
      }

      await connection.query(
        'UPDATE Customers SET first_name = ?, last_name = ? WHERE customer_id = ?',
        [fName, lName, userId]
      );
      updatedName = `${fName} ${lName}`.trim();

    } else if (userRole === 'Manufacturer') {
      const companyName = company_name || name;
      if (!companyName) {
        throw new Error('Company name is required');
      }

      await connection.query(
        'UPDATE Manufacturers SET company_name = ? WHERE manufacturer_id = ?',
        [companyName, userId]
      );
      updatedName = companyName;

    } else if (userRole === 'Retailer') {
      const businessName = business_name || name;
      if (!businessName) {
        throw new Error('Business name is required');
      }

      await connection.query(
        'UPDATE Retailers SET business_name = ? WHERE retailer_id = ?',
        [businessName, userId]
      );
      updatedName = businessName;

    } else if (userRole === 'Admin') {
      // Admins don't have a separate profile table, just return success
      updatedName = 'Administrator';
    }

    await connection.commit();

    res.json({
      message: 'Name updated successfully',
      name: updatedName
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update name error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ------------------------------------------------------------------
// CHANGE PASSWORD
// ------------------------------------------------------------------
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    // if (newPassword.length < 6) {
    //   return res.status(400).json({ error: 'New password must be at least 6 characters' });
    // }

    // Get current password hash
    const [users] = await db.query('SELECT password_hash FROM Users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [hashedPassword, userId]);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ------------------------------------------------------------------
// RESET USER DATA (Clear all user-specific data)
// ------------------------------------------------------------------
export const resetUserData = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'Manufacturer') {
      // Delete shipments related to manufacturer's batches
      await connection.query(`
        DELETE s FROM Shipments s
        INNER JOIN ProductionBatches pb ON s.batch_id = pb.batch_id
        WHERE pb.manufacturer_id = ?
      `, [userId]);

      // Delete IoT sensor readings for manufacturer's batches
      await connection.query(`
        DELETE isr FROM IoTSensorReadings isr
        INNER JOIN IoTDevices id ON isr.device_id = id.device_id
        INNER JOIN ProductionBatches pb ON id.batch_id = pb.batch_id
        WHERE pb.manufacturer_id = ?
      `, [userId]);

      // Delete IoT devices for manufacturer's batches
      await connection.query(`
        DELETE id FROM IoTDevices id
        INNER JOIN ProductionBatches pb ON id.batch_id = pb.batch_id
        WHERE pb.manufacturer_id = ?
      `, [userId]);

      // Delete ledger entries for manufacturer's batches
      await connection.query(`
        DELETE le FROM LedgerEntries le
        INNER JOIN ProductionBatches pb ON le.batch_id = pb.batch_id
        WHERE pb.manufacturer_id = ?
      `, [userId]);

      // Delete product units for manufacturer's batches
      await connection.query(`
        DELETE pu FROM ProductUnits pu
        INNER JOIN ProductionBatches pb ON pu.batch_id = pb.batch_id
        WHERE pb.manufacturer_id = ?
      `, [userId]);

      // Delete production batches
      await connection.query('DELETE FROM ProductionBatches WHERE manufacturer_id = ?', [userId]);

      // Delete order items for manufacturer's products
      await connection.query(`
        DELETE oi FROM OrderItems oi
        INNER JOIN Products p ON oi.product_id = p.product_id
        WHERE p.manufacturer_id = ?
      `, [userId]);

      // Delete orders for manufacturer
      await connection.query('DELETE FROM Orders WHERE manufacturer_id = ?', [userId]);

      // Delete products
      await connection.query('DELETE FROM Products WHERE manufacturer_id = ?', [userId]);

    } else if (userRole === 'Retailer') {
      // Delete order items for retailer's orders
      await connection.query(`
        DELETE oi FROM OrderItems oi
        INNER JOIN Orders o ON oi.order_id = o.order_id
        WHERE o.retailer_id = ?
      `, [userId]);

      // Delete shipments for retailer
      await connection.query('DELETE FROM Shipments WHERE retailer_id = ?', [userId]);

      // Delete orders for retailer
      await connection.query('DELETE FROM Orders WHERE retailer_id = ?', [userId]);

      // Reset retailer outlets if any
      await connection.query('DELETE FROM RetailerOutlets WHERE retailer_id = ?', [userId]);

    } else if (userRole === 'Customer') {
      // Delete customer verifications
      await connection.query('DELETE FROM ProductVerifications WHERE customer_id = ?', [userId]);

      // Delete customer addresses
      await connection.query('DELETE FROM CustomerAddresses WHERE customer_id = ?', [userId]);

    } else if (userRole === 'Admin') {
      // Admins can clear system-wide data - be careful!
      // For now, we just return a message
      return res.json({ message: 'Admin data reset is not supported for safety reasons' });
    }

    await connection.commit();

    res.json({ 
      message: 'All your data has been reset successfully',
      role: userRole
    });

  } catch (error) {
    await connection.rollback();
    console.error('Reset data error:', error);
    res.status(500).json({ error: 'Failed to reset data. ' + error.message });
  } finally {
    connection.release();
  }
};
