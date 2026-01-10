import db from '../config/db.js';

/**
 * MANUFACTURER CONTROLLER
 * Handles all manufacturer-related operations
 * - Products management
 * - B2B Orders handling
 * - Production management
 * - Shipments tracking
 * - IoT Alerts
 * - Ledger audit
 * - Dashboard metrics
 */

// ============================================
// PRODUCTS ENDPOINTS
// ============================================

export const getManufacturerProducts = async (req, res) => {
  try {
    const manufacturerId = req.user.id; // From JWT token
    
    const [products] = await db.query(
      `SELECT 
        product_def_id,
        name,
        description,
        category,
        current_stock,
        base_price,
        is_active
      FROM Product_Definitions
      WHERE manufacturer_id = ? AND is_active = 1
      ORDER BY name ASC`,
      [manufacturerId]
    );

    res.json(products || []);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const manufacturerId = req.user.id;

    const [products] = await db.query(
      `SELECT * FROM Product_Definitions
       WHERE product_def_id = ? AND manufacturer_id = ?`,
      [productId, manufacturerId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { newStock } = req.body;
    const manufacturerId = req.user.id;

    // Verify manufacturer owns this product
    const [product] = await db.query(
      'SELECT * FROM Product_Definitions WHERE product_def_id = ? AND manufacturer_id = ?',
      [productId, manufacturerId]
    );

    if (product.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update stock
    await db.query(
      'UPDATE Product_Definitions SET current_stock = ? WHERE product_def_id = ?',
      [parseInt(newStock), productId]
    );

    res.json({
      message: 'Stock updated',
      productId,
      newStock
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: error.message });
  }
};
// ============================================
// CREATE NEW PRODUCT
// ============================================
export const createProduct = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const { name, category, base_price, current_stock, description } = req.body;

    // Validate required fields
    if (!name || !category || !base_price || current_stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, category, base_price, current_stock' });
    }

    // Insert product
    const [result] = await db.query(
      `INSERT INTO Product_Definitions (manufacturer_id, name, category, base_price, current_stock, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [manufacturerId, name, category, parseFloat(base_price), parseInt(current_stock), description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId,
      data: {
        product_def_id: result.insertId,
        name,
        category,
        base_price,
        current_stock
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
};
// ============================================
// B2B ORDERS ENDPOINTS
// ============================================

export const getB2BOrders = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        o.b2b_order_id,
        o.retailer_id,
        o.order_date,
        o.status,
        o.fulfillment_type,
        o.total_amount,
        r.business_name,
        r.tax_id
      FROM B2B_Orders o
      JOIN Retailers r ON o.retailer_id = r.retailer_id
      WHERE o.manufacturer_id = ?
    `;
    const params = [manufacturerId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.order_date DESC';

    const [orders] = await db.query(query, params);

    // Get line items for each order
    for (let order of orders) {
      const [items] = await db.query(
        'SELECT line_item_id, product_def_id, quantity_ordered, unit_price, fulfilled_from, status FROM Order_Line_Items WHERE b2b_order_id = ?',
        [order.b2b_order_id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get B2B orders error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const acceptB2BOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { orderId } = req.params;
    const { fulfillment_type } = req.body;
    const manufacturerId = req.user.id;

    // Get order details
    const [orders] = await connection.query(
      'SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND manufacturer_id = ?',
      [orderId, manufacturerId]
    );

    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    // Get all line items
    const [items] = await connection.query(
      'SELECT * FROM Order_Line_Items WHERE b2b_order_id = ?',
      [orderId]
    );

    if (fulfillment_type === 'direct_delivery') {
      // Check stock for all items
      for (let item of items) {
        const [products] = await connection.query(
          'SELECT current_stock FROM Product_Definitions WHERE product_def_id = ?',
          [item.product_def_id]
        );
        if (!products[0] || products[0].current_stock < item.quantity_ordered) {
          throw new Error(`Insufficient stock for product ID ${item.product_def_id}`);
        }
      }

      // Deduct from stock for all items
      for (let item of items) {
        await connection.query(
          'UPDATE Product_Definitions SET current_stock = current_stock - ? WHERE product_def_id = ?',
          [item.quantity_ordered, item.product_def_id]
        );
      }

      // Update order status to Shipped
      await connection.query(
        'UPDATE B2B_Orders SET status = ?, fulfillment_type = ? WHERE b2b_order_id = ?',
        ['Shipped', fulfillment_type, orderId]
      );

    } else if (fulfillment_type === 'production') {
      // Create production request for each item
      for (let item of items) {
        await connection.query(
          `INSERT INTO Production_Requests 
          (b2b_order_id, product_def_id, quantity_required, status, created_at)
          VALUES (?, ?, ?, 'Pending', NOW())`,
          [orderId, item.product_def_id, item.quantity_ordered]
        );
      }

      // Update order status
      await connection.query(
        'UPDATE B2B_Orders SET status = ?, fulfillment_type = ? WHERE b2b_order_id = ?',
        ['Approved', fulfillment_type, orderId]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Order accepted for ${fulfillment_type}`,
      data: { orderId, fulfillment_type }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Accept order error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

export const rejectB2BOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const manufacturerId = req.user.id;

    // Verify ownership
    const [orders] = await db.query(
      'SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND manufacturer_id = ?',
      [orderId, manufacturerId]
    );

    if (orders.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Add rejection reason to fulfillment_type field
    await db.query(
      'UPDATE B2B_Orders SET fulfillment_type = ? WHERE b2b_order_id = ?',
      ['Rejected by manufacturer', orderId]
    );

    res.json({
      success: true,
      message: 'Order rejected'
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// PRODUCTION ENDPOINTS
// ============================================

export const getProductionBatches = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [batches] = await db.query(
      `SELECT 
        pr.production_request_id,
        pr.product_id,
        pr.quantity_required,
        pr.status,
        pr.created_date,
        pr.completion_date,
        pd.product_name,
        bo.order_id
      FROM Production_Requests pr
      JOIN Product_Definitions pd ON pr.product_id = pd.product_id
      LEFT JOIN B2B_Orders bo ON pr.order_id = bo.order_id
      WHERE pr.manufacturer_id = ? AND pr.status IN ('pending', 'in_progress')
      ORDER BY pr.created_date DESC`,
      [manufacturerId]
    );

    res.json({
      success: true,
      data: batches,
      count: batches.length
    });
  } catch (error) {
    console.error('Get production batches error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const completeProduction = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { productionRequestId } = req.params;
    const { quantity_produced } = req.body;
    const manufacturerId = req.user.id;

    // Get production request
    const [requests] = await connection.query(
      'SELECT * FROM Production_Requests WHERE production_request_id = ? AND manufacturer_id = ?',
      [productionRequestId, manufacturerId]
    );

    if (requests.length === 0) {
      throw new Error('Production request not found');
    }

    const prodRequest = requests[0];

    // Update product stock
    await connection.query(
      'UPDATE Product_Definitions SET current_stock = current_stock + ? WHERE product_id = ?',
      [quantity_produced, prodRequest.product_id]
    );

    // Create batch record
    await connection.query(
      `INSERT INTO Batches (product_id, batch_number, quantity, manufacturing_date, status)
       VALUES (?, ?, ?, NOW(), 'active')`,
      [prodRequest.product_id, `BATCH-${Date.now()}`, quantity_produced]
    );

    // Update production request status
    await connection.query(
      'UPDATE Production_Requests SET status = ?, completion_date = NOW() WHERE production_request_id = ?',
      ['completed', productionRequestId]
    );

    // If there's an associated order, create shipment
    if (prodRequest.order_id) {
      await connection.query(
        'INSERT INTO Shipments (order_id, status, shipment_date) VALUES (?, ?, NOW())',
        [prodRequest.order_id, 'prepared']
      );

      await connection.query(
        'UPDATE B2B_Orders SET status = ? WHERE order_id = ?',
        ['dispatched', prodRequest.order_id]
      );
    }

    // Log transaction
    await connection.query(
      `INSERT INTO Product_Transactions 
      (product_id, transaction_type, quantity, timestamp) 
      VALUES (?, 'production_completed', ?, NOW())`,
      [prodRequest.product_id, quantity_produced]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Production completed',
      data: { productionRequestId, quantity_produced }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Complete production error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ============================================
// SHIPMENTS ENDPOINTS
// ============================================

export const getShipments = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [shipments] = await db.query(
      `SELECT 
        s.shipment_id,
        s.order_id,
        s.status,
        s.shipment_date,
        s.expected_delivery,
        s.actual_delivery,
        bo.product_id,
        pd.product_name,
        bo.quantity_ordered,
        u.email as retailer_email
      FROM Shipments s
      JOIN B2B_Orders bo ON s.order_id = bo.order_id
      JOIN Product_Definitions pd ON bo.product_id = pd.product_id
      JOIN Users u ON bo.retailer_id = u.user_id
      WHERE bo.manufacturer_id = ?
      ORDER BY s.shipment_date DESC`,
      [manufacturerId]
    );

    res.json({
      success: true,
      data: shipments,
      count: shipments.length
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const dispatchShipment = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const manufacturerId = req.user.id;

    // Verify ownership
    const [shipments] = await db.query(
      `SELECT s.* FROM Shipments s
       JOIN B2B_Orders bo ON s.order_id = bo.order_id
       WHERE s.shipment_id = ? AND bo.manufacturer_id = ?`,
      [shipmentId, manufacturerId]
    );

    if (shipments.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update shipment status
    await db.query(
      'UPDATE Shipments SET status = ? WHERE shipment_id = ?',
      ['dispatched', shipmentId]
    );

    // Update associated order
    const shipment = shipments[0];
    await db.query(
      'UPDATE B2B_Orders SET status = ? WHERE order_id = ?',
      ['dispatched', shipment.order_id]
    );

    res.json({
      success: true,
      message: 'Shipment dispatched',
      data: { shipmentId, status: 'dispatched' }
    });
  } catch (error) {
    console.error('Dispatch shipment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// IoT ALERTS
// ============================================

export const getIoTAlerts = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [alerts] = await db.query(
      `SELECT 
        ir.alert_id,
        ir.shipment_id,
        ir.temperature,
        ir.humidity,
        ir.alert_type,
        ir.severity,
        ir.timestamp,
        s.order_id,
        bo.product_id,
        pd.product_name
      FROM IoT_Readings ir
      JOIN Shipments s ON ir.shipment_id = s.shipment_id
      JOIN B2B_Orders bo ON s.order_id = bo.order_id
      JOIN Product_Definitions pd ON bo.product_id = pd.product_id
      WHERE bo.manufacturer_id = ? AND ir.alert_type != 'normal'
      ORDER BY ir.timestamp DESC
      LIMIT 100`,
      [manufacturerId]
    );

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Get IoT alerts error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// LEDGER / AUDIT
// ============================================

export const getLedgerTransactions = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const [transactions] = await db.query(
      `SELECT 
        pt.transaction_id,
        pt.product_id,
        pt.transaction_type,
        pt.quantity,
        pt.timestamp,
        pd.product_name
      FROM Product_Transactions pt
      JOIN Product_Definitions pd ON pt.product_id = pd.product_id
      WHERE pd.manufacturer_id = ?
      ORDER BY pt.timestamp DESC
      LIMIT 500`,
      [manufacturerId]
    );

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get ledger transactions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// DASHBOARD METRICS
// ============================================

export const getDashboardMetrics = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    // Pending orders
    const [[{ pending_orders }]] = await db.query(
      `SELECT COUNT(*) as pending_orders FROM B2B_Orders 
       WHERE manufacturer_id = ? AND status = 'Pending'`,
      [manufacturerId]
    );

    // Low stock items (count items with less than 20 units)
    const [[{ low_stock }]] = await db.query(
      `SELECT COUNT(*) as low_stock FROM Product_Definitions 
       WHERE manufacturer_id = ? AND current_stock < 20`,
      [manufacturerId]
    );

    // Active deliveries
    const [[{ active_shipments }]] = await db.query(
      `SELECT COUNT(*) as active_shipments FROM Deliveries d
       WHERE EXISTS (SELECT 1 FROM B2B_Orders bo WHERE bo.b2b_order_id = d.order_id 
       AND bo.manufacturer_id = ?)
       AND d.status IN ('Dispatched', 'In_Transit')`,
      [manufacturerId]
    );

    // Total products
    const [[{ total_products }]] = await db.query(
      'SELECT COUNT(*) as total_products FROM Product_Definitions WHERE manufacturer_id = ?',
      [manufacturerId]
    );

    // IoT alerts count - monitor temperature anomalies in last 7 days
    const [[{ iot_alerts }]] = await db.query(
      `SELECT COUNT(*) as iot_alerts FROM IoT_Readings ir
       WHERE ir.batch_id IN (SELECT batch_id FROM Batches WHERE manufacturer_id = ?)
       AND ir.recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND (ir.temperature < 2 OR ir.temperature > 8 OR ir.humidity < 30 OR ir.humidity > 60)`,
      [manufacturerId]
    );

    // Calculate monthly revenue (sum of orders accepted in last 30 days)
    const [[{ monthly_revenue }]] = await db.query(
      `SELECT COALESCE(SUM(bo.total_amount), 0) as monthly_revenue FROM B2B_Orders bo
       WHERE bo.manufacturer_id = ? AND bo.status IN ('Approved', 'Shipped', 'Delivered')
       AND bo.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [manufacturerId]
    );

    // Get total delivered
    const [[{ total_shipped }]] = await db.query(
      `SELECT COUNT(DISTINCT bo.b2b_order_id) as total_shipped FROM B2B_Orders bo
       WHERE bo.manufacturer_id = ? AND bo.status = 'Delivered'`,
      [manufacturerId]
    );

    // Get recent deliveries (last 5)
    const [recentShipments] = await db.query(
      `SELECT d.delivery_id as shipment_id, d.order_id, 'Order' as product_name, 
              bo.total_amount as quantity, r.business_name as destination_retailer, d.status,
              'N/A' as temperature_range, d.delivery_id AS updated_at
       FROM Deliveries d
       JOIN B2B_Orders bo ON d.order_id = bo.b2b_order_id
       JOIN Retailers r ON bo.retailer_id = r.retailer_id
       WHERE bo.manufacturer_id = ?
       ORDER BY d.delivery_id DESC LIMIT 5`,
      [manufacturerId]
    );

    // Get top products by sales (products with most order line items)
    const [topProducts] = await db.query(
      `SELECT pd.product_def_id, pd.name as product_name, pd.current_stock,
              COALESCE(SUM(oli.quantity_ordered), 0) as total_quantity,
              COALESCE(SUM(CAST(oli.quantity_ordered AS DECIMAL(10,2)) * oli.unit_price), 0) as total_sales_value
       FROM Product_Definitions pd
       LEFT JOIN Order_Line_Items oli ON pd.product_def_id = oli.product_def_id
       LEFT JOIN B2B_Orders bo ON oli.b2b_order_id = bo.b2b_order_id
       WHERE pd.manufacturer_id = ? AND (bo.status IS NULL OR bo.status != 'Rejected')
       GROUP BY pd.product_def_id, pd.name, pd.current_stock
       ORDER BY total_sales_value DESC LIMIT 4`,
      [manufacturerId]
    );

    res.json({
      metrics: {
        total_products,
        pending_orders,
        active_shipments,
        iot_alerts,
        monthly_revenue: parseFloat(monthly_revenue) || 0,
        total_shipped
      },
      recentShipments,
      topProducts
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getManufacturerProducts,
  getProductDetails,
  updateProductStock,
  getB2BOrders,
  acceptB2BOrder,
  rejectB2BOrder,
  getProductionBatches,
  completeProduction,
  getShipments,
  dispatchShipment,
  getIoTAlerts,
  getLedgerTransactions,
  getDashboardMetrics
};
