import db from '../config/db.js';

// ============================================
// GET MANUFACTURERS
// ============================================
export const getManufacturers = async (req, res) => {
  try {
    const [manufacturers] = await db.query(
      `SELECT m.manufacturer_id, m.company_name, m.license_number,
              COUNT(DISTINCT pd.product_def_id) as product_count
       FROM Manufacturers m
       LEFT JOIN Product_Definitions pd ON m.manufacturer_id = pd.manufacturer_id
       GROUP BY m.manufacturer_id`
    );

    res.json(manufacturers);
  } catch (error) {
    console.error('Get manufacturers error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET PRODUCTS BY MANUFACTURER
// ============================================
export const getProductsByManufacturer = async (req, res) => {
  try {
    const { manufacturerId } = req.params;

    const [products] = await db.query(
      `SELECT product_def_id, name, description, category, base_price, 
              current_stock, is_active
       FROM Product_Definitions
       WHERE manufacturer_id = ? AND is_active = 1`,
      [manufacturerId]
    );

    res.json(products);
  } catch (error) {
    console.error('Get products by manufacturer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREATE ORDER (Transactional)
// ============================================
export const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const retailerId = req.user.id;
    const { manufacturerId, items } = req.body;

    // Validate items array
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Calculate total amount
    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
      const [[product]] = await connection.query(
        'SELECT product_def_id, base_price FROM Product_Definitions WHERE product_def_id = ?',
        [item.productId]
      );

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Note: Stock availability is checked by the manufacturer when they accept/reject the order
      // Retailer can place orders even if stock is low - manufacturer decides

      const itemTotal = product.base_price * item.quantity;
      totalAmount += itemTotal;
      itemDetails.push({
        productId: product.product_def_id,
        quantity: item.quantity,
        unitPrice: product.base_price
      });
    }

    // Create B2B Order
    const [orderResult] = await connection.query(
      `INSERT INTO B2B_Orders (retailer_id, manufacturer_id, status, total_amount)
       VALUES (?, ?, 'Pending', ?)`,
      [retailerId, manufacturerId, totalAmount]
    );
    const orderId = orderResult.insertId;

    // Insert Order Line Items
    for (const item of itemDetails) {
      await connection.query(
        `INSERT INTO Order_Line_Items (b2b_order_id, product_def_id, quantity_ordered, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
    }

    // Reserve stock from manufacturer's inventory
    for (const item of itemDetails) {
      await connection.query(
        `UPDATE Product_Definitions 
         SET reserved_stock = reserved_stock + ?
         WHERE product_def_id = ?`,
        [item.quantity, item.productId]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ============================================
// GET RETAILER ORDERS
// ============================================
export const getRetailerOrders = async (req, res) => {
  try {
    const retailerId = req.user.id;

    const [orders] = await db.query(
      `SELECT bo.b2b_order_id as orderId, bo.order_date, bo.status, bo.total_amount,
              m.company_name as manufacturerName,
              COUNT(oli.line_item_id) as itemCount
       FROM B2B_Orders bo
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       LEFT JOIN Order_Line_Items oli ON bo.b2b_order_id = oli.b2b_order_id
       WHERE bo.retailer_id = ?
       GROUP BY bo.b2b_order_id
       ORDER BY bo.order_date DESC`,
      [retailerId]
    );

    res.json(orders);
  } catch (error) {
    console.error('Get retailer orders error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ORDER DETAILS
// ============================================
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const retailerId = req.user.id;

    // Verify order belongs to this retailer
    const [[order]] = await db.query(
      'SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND retailer_id = ?',
      [orderId, retailerId]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order line items
    const [items] = await db.query(
      `SELECT oli.line_item_id, oli.product_def_id, pd.name as productName, 
              oli.quantity_ordered, oli.unit_price, 
              (oli.quantity_ordered * oli.unit_price) as totalPrice
       FROM Order_Line_Items oli
       JOIN Product_Definitions pd ON oli.product_def_id = pd.product_def_id
       WHERE oli.b2b_order_id = ?`,
      [orderId]
    );

    res.json({
      order,
      items
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET RETAILER INVENTORY
// ============================================
export const getRetailerInventory = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Get first outlet for this retailer (or can be parameterized)
    const [[outlet]] = await db.query(
      'SELECT outlet_id FROM Retailer_Outlets WHERE retailer_id = ? LIMIT 1',
      [retailerId]
    );

    if (!outlet) {
      return res.json({ inventory: [], outletId: null });
    }

    const [inventory] = await db.query(
      `SELECT i.inventory_id, i.product_def_id, pd.name as productName, 
              pd.base_price, pd.category,
              i.quantity_on_hand, i.aisle, i.shelf, i.section, i.last_updated
       FROM Inventory i
       JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
       WHERE i.outlet_id = ?
       ORDER BY pd.name ASC`,
      [outlet.outlet_id]
    );

    res.json({
      inventory,
      outletId: outlet.outlet_id
    });
  } catch (error) {
    console.error('Get retailer inventory error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET INCOMING SHIPMENTS
// ============================================
export const getIncomingShipments = async (req, res) => {
  try {
    const retailerId = req.user.id;

    const [shipments] = await db.query(
      `SELECT d.delivery_id, d.order_id, d.tracking_number, d.status,
              d.current_location, d.estimated_arrival,
              m.company_name as manufacturerName,
              bo.total_amount, COUNT(oli.line_item_id) as itemCount
       FROM Deliveries d
       JOIN B2B_Orders bo ON d.order_id = bo.b2b_order_id
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       LEFT JOIN Order_Line_Items oli ON bo.b2b_order_id = oli.b2b_order_id
       WHERE bo.retailer_id = ?
       GROUP BY d.delivery_id
       ORDER BY d.status DESC, d.estimated_arrival ASC`,
      [retailerId]
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get incoming shipments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CONFIRM SHIPMENT DELIVERY (Transactional)
// ============================================
export const confirmShipmentDelivery = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { deliveryId } = req.params;
    const retailerId = req.user.id;

    // Get delivery details
    const [[delivery]] = await connection.query(
      `SELECT d.*, bo.retailer_id, bo.b2b_order_id 
       FROM Deliveries d
       JOIN B2B_Orders bo ON d.order_id = bo.b2b_order_id
       WHERE d.delivery_id = ? AND bo.retailer_id = ?`,
      [deliveryId, retailerId]
    );

    if (!delivery) {
      throw new Error('Delivery not found or unauthorized');
    }

    if (delivery.status === 'Delivered') {
      throw new Error('Delivery already confirmed');
    }

    // Update delivery status
    await connection.query(
      'UPDATE Deliveries SET status = ? WHERE delivery_id = ?',
      ['Delivered', deliveryId]
    );

    // Update B2B Order status
    await connection.query(
      'UPDATE B2B_Orders SET status = ? WHERE b2b_order_id = ?',
      ['Delivered', delivery.b2b_order_id]
    );

    // Get order items and update retailer inventory
    const [orderItems] = await connection.query(
      'SELECT product_def_id, quantity_ordered FROM Order_Line_Items WHERE b2b_order_id = ?',
      [delivery.b2b_order_id]
    );

    const [[outlet]] = await connection.query(
      'SELECT outlet_id FROM Retailer_Outlets WHERE retailer_id = ? LIMIT 1',
      [retailerId]
    );

    if (outlet) {
      for (const item of orderItems) {
        // Check if inventory record exists
        const [[existingInventory]] = await connection.query(
          'SELECT inventory_id FROM Inventory WHERE outlet_id = ? AND product_def_id = ?',
          [outlet.outlet_id, item.product_def_id]
        );

        if (existingInventory) {
          // Update existing inventory
          await connection.query(
            `UPDATE Inventory 
             SET quantity_on_hand = quantity_on_hand + ?
             WHERE outlet_id = ? AND product_def_id = ?`,
            [item.quantity_ordered, outlet.outlet_id, item.product_def_id]
          );
        } else {
          // Create new inventory record
          await connection.query(
            `INSERT INTO Inventory (outlet_id, product_def_id, quantity_on_hand)
             VALUES (?, ?, ?)`,
            [outlet.outlet_id, item.product_def_id, item.quantity_ordered]
          );
        }
      }
    }

    // Log transaction
    await connection.query(
      `INSERT INTO Audit_Logs (user_id, action, details)
       VALUES (?, 'delivery_confirmed', ?)`,
      [retailerId, `Delivery ${deliveryId} confirmed for order ${delivery.b2b_order_id}`]
    );

    await connection.commit();

    res.json({
      message: 'Shipment delivery confirmed successfully',
      deliveryId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Confirm shipment delivery error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// ============================================
// GET DASHBOARD METRICS
// ============================================
export const getDashboardMetrics = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Pending orders
    const [[{ pending_orders }]] = await db.query(
      `SELECT COUNT(*) as pending_orders FROM B2B_Orders 
       WHERE retailer_id = ? AND status = 'Pending'`,
      [retailerId]
    );

    // In-transit deliveries
    const [[{ in_transit }]] = await db.query(
      `SELECT COUNT(*) as in_transit FROM Deliveries d
       WHERE EXISTS (SELECT 1 FROM B2B_Orders bo WHERE bo.b2b_order_id = d.order_id AND bo.retailer_id = ?)
       AND d.status IN ('Dispatched', 'In_Transit')`,
      [retailerId]
    );

    // Total inventory value
    const [[{ inventory_value }]] = await db.query(
      `SELECT COALESCE(SUM(i.quantity_on_hand * pd.base_price), 0) as inventory_value
       FROM Inventory i
       JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
       JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
       WHERE ro.retailer_id = ?`,
      [retailerId]
    );

    // Total spent this month
    const [[{ monthly_spending }]] = await db.query(
      `SELECT COALESCE(SUM(bo.total_amount), 0) as monthly_spending FROM B2B_Orders bo
       WHERE bo.retailer_id = ? AND bo.status IN ('Approved', 'Shipped', 'Delivered')
       AND bo.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [retailerId]
    );

    // Total inventory items
    const [[{ total_units }]] = await db.query(
      `SELECT COALESCE(SUM(i.quantity_on_hand), 0) as total_units
       FROM Inventory i
       JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ?`,
      [retailerId]
    );

    // Low stock items (less than 10 units)
    const [[{ low_stock_count }]] = await db.query(
      `SELECT COUNT(*) as low_stock_count
       FROM Inventory i
       JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? AND i.quantity_on_hand < 10`,
      [retailerId]
    );

    // Recent deliveries
    const [recentDeliveries] = await db.query(
      `SELECT d.delivery_id, d.order_id, d.status, m.company_name as manufacturerName,
              bo.total_amount, COUNT(oli.line_item_id) as itemCount
       FROM Deliveries d
       JOIN B2B_Orders bo ON d.order_id = bo.b2b_order_id
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       LEFT JOIN Order_Line_Items oli ON bo.b2b_order_id = oli.b2b_order_id
       WHERE bo.retailer_id = ?
       GROUP BY d.delivery_id
       ORDER BY d.delivery_id DESC LIMIT 5`,
      [retailerId]
    );

    // Top manufacturers
    const [topManufacturers] = await db.query(
      `SELECT m.manufacturer_id, m.company_name, COUNT(DISTINCT bo.b2b_order_id) as order_count,
              COALESCE(SUM(bo.total_amount), 0) as total_spent
       FROM B2B_Orders bo
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       WHERE bo.retailer_id = ? AND bo.status IN ('Approved', 'Shipped', 'Delivered')
       GROUP BY bo.manufacturer_id
       ORDER BY total_spent DESC LIMIT 5`,
      [retailerId]
    );

    res.json({
      metrics: {
        pending_orders,
        in_transit,
        inventory_value: parseFloat(inventory_value) || 0,
        monthly_spending: parseFloat(monthly_spending) || 0,
        total_units,
        low_stock_count
      },
      recentDeliveries,
      topManufacturers
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// SEARCH PRODUCTS (across all manufacturers)
// ============================================
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const [products] = await db.query(
      `SELECT pd.product_def_id, pd.name, pd.description, pd.category, 
              pd.base_price, pd.current_stock,
              m.manufacturer_id, m.company_name as manufacturerName
       FROM Product_Definitions pd
       JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
       WHERE pd.is_active = 1 AND (
         pd.name LIKE ? OR 
         pd.description LIKE ? OR 
         pd.category LIKE ?
       )
       LIMIT 20`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getManufacturers,
  getProductsByManufacturer,
  createOrder,
  getRetailerOrders,
  getOrderDetails,
  getRetailerInventory,
  getIncomingShipments,
  confirmShipmentDelivery,
  getDashboardMetrics,
  searchProducts
};
