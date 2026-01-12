import db from '../config/db.js';

// ------------------------------------------------------------------
// GET CUSTOMER DASHBOARD STATS
// ------------------------------------------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get order counts by status
    const [[orderStats]] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('Processing', 'Out_for_Delivery') THEN 1 ELSE 0 END) as active_orders,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) as pending_orders
      FROM Customer_Orders
      WHERE customer_id = ?
    `, [customerId]);

    // Get verified products count
    const [[verificationStats]] = await db.query(`
      SELECT COUNT(DISTINCT serial_code) as verified_count
      FROM QR_Scan_Logs
      WHERE scanned_by_user = ?
    `, [customerId]);

    // Get orders this week vs last week for trend
    const [[weeklyTrend]] = await db.query(`
      SELECT 
        SUM(CASE WHEN order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week,
        SUM(CASE WHEN order_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) 
            AND order_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as last_week
      FROM Customer_Orders
      WHERE customer_id = ?
    `, [customerId]);

    res.json({
      stats: {
        active_orders: parseInt(orderStats?.active_orders) || 0,
        completed_orders: parseInt(orderStats?.completed_orders) || 0,
        pending_orders: parseInt(orderStats?.pending_orders) || 0,
        total_orders: parseInt(orderStats?.total_orders) || 0,
        verified_products: parseInt(verificationStats?.verified_count) || 0,
        orders_this_week: parseInt(weeklyTrend?.this_week) || 0,
        orders_last_week: parseInt(weeklyTrend?.last_week) || 0
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// ------------------------------------------------------------------
// GET CURRENT/ACTIVE ORDERS
// ------------------------------------------------------------------
export const getCurrentOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [orders] = await db.query(`
      SELECT 
        co.order_id,
        co.order_date,
        co.total_amount,
        co.status,
        co.payment_method,
        ro.location_name as outlet_name,
        d.tracking_number,
        d.current_location,
        d.estimated_arrival,
        d.status as delivery_status
      FROM Customer_Orders co
      LEFT JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
      LEFT JOIN Deliveries d ON co.order_id = d.order_id
      WHERE co.customer_id = ? 
        AND co.status IN ('Processing', 'Out_for_Delivery')
      ORDER BY co.order_date DESC
    `, [customerId]);

    // Get items for each order
    for (const order of orders) {
      const [items] = await db.query(`
        SELECT 
          oi.quantity,
          oi.unit_price,
          pd.name,
          pd.category,
          pd.image_url
        FROM Order_Items oi
        JOIN Product_Definitions pd ON oi.product_def_id = pd.product_def_id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }

    res.json({ orders });

  } catch (error) {
    console.error('Get current orders error:', error);
    res.status(500).json({ error: 'Failed to fetch current orders' });
  }
};

// ------------------------------------------------------------------
// GET VERIFICATION HISTORY
// ------------------------------------------------------------------
export const getVerificationHistory = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [verifications] = await db.query(`
      SELECT 
        qsl.scan_id,
        qsl.serial_code,
        qsl.scan_result,
        qsl.scan_time,
        qsl.geo_lat,
        qsl.geo_lng,
        pi.status as product_status,
        pd.name as product_name,
        pd.category,
        pd.image_url,
        m.company_name as manufacturer_name,
        b.batch_number,
        b.manufacturing_date,
        b.expiry_date
      FROM QR_Scan_Logs qsl
      LEFT JOIN Product_Items pi ON qsl.serial_code = pi.serial_code
      LEFT JOIN Batches b ON pi.batch_id = b.batch_id
      LEFT JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
      LEFT JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
      WHERE qsl.scanned_by_user = ?
      ORDER BY qsl.scan_time DESC
      LIMIT 50
    `, [customerId]);

    res.json({ verifications });

  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({ error: 'Failed to fetch verification history' });
  }
};

// ------------------------------------------------------------------
// VERIFY PRODUCT (Customer authenticated)
// ------------------------------------------------------------------
export const verifyProductAuthenticated = async (req, res) => {
  try {
    const customerId = req.user.id;
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

    // Check if product is expired
    const isExpired = productItem ? new Date(productItem.expiry_date) < new Date() : false;

    if (!productItem) {
      // Log failed scan
      await db.query(
        `INSERT INTO QR_Scan_Logs (serial_code, scanned_by_user, scan_result) VALUES (?, ?, 'Fake')`,
        [serial_code, customerId]
      ).catch(() => {});

      return res.json({
        verified: false,
        status: 'fake',
        error: 'Product not found in database',
        serial_code
      });
    }

    // Log valid scan
    await db.query(
      `INSERT INTO QR_Scan_Logs (serial_code, scanned_by_user, scan_result) VALUES (?, ?, ?)`,
      [serial_code, customerId, isExpired ? 'Valid' : 'Valid']
    );

    // Get supply chain timeline
    const [timeline] = await db.query(`
      SELECT 
        pt.action,
        pt.location,
        pt.created_at,
        CASE 
          WHEN u.role = 'Manufacturer' THEN (SELECT company_name FROM Manufacturers WHERE manufacturer_id = u.user_id)
          WHEN u.role = 'Retailer' THEN (SELECT business_name FROM Retailers WHERE retailer_id = u.user_id)
          ELSE u.email
        END as actor_name,
        u.role as actor_role
      FROM Product_Transactions pt
      LEFT JOIN Users u ON pt.actor_user_id = u.user_id
      WHERE pt.item_id = ?
      ORDER BY pt.created_at ASC
    `, [productItem.item_id]);

    res.json({
      verified: true,
      status: isExpired ? 'expired' : 'authentic',
      product: {
        serial_code: productItem.serial_code,
        name: productItem.product_name,
        description: productItem.description,
        category: productItem.category,
        price: productItem.base_price,
        image_url: productItem.image_url,
        manufacturer: productItem.manufacturer_name,
        license_number: productItem.license_number,
        batch_number: productItem.batch_number,
        manufacturing_date: productItem.manufacturing_date,
        expiry_date: productItem.expiry_date,
        current_status: productItem.status,
        is_expired: isExpired
      },
      timeline,
      verified_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify product error:', error);
    res.status(500).json({ error: 'Failed to verify product' });
  }
};

// ------------------------------------------------------------------
// SUBMIT COUNTERFEIT REPORT
// ------------------------------------------------------------------
export const submitReport = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { serial_code, issue_type, description, product_name } = req.body;

    if (!serial_code || !issue_type) {
      return res.status(400).json({ error: 'Serial code and issue type are required' });
    }

    // Create a risk alert
    await db.query(`
      INSERT INTO Risk_Alerts (alert_type, severity, related_entity, description, status)
      VALUES (?, ?, ?, ?, 'New')
    `, [
      issue_type,
      issue_type === 'Counterfeit' ? 'High' : 'Medium',
      'Product',
      `Customer Report - Serial: ${serial_code}, Product: ${product_name || 'Unknown'}, Issue: ${issue_type}. Details: ${description || 'No additional details provided.'}`
    ]);

    // Update QR scan log if exists
    await db.query(`
      UPDATE QR_Scan_Logs 
      SET scan_result = 'Fake' 
      WHERE serial_code = ? AND scanned_by_user = ?
    `, [serial_code, customerId]);

    res.json({ 
      success: true, 
      message: 'Report submitted successfully. Our team will investigate.' 
    });

  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

// ------------------------------------------------------------------
// GET CUSTOMER REPORTS
// ------------------------------------------------------------------
export const getCustomerReports = async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT 
        alert_id,
        alert_type,
        severity,
        description,
        created_at,
        status
      FROM Risk_Alerts
      WHERE related_entity = 'Product' 
        AND description LIKE 'Customer Report%'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({ reports });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// ------------------------------------------------------------------
// PLACE CUSTOMER ORDER
// Order starts as 'Processing' - stock is NOT deducted until customer confirms receipt
// ------------------------------------------------------------------
export const placeOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const customerId = req.user.id;
    const { outlet_id, items, shipping_address, payment_method = 'Cash' } = req.body;

    if (!outlet_id || !items || items.length === 0) {
      throw new Error('Outlet and items are required');
    }

    // Calculate total and validate inventory stock
    let totalAmount = 0;
    for (const item of items) {
      // Check inventory availability at the outlet
      const [inventory] = await connection.query(
        `SELECT i.quantity_on_hand, pd.base_price, pd.name 
         FROM Inventory i
         JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
         WHERE i.outlet_id = ? AND i.product_def_id = ? AND pd.is_active = TRUE`,
        [outlet_id, item.product_def_id]
      );

      if (inventory.length === 0) {
        throw new Error(`Product ${item.product_def_id} not available at this outlet`);
      }

      if (inventory[0].quantity_on_hand < item.quantity) {
        throw new Error(`Insufficient stock for ${inventory[0].name}. Available: ${inventory[0].quantity_on_hand}`);
      }

      totalAmount += item.unit_price * item.quantity;
    }

    // Create the order with 'Processing' status
    const [orderResult] = await connection.query(
      `INSERT INTO Customer_Orders (customer_id, outlet_id, total_amount, payment_method, status) 
       VALUES (?, ?, ?, ?, 'Processing')`,
      [customerId, outlet_id, totalAmount, payment_method]
    );

    const orderId = orderResult.insertId;

    // Create order items (stock NOT deducted yet - only when customer confirms receipt)
    for (const item of items) {
      await connection.query(
        `INSERT INTO Order_Items (order_id, product_def_id, quantity, unit_price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_def_id, item.quantity, item.unit_price]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully.',
      order: {
        order_id: orderId,
        total_amount: totalAmount,
        status: 'Processing'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Place order error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ------------------------------------------------------------------
// CONFIRM ORDER RECEIVED
// Customer confirms receipt - this triggers stock deduction
// ------------------------------------------------------------------
export const confirmOrderReceived = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const customerId = req.user.id;
    const { orderId } = req.params;

    // Verify order belongs to customer and is Out_for_Delivery
    const [[order]] = await connection.query(`
      SELECT order_id, status, outlet_id
      FROM Customer_Orders
      WHERE order_id = ? AND customer_id = ?
    `, [orderId, customerId]);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'Out_for_Delivery') {
      throw new Error(`Cannot confirm receipt for order with status: ${order.status}`);
    }

    // Get order items
    const [items] = await connection.query(
      'SELECT product_def_id, quantity FROM Order_Items WHERE order_id = ?',
      [orderId]
    );

    // Deduct from retailer inventory
    for (const item of items) {
      await connection.query(
        `UPDATE Inventory 
         SET quantity_on_hand = quantity_on_hand - ? 
         WHERE outlet_id = ? AND product_def_id = ?`,
        [item.quantity, order.outlet_id, item.product_def_id]
      );
    }

    // Update order status to Completed
    await connection.query(
      'UPDATE Customer_Orders SET status = ? WHERE order_id = ?',
      ['Completed', orderId]
    );

    // Update delivery status
    await connection.query(
      `UPDATE Deliveries SET status = 'Delivered', delivered_at = NOW() WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit();

    res.json({ message: 'Order receipt confirmed. Thank you!', orderId });

  } catch (error) {
    await connection.rollback();
    console.error('Confirm order received error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ------------------------------------------------------------------
// GET CUSTOMER ORDERS
// ------------------------------------------------------------------
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [orders] = await db.query(`
      SELECT 
        co.order_id,
        co.order_date,
        co.total_amount,
        co.status,
        co.payment_method,
        ro.location_name as outlet_name,
        d.tracking_number,
        d.current_location,
        d.estimated_arrival,
        d.status as delivery_status
      FROM Customer_Orders co
      LEFT JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
      LEFT JOIN Deliveries d ON co.order_id = d.order_id
      WHERE co.customer_id = ?
      ORDER BY co.order_date DESC
    `, [customerId]);

    // Get items for each order
    for (const order of orders) {
      const [items] = await db.query(`
        SELECT 
          oi.quantity,
          oi.unit_price,
          pd.name,
          pd.category,
          pd.image_url
        FROM Order_Items oi
        JOIN Product_Definitions pd ON oi.product_def_id = pd.product_def_id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
    }

    res.json({ orders });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ------------------------------------------------------------------
// GET CUSTOMER PROFILE
// ------------------------------------------------------------------
export const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [customers] = await db.query(`
      SELECT 
        u.email,
        c.first_name,
        c.last_name,
        c.phone_number
      FROM Users u
      JOIN Customers c ON u.user_id = c.customer_id
      WHERE u.user_id = ?
    `, [customerId]);

    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ profile: customers[0] });

  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
