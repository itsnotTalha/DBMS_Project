import db from '../config/db.js';

// ============================================
// GET MANUFACTURER PRODUCTS
// ============================================
export const getManufacturerProducts = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [products] = await db.query(
      `SELECT product_def_id, name, description, category, base_price, 
              current_stock, reserved_stock, is_active, image_url
       FROM Product_Definitions
       WHERE manufacturer_id = ?
       ORDER BY name ASC`,
      [manufacturerId]
    );

    res.json(products);
  } catch (error) {
    console.error('Get manufacturer products error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREATE PRODUCT
// ============================================
export const createProduct = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const { name, description, category, base_price, current_stock, image_url } = req.body;

    if (!name || !base_price) {
      return res.status(400).json({ error: 'Name and base_price are required' });
    }

    const [result] = await db.query(
      `INSERT INTO Product_Definitions 
       (manufacturer_id, name, description, category, base_price, current_stock, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [manufacturerId, name, description || '', category || '', base_price, current_stock || 0, image_url || '']
    );

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET PRODUCT DETAILS
// ============================================
export const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const manufacturerId = req.user.id;

    const [[product]] = await db.query(
      `SELECT * FROM Product_Definitions 
       WHERE product_def_id = ? AND manufacturer_id = ?`,
      [productId, manufacturerId]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// UPDATE PRODUCT STOCK
// ============================================
export const updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const manufacturerId = req.user.id;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const [result] = await db.query(
      `UPDATE Product_Definitions 
       SET current_stock = ? 
       WHERE product_def_id = ? AND manufacturer_id = ?`,
      [quantity, productId, manufacturerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET B2B ORDERS FOR MANUFACTURER
// ============================================
export const getB2BOrders = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [orders] = await db.query(
      `SELECT bo.b2b_order_id, bo.order_date, bo.status, bo.total_amount,
              r.business_name, r.tax_id, r.retailer_id
       FROM B2B_Orders bo
       JOIN Retailers r ON bo.retailer_id = r.retailer_id
       WHERE bo.manufacturer_id = ?
       ORDER BY bo.order_date DESC`,
      [manufacturerId]
    );

    // Fetch line items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [lineItems] = await db.query(
          `SELECT oli.line_item_id, oli.product_def_id, oli.quantity_ordered, oli.unit_price,
                  pd.name as product_name
           FROM Order_Line_Items oli
           JOIN Product_Definitions pd ON oli.product_def_id = pd.product_def_id
           WHERE oli.b2b_order_id = ?`,
          [order.b2b_order_id]
        );
        return {
          ...order,
          items: lineItems
        };
      })
    );

    res.json({ data: ordersWithItems });
  } catch (error) {
    console.error('Get B2B orders error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ACCEPT B2B ORDER (Transactional)
// ============================================
export const acceptB2BOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { orderId } = req.params;
    const manufacturerId = req.user.id;

    // Verify order belongs to this manufacturer
    const [[order]] = await connection.query(
      'SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND manufacturer_id = ?',
      [orderId, manufacturerId]
    );

    if (!order) {
      throw new Error('Order not found');
    }

    // Get order line items to check stock availability
    const [lineItems] = await connection.query(
      `SELECT oli.product_def_id, oli.quantity_ordered 
       FROM Order_Line_Items oli 
       WHERE oli.b2b_order_id = ?`,
      [orderId]
    );

    // Check if manufacturer has sufficient stock for all items
    const insufficientItems = [];
    for (const lineItem of lineItems) {
      const [[product]] = await connection.query(
        'SELECT current_stock FROM Product_Definitions WHERE product_def_id = ? AND manufacturer_id = ?',
        [lineItem.product_def_id, manufacturerId]
      );

      if (!product || product.current_stock < lineItem.quantity_ordered) {
        insufficientItems.push({
          productId: lineItem.product_def_id,
          requestedQty: lineItem.quantity_ordered,
          availableQty: product ? product.current_stock : 0
        });
      }
    }

    // If insufficient stock, return error
    if (insufficientItems.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Insufficient stock for one or more items',
        insufficientItems: insufficientItems
      });
    }

    // Deduct stock for all items
    for (const lineItem of lineItems) {
      await connection.query(
        `UPDATE Product_Definitions 
         SET current_stock = current_stock - ? 
         WHERE product_def_id = ? AND manufacturer_id = ?`,
        [lineItem.quantity_ordered, lineItem.product_def_id, manufacturerId]
      );
    }

    // Update order status to Approved
    await connection.query(
      'UPDATE B2B_Orders SET status = "Approved" WHERE b2b_order_id = ?',
      [orderId]
    );

    await connection.commit();

    res.json({ message: 'Order accepted successfully', orderId: orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Accept B2B order error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ============================================
// REJECT B2B ORDER
// ============================================
export const rejectB2BOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { orderId } = req.params;
    const manufacturerId = req.user.id;

    // Verify order exists and belongs to this manufacturer
    const [[order]] = await connection.query(
      'SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND manufacturer_id = ?',
      [orderId, manufacturerId]
    );

    if (!order) {
      await connection.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Release reserved stock
    const [lineItems] = await connection.query(
      'SELECT product_def_id, quantity_ordered FROM Order_Line_Items WHERE b2b_order_id = ?',
      [orderId]
    );

    for (const item of lineItems) {
      await connection.query(
        `UPDATE Product_Definitions 
         SET reserved_stock = reserved_stock - ?
         WHERE product_def_id = ?`,
        [item.quantity_ordered, item.product_def_id]
      );
    }

    // Update order status to Rejected
    await connection.query(
      `UPDATE B2B_Orders 
       SET status = 'Rejected' 
       WHERE b2b_order_id = ? AND manufacturer_id = ?`,
      [orderId, manufacturerId]
    );

    await connection.commit();
    res.json({ message: 'Order rejected successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Reject B2B order error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ============================================
// GET PRODUCTION BATCHES
// ============================================
export const getProductionBatches = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [batches] = await db.query(
      `SELECT b.batch_id, b.batch_code, b.manufacturing_date, b.expiry_date,
              pd.name as productName, COUNT(pi.item_id) as quantity,
              b.retailer_order_id
       FROM Batches b
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       LEFT JOIN Product_Items pi ON b.batch_id = pi.batch_id
       WHERE b.manufacturer_id = ?
       GROUP BY b.batch_id
       ORDER BY b.manufacturing_date DESC`,
      [manufacturerId]
    );

    res.json(batches);
  } catch (error) {
    console.error('Get production batches error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREATE PRODUCTION BATCH
// ============================================
export const createProduction = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const { product_def_id, quantity, manufacturing_date, expiry_date, batch_code } = req.body;

    if (!product_def_id || !quantity || !manufacturing_date || !expiry_date) {
      return res.status(400).json({ error: 'product_def_id, quantity, manufacturing_date, and expiry_date are required' });
    }

    // Verify product belongs to manufacturer
    const [[product]] = await db.query(
      'SELECT * FROM Product_Definitions WHERE product_def_id = ? AND manufacturer_id = ?',
      [product_def_id, manufacturerId]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [result] = await db.query(
      `INSERT INTO Batches 
       (manufacturer_id, product_def_id, batch_code, manufacturing_date, expiry_date)
       VALUES (?, ?, ?, ?, ?)`,
      [manufacturerId, product_def_id, batch_code || `BATCH-${Date.now()}`, manufacturing_date, expiry_date]
    );

    // Create product items for the batch
    const batchId = result.insertId;
    for (let i = 0; i < quantity; i++) {
      const serialCode = `SERIAL-${batchId}-${i + 1}`;
      const hash = require('crypto').createHash('sha256').update(serialCode).digest('hex');
      
      await db.query(
        `INSERT INTO Product_Items (batch_id, product_def_id, serial_code, authentication_hash, status)
         VALUES (?, ?, ?, ?, 'Manufacturing')`,
        [batchId, product_def_id, serialCode, hash]
      );
    }

    res.status(201).json({
      message: 'Production batch created successfully',
      batchId: result.insertId,
      batchCode: batch_code || `BATCH-${Date.now()}`
    });
  } catch (error) {
    console.error('Create production error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// COMPLETE PRODUCTION
// ============================================
export const completeProduction = async (req, res) => {
  try {
    const { productionRequestId } = req.params;
    const manufacturerId = req.user.id;

    // Verify batch belongs to manufacturer
    const [[batch]] = await db.query(
      'SELECT * FROM Batches WHERE batch_id = ? AND manufacturer_id = ?',
      [productionRequestId, manufacturerId]
    );

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Mark batch as complete (update status in related order if exists)
    if (batch.retailer_order_id) {
      await db.query(
        'UPDATE B2B_Orders SET status = "Shipped" WHERE b2b_order_id = ?',
        [batch.retailer_order_id]
      );
    }

    res.json({ message: 'Production completed successfully' });
  } catch (error) {
    console.error('Complete production error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET SHIPMENTS
// ============================================
export const getShipments = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [shipments] = await db.query(
      `SELECT d.delivery_id as shipment_id, d.tracking_number, d.status,
              b.batch_code, pd.name as product_name,
              COUNT(pi.item_id) as quantity, d.current_location as destination_retailer,
              d.created_at, ir.temperature as temperature_range, d.updated_at
       FROM Deliveries d
       JOIN Batches b ON d.order_id = b.batch_id
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       LEFT JOIN Product_Items pi ON b.batch_id = pi.batch_id
       LEFT JOIN (
         SELECT batch_id, temperature FROM IoT_Readings 
         WHERE (batch_id, recorded_at) IN (
           SELECT batch_id, MAX(recorded_at) FROM IoT_Readings GROUP BY batch_id
         )
       ) ir ON b.batch_id = ir.batch_id
       WHERE b.manufacturer_id = ?
       GROUP BY d.delivery_id
       ORDER BY d.created_at DESC`,
      [manufacturerId]
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// DISPATCH SHIPMENT
// ============================================
export const dispatchShipment = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { location } = req.body;

    const [result] = await db.query(
      `UPDATE Deliveries 
       SET status = 'In_Transit', current_location = ? 
       WHERE delivery_id = ?`,
      [location || 'In Transit', shipmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment dispatched successfully' });
  } catch (error) {
    console.error('Dispatch shipment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET IoT ALERTS
// ============================================
export const getIoTAlerts = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [alerts] = await db.query(
      `SELECT ra.alert_id, ra.alert_type, ra.severity, ra.description,
              b.batch_code, pd.name as product_name, ra.created_at
       FROM Risk_Alerts ra
       JOIN Batches b ON ra.batch_id = b.batch_id
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       WHERE b.manufacturer_id = ?
       ORDER BY ra.created_at DESC`,
      [manufacturerId]
    );

    res.json(alerts);
  } catch (error) {
    console.error('Get IoT alerts error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET LEDGER TRANSACTIONS
// ============================================
export const getLedgerTransactions = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [transactions] = await db.query(
      `SELECT pt.transaction_id, pt.action as title, pt.created_at as time,
              pt.current_hash as hash, pi.serial_code
       FROM Product_Transactions pt
       JOIN Product_Items pi ON pt.item_id = pi.item_id
       JOIN Batches b ON pi.batch_id = b.batch_id
       WHERE b.manufacturer_id = ?
       ORDER BY pt.created_at DESC
       LIMIT 20`,
      [manufacturerId]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Get ledger transactions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET DASHBOARD METRICS
// ============================================
export const getDashboardMetrics = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    // Get metrics
    const [[totalProducts]] = await db.query(
      'SELECT COUNT(*) as total FROM Product_Definitions WHERE manufacturer_id = ?',
      [manufacturerId]
    );

    const [[pendingOrders]] = await db.query(
      'SELECT COUNT(*) as total FROM B2B_Orders WHERE manufacturer_id = ? AND status = "Pending"',
      [manufacturerId]
    );

    const [[activeShipments]] = await db.query(
      `SELECT COUNT(DISTINCT d.delivery_id) as total 
       FROM Deliveries d
       JOIN Batches b ON d.order_id = b.batch_id
       WHERE b.manufacturer_id = ? AND d.status IN ("Dispatched", "In_Transit")`,
      [manufacturerId]
    );

    const [[iotAlerts]] = await db.query(
      `SELECT COUNT(*) as total 
       FROM Risk_Alerts ra
       JOIN Batches b ON ra.batch_id = b.batch_id
       WHERE b.manufacturer_id = ? AND ra.severity IN ("High", "Medium")`,
      [manufacturerId]
    );

    const [[monthlyRevenue]] = await db.query(
      `SELECT COALESCE(SUM(bo.total_amount), 0) as total 
       FROM B2B_Orders bo
       WHERE bo.manufacturer_id = ? 
       AND MONTH(bo.order_date) = MONTH(NOW()) 
       AND YEAR(bo.order_date) = YEAR(NOW())`,
      [manufacturerId]
    );

    const [[totalShipped]] = await db.query(
      `SELECT COUNT(DISTINCT d.delivery_id) as total 
       FROM Deliveries d
       JOIN Batches b ON d.order_id = b.batch_id
       WHERE b.manufacturer_id = ? 
       AND MONTH(d.created_at) = MONTH(NOW()) 
       AND YEAR(d.created_at) = YEAR(NOW())`,
      [manufacturerId]
    );

    // Get recent shipments
    const [recentShipments] = await db.query(
      `SELECT d.delivery_id as shipment_id, d.tracking_number, d.status,
              pd.name as product_name, COUNT(pi.item_id) as quantity,
              d.current_location as destination_retailer, d.updated_at,
              ir.temperature as temperature_range
       FROM Deliveries d
       JOIN Batches b ON d.order_id = b.batch_id
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       LEFT JOIN Product_Items pi ON b.batch_id = pi.batch_id
       LEFT JOIN (
         SELECT batch_id, temperature FROM IoT_Readings 
         WHERE (batch_id, recorded_at) IN (
           SELECT batch_id, MAX(recorded_at) FROM IoT_Readings GROUP BY batch_id
         )
       ) ir ON b.batch_id = ir.batch_id
       WHERE b.manufacturer_id = ?
       GROUP BY d.delivery_id
       ORDER BY d.updated_at DESC
       LIMIT 5`,
      [manufacturerId]
    );

    // Get top products by sales
    const [topProducts] = await db.query(
      `SELECT pd.product_def_id, pd.name as product_name, pd.current_stock,
              COALESCE(SUM(bo.total_amount), 0) as total_sales_value
       FROM Product_Definitions pd
       LEFT JOIN B2B_Orders bo ON bo.manufacturer_id = pd.manufacturer_id AND bo.status != "Rejected"
       WHERE pd.manufacturer_id = ?
       GROUP BY pd.product_def_id
       ORDER BY total_sales_value DESC
       LIMIT 5`,
      [manufacturerId]
    );

    res.json({
      metrics: {
        total_products: totalProducts.total,
        pending_orders: pendingOrders.total,
        active_shipments: activeShipments.total,
        iot_alerts: iotAlerts.total,
        monthly_revenue: monthlyRevenue.total,
        total_shipped: totalShipped.total
      },
      recentShipments,
      topProducts
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {};
