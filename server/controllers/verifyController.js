import db from '../config/db.js';
import crypto from 'crypto';

// ============================================
// VERIFY PRODUCT (Global - No Auth Required)
// ============================================
export const verifyProduct = async (req, res) => {
  try {
    const { serial_code } = req.params;

    if (!serial_code) {
      return res.status(400).json({ verified: false, error: 'Serial code is required' });
    }

    // Get product item with all related data
    const [[productItem]] = await db.query(
      `SELECT 
        pi.item_id, pi.serial_code, pi.authentication_hash, pi.status, pi.created_at,
        b.batch_id, b.batch_number, b.manufacturing_date, b.expiry_date, b.status as batch_status,
        pd.product_def_id, pd.name as product_name, pd.description, pd.category, 
        pd.base_price, pd.image_url,
        m.manufacturer_id, m.company_name as manufacturer_name, m.license_number
       FROM Product_Items pi
       JOIN Batches b ON pi.batch_id = b.batch_id
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
       WHERE pi.serial_code = ?`,
      [serial_code]
    );

    if (!productItem) {
      // Log failed scan attempt
      await db.query(
        `INSERT INTO QR_Scan_Logs (serial_code, scan_result) VALUES (?, 'Fake')`,
        [serial_code]
      ).catch(() => {}); // Ignore if foreign key fails

      return res.json({
        verified: false,
        error: 'Product not found in database',
        serial_code
      });
    }

    // Verify the hash
    const QR_SECRET = process.env.QR_SECRET || 'default_qr_secret';
    const expectedHash = crypto
      .createHash('sha256')
      .update(`${productItem.serial_code}-${QR_SECRET}`)
      .digest('hex');

    const hashValid = productItem.authentication_hash === expectedHash;

    // Check for duplicate scans (potential counterfeiting)
    const [[scanCount]] = await db.query(
      `SELECT COUNT(*) as count FROM QR_Scan_Logs 
       WHERE serial_code = ? AND scan_result = 'Valid' 
       AND scan_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [serial_code]
    );

    const isDuplicate = scanCount.count > 5; // More than 5 valid scans in 24h is suspicious

    // Log this scan
    await db.query(
      `INSERT INTO QR_Scan_Logs (serial_code, scan_result) VALUES (?, ?)`,
      [serial_code, isDuplicate ? 'Duplicate' : (hashValid ? 'Valid' : 'Fake')]
    );

    // Get blockchain history (Product_Transactions)
    const [blockchain_history] = await db.query(
      `SELECT 
        pt.tx_id, pt.action, pt.location, pt.previous_hash, pt.current_hash, pt.created_at,
        u.email as actor_email,
        CASE 
          WHEN u.role = 'Manufacturer' THEN (SELECT company_name FROM Manufacturers WHERE manufacturer_id = u.user_id)
          WHEN u.role = 'Retailer' THEN (SELECT business_name FROM Retailers WHERE retailer_id = u.user_id)
          ELSE CONCAT(u.email)
        END as actor_name
       FROM Product_Transactions pt
       LEFT JOIN Users u ON pt.actor_user_id = u.user_id
       WHERE pt.item_id = ?
       ORDER BY pt.created_at ASC`,
      [productItem.item_id]
    );

    // Get scan history
    const [scan_history] = await db.query(
      `SELECT scan_id, scan_result, scan_time, geo_lat, geo_lng
       FROM QR_Scan_Logs
       WHERE serial_code = ?
       ORDER BY scan_time DESC LIMIT 20`,
      [serial_code]
    );

    // Get current retailer (if in inventory)
    let current_retailer = null;
    const [[inventoryInfo]] = await db.query(
      `SELECT r.business_name, r.retailer_id, ro.location_name, ro.address,
              i.quantity_on_hand, i.aisle, i.shelf, i.section
       FROM Inventory i
       JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
       JOIN Retailers r ON ro.retailer_id = r.retailer_id
       WHERE i.product_def_id = ? AND i.quantity_on_hand > 0
       LIMIT 1`,
      [productItem.product_def_id]
    );

    if (inventoryInfo) {
      current_retailer = {
        name: inventoryInfo.business_name,
        location: inventoryInfo.location_name,
        address: inventoryInfo.address
      };
    }

    // Check for recalls
    const [[recallInfo]] = await db.query(
      `SELECT recall_id, reason, recall_date, status
       FROM Recalls
       WHERE batch_id = ? AND status = 'Active'`,
      [productItem.batch_id]
    );

    res.json({
      verified: hashValid && !isDuplicate,
      warning: isDuplicate ? 'Multiple scans detected - potential counterfeit' : null,
      product: {
        serial_code: productItem.serial_code,
        product_name: productItem.product_name,
        description: productItem.description,
        category: productItem.category,
        image_url: productItem.image_url,
        base_price: productItem.base_price,
        status: productItem.status,
        batch_number: productItem.batch_number,
        manufacturing_date: productItem.manufacturing_date,
        expiry_date: productItem.expiry_date,
        batch_status: productItem.batch_status
      },
      manufacturer: {
        name: productItem.manufacturer_name,
        license_number: productItem.license_number
      },
      current_retailer,
      recall: recallInfo || null,
      blockchain_history,
      scan_history,
      verification_timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Verify product error:', error);
    res.status(500).json({ verified: false, error: error.message });
  }
};

export default { verifyProduct };
