import db from '../config/db.js';
import crypto from 'crypto';

// ============================================
// GET DASHBOARD STATS
// ============================================
export const getDashboardStats = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Get outlet_id for this retailer
    const [[outlet]] = await db.query(
      'SELECT outlet_id FROM Retailer_Outlets WHERE retailer_id = ? LIMIT 1',
      [retailerId]
    );
    const outletId = outlet?.outlet_id;

    // Total stock quantity
    const [[{ total_stock_quantity }]] = await db.query(
      `SELECT COALESCE(SUM(quantity_on_hand), 0) as total_stock_quantity 
       FROM Inventory WHERE outlet_id = ?`,
      [outletId || 0]
    );

    // Unique products count
    const [[{ unique_products_count }]] = await db.query(
      `SELECT COUNT(DISTINCT product_def_id) as unique_products_count 
       FROM Inventory WHERE outlet_id = ?`,
      [outletId || 0]
    );

    // Low stock items (below threshold of 10)
    const [[{ low_stock_items }]] = await db.query(
      `SELECT COUNT(*) as low_stock_items 
       FROM Inventory WHERE outlet_id = ? AND quantity_on_hand < 10 AND quantity_on_hand > 0`,
      [outletId || 0]
    );

    // Pending orders (orders placed but not yet delivered)
    const [[{ pending_orders_count }]] = await db.query(
      `SELECT COUNT(*) as pending_orders_count 
       FROM B2B_Orders WHERE retailer_id = ? AND status IN ('Pending', 'Approved', 'Shipped')`,
      [retailerId]
    );

    // Total customers who bought from this retailer
    const [[{ total_customers }]] = await db.query(
      `SELECT COUNT(DISTINCT co.customer_id) as total_customers
       FROM Customer_Orders co
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ?`,
      [retailerId]
    );

    // Total revenue this month
    const [[{ monthly_revenue }]] = await db.query(
      `SELECT COALESCE(SUM(co.total_amount), 0) as monthly_revenue
       FROM Customer_Orders co
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? 
       AND co.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND co.status != 'Cancelled'`,
      [retailerId]
    );

    // Recent orders from customers
    const [recent_customer_orders] = await db.query(
      `SELECT co.order_id, co.order_date, co.total_amount, co.status,
              c.first_name, c.last_name
       FROM Customer_Orders co
       JOIN Customers c ON co.customer_id = c.customer_id
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ?
       ORDER BY co.order_date DESC LIMIT 5`,
      [retailerId]
    );

    // Top selling products
    const [top_selling_products] = await db.query(
      `SELECT pd.name, pd.product_def_id, SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.unit_price) as revenue
       FROM Order_Items oi
       JOIN Product_Definitions pd ON oi.product_def_id = pd.product_def_id
       JOIN Customer_Orders co ON oi.order_id = co.order_id
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? AND co.status != 'Cancelled'
       GROUP BY pd.product_def_id
       ORDER BY total_sold DESC LIMIT 5`,
      [retailerId]
    );

    res.json({
      total_stock_quantity: parseInt(total_stock_quantity) || 0,
      unique_products_count: parseInt(unique_products_count) || 0,
      low_stock_items: parseInt(low_stock_items) || 0,
      pending_orders_count: parseInt(pending_orders_count) || 0,
      total_customers: parseInt(total_customers) || 0,
      monthly_revenue: parseFloat(monthly_revenue) || 0,
      recent_customer_orders,
      top_selling_products
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

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

    // Insert B2B Order Items
    for (const item of itemDetails) {
      await connection.query(
        `INSERT INTO B2B_Order_Items (b2b_order_id, product_def_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.unitPrice]
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
      `SELECT bo.b2b_order_id, bo.order_date, bo.status, bo.total_amount,
              m.company_name, m.manufacturer_id
       FROM B2B_Orders bo
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       WHERE bo.retailer_id = ?
       ORDER BY bo.order_date DESC`,
      [retailerId]
    );

    // Fetch line items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [lineItems] = await db.query(
          `SELECT boi.b2b_item_id, boi.product_def_id, boi.quantity, boi.unit_price,
                  pd.name as product_name
           FROM B2B_Order_Items boi
           JOIN Product_Definitions pd ON boi.product_def_id = pd.product_def_id
           WHERE boi.b2b_order_id = ?`,
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
      `SELECT boi.b2b_item_id, boi.product_def_id, pd.name as productName, 
              boi.quantity, boi.unit_price, 
              (boi.quantity * boi.unit_price) as totalPrice
       FROM B2B_Order_Items boi
       JOIN Product_Definitions pd ON boi.product_def_id = pd.product_def_id
       WHERE boi.b2b_order_id = ?`,
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
// GET INCOMING SHIPMENTS (B2B Orders from Manufacturers)
// ============================================
export const getIncomingShipments = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Get B2B orders which serve as incoming shipments from manufacturers
    const [shipments] = await db.query(
      `SELECT bo.b2b_order_id as shipment_id, bo.order_date, bo.status,
              m.company_name as manufacturerName,
              bo.total_amount, 
              (SELECT COUNT(*) FROM B2B_Order_Items WHERE b2b_order_id = bo.b2b_order_id) as itemCount
       FROM B2B_Orders bo
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       WHERE bo.retailer_id = ?
       ORDER BY 
         CASE bo.status 
           WHEN 'Shipped' THEN 1 
           WHEN 'Approved' THEN 2 
           WHEN 'Pending' THEN 3 
           ELSE 4 
         END,
         bo.order_date DESC`,
      [retailerId]
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get incoming shipments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CONFIRM SHIPMENT DELIVERY (B2B Order - Transactional)
// ============================================
export const confirmShipmentDelivery = async (req, res) => {
  console.log('[confirmShipmentDelivery] Called with params:', req.params);
  console.log('[confirmShipmentDelivery] User:', req.user);
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { deliveryId } = req.params; // This is actually b2b_order_id for B2B shipments
    const retailerId = req.user.id;
    
    console.log('[confirmShipmentDelivery] deliveryId:', deliveryId, 'retailerId:', retailerId);

    // Get B2B order details
    const [[order]] = await connection.query(
      `SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND retailer_id = ?`,
      [deliveryId, retailerId]
    );
    
    console.log('[confirmShipmentDelivery] Order found:', order);

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    if (order.status === 'Delivered') {
      throw new Error('Order already delivered');
    }

    if (order.status !== 'Shipped') {
      throw new Error('Order must be shipped before confirming delivery');
    }

    // Update B2B Order status to Delivered
    await connection.query(
      'UPDATE B2B_Orders SET status = ? WHERE b2b_order_id = ?',
      ['Delivered', deliveryId]
    );

    // Get order items and update retailer inventory
    const [orderItems] = await connection.query(
      'SELECT product_def_id, quantity FROM B2B_Order_Items WHERE b2b_order_id = ?',
      [deliveryId]
    );

    console.log('[confirmShipmentDelivery] Order items:', orderItems);

    let [[outlet]] = await connection.query(
      'SELECT outlet_id FROM Retailer_Outlets WHERE retailer_id = ? LIMIT 1',
      [retailerId]
    );

    console.log('[confirmShipmentDelivery] Existing outlet:', outlet);

    // If no outlet exists, create a default one
    if (!outlet) {
      console.log('[confirmShipmentDelivery] Creating default outlet for retailer:', retailerId);
      const [outletResult] = await connection.query(
        `INSERT INTO Retailer_Outlets (retailer_id, location_name, address, is_active)
         VALUES (?, 'Main Outlet', 'Default Address', TRUE)`,
        [retailerId]
      );
      outlet = { outlet_id: outletResult.insertId };
      console.log('[confirmShipmentDelivery] Created outlet:', outlet);
    }

    for (const item of orderItems) {
      console.log('[confirmShipmentDelivery] Processing item:', item);
      // Check if inventory record exists
      const [[existingInventory]] = await connection.query(
        'SELECT inventory_id FROM Inventory WHERE outlet_id = ? AND product_def_id = ?',
        [outlet.outlet_id, item.product_def_id]
      );

      if (existingInventory) {
        // Update existing inventory
        console.log('[confirmShipmentDelivery] Updating existing inventory:', existingInventory.inventory_id);
        await connection.query(
          `UPDATE Inventory 
           SET quantity_on_hand = quantity_on_hand + ?
           WHERE outlet_id = ? AND product_def_id = ?`,
          [item.quantity, outlet.outlet_id, item.product_def_id]
        );
      } else {
        // Create new inventory record
        console.log('[confirmShipmentDelivery] Creating new inventory record');
        await connection.query(
          `INSERT INTO Inventory (outlet_id, product_def_id, quantity_on_hand)
           VALUES (?, ?, ?)`,
          [outlet.outlet_id, item.product_def_id, item.quantity]
        );
      }
    }

    console.log('[confirmShipmentDelivery] Inventory updated successfully');

    // Log transaction
    await connection.query(
      `INSERT INTO Audit_Logs (user_id, action, details)
       VALUES (?, 'delivery_confirmed', ?)`,
      [retailerId, `B2B Order ${deliveryId} delivery confirmed`]
    ).catch(() => {}); // Ignore if Audit_Logs doesn't exist

    await connection.commit();

    res.json({
      message: 'Shipment delivery confirmed successfully',
      orderId: deliveryId
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

    // In-transit / Shipped orders (B2B orders that have been shipped but not delivered)
    const [[{ in_transit }]] = await db.query(
      `SELECT COUNT(*) as in_transit FROM B2B_Orders
       WHERE retailer_id = ? AND status = 'Shipped'`,
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

    // Recent B2B orders as shipments
    const [recentDeliveries] = await db.query(
      `SELECT bo.b2b_order_id as shipment_id, bo.order_date, bo.status, 
              m.company_name as manufacturerName, bo.total_amount,
              (SELECT COUNT(*) FROM B2B_Order_Items WHERE b2b_order_id = bo.b2b_order_id) as itemCount
       FROM B2B_Orders bo
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       WHERE bo.retailer_id = ?
       ORDER BY bo.order_date DESC LIMIT 5`,
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

// ============================================
// GET CUSTOMERS
// ============================================
export const getCustomers = async (req, res) => {
  try {
    const retailerId = req.user.id;

    const [customers] = await db.query(
      `SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.phone_number,
        u.email,
        COUNT(DISTINCT co.order_id) as total_orders,
        COALESCE(SUM(co.total_amount), 0) as total_spent,
        MAX(co.order_date) as last_purchase
       FROM Customers c
       JOIN Users u ON c.customer_id = u.user_id
       JOIN Customer_Orders co ON c.customer_id = co.customer_id
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? AND co.status != 'Cancelled'
       GROUP BY c.customer_id
       ORDER BY total_spent DESC`,
      [retailerId]
    );

    res.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET SHIPMENTS (Combined B2B + Customer Orders)
// ============================================
export const getShipments = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Incoming shipments from manufacturers (B2B_Orders)
    const [incoming] = await db.query(
      `SELECT 
        bo.b2b_order_id as shipment_id,
        'incoming' as direction,
        bo.order_date,
        bo.status,
        m.company_name as entity_name,
        'Manufacturer' as entity_type,
        bo.total_amount,
        (SELECT COUNT(*) FROM B2B_Order_Items WHERE b2b_order_id = bo.b2b_order_id) as item_count
       FROM B2B_Orders bo
       JOIN Manufacturers m ON bo.manufacturer_id = m.manufacturer_id
       WHERE bo.retailer_id = ?
       ORDER BY bo.order_date DESC`,
      [retailerId]
    );

    // Outgoing deliveries to customers
    const [outgoing] = await db.query(
      `SELECT 
        d.delivery_id as shipment_id,
        'outgoing' as direction,
        co.order_date,
        d.status,
        CONCAT(c.first_name, ' ', c.last_name) as entity_name,
        'Customer' as entity_type,
        co.total_amount,
        d.tracking_number,
        d.current_location,
        d.estimated_arrival,
        (SELECT COUNT(*) FROM Order_Items WHERE order_id = co.order_id) as item_count
       FROM Deliveries d
       JOIN Customer_Orders co ON d.order_id = co.order_id
       JOIN Customers c ON co.customer_id = c.customer_id
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ?
       ORDER BY co.order_date DESC`,
      [retailerId]
    );

    res.json({
      incoming,
      outgoing,
      all: [...incoming, ...outgoing].sort((a, b) => 
        new Date(b.order_date) - new Date(a.order_date)
      )
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ANALYTICS
// ============================================
export const getAnalytics = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Sales trend (last 6 months)
    const [sales_trend] = await db.query(
      `SELECT 
        DATE_FORMAT(co.order_date, '%Y-%m') as month,
        COUNT(co.order_id) as order_count,
        COALESCE(SUM(co.total_amount), 0) as revenue
       FROM Customer_Orders co
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? 
       AND co.order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       AND co.status != 'Cancelled'
       GROUP BY DATE_FORMAT(co.order_date, '%Y-%m')
       ORDER BY month ASC`,
      [retailerId]
    );

    // Top products
    const [top_products] = await db.query(
      `SELECT 
        pd.name as product_name,
        pd.category,
        SUM(oi.quantity) as sales_count,
        SUM(oi.quantity * oi.unit_price) as revenue
       FROM Order_Items oi
       JOIN Product_Definitions pd ON oi.product_def_id = pd.product_def_id
       JOIN Customer_Orders co ON oi.order_id = co.order_id
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? AND co.status != 'Cancelled'
       GROUP BY pd.product_def_id
       ORDER BY sales_count DESC LIMIT 10`,
      [retailerId]
    );

    // Category breakdown
    const [category_breakdown] = await db.query(
      `SELECT 
        pd.category,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as revenue
       FROM Order_Items oi
       JOIN Product_Definitions pd ON oi.product_def_id = pd.product_def_id
       JOIN Customer_Orders co ON oi.order_id = co.order_id
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? AND co.status != 'Cancelled'
       GROUP BY pd.category
       ORDER BY revenue DESC`,
      [retailerId]
    );

    // Customer stats
    const [[customer_stats]] = await db.query(
      `SELECT 
        COUNT(DISTINCT CASE WHEN co.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
              AND NOT EXISTS (SELECT 1 FROM Customer_Orders co2 
              WHERE co2.customer_id = co.customer_id AND co2.order_date < DATE_SUB(NOW(), INTERVAL 30 DAY))
              THEN co.customer_id END) as new_customers,
        COUNT(DISTINCT CASE WHEN (SELECT COUNT(*) FROM Customer_Orders co2 
              JOIN Retailer_Outlets ro2 ON co2.outlet_id = ro2.outlet_id
              WHERE co2.customer_id = co.customer_id AND ro2.retailer_id = ?) > 1 
              THEN co.customer_id END) as repeat_customers,
        COALESCE(AVG(co.total_amount), 0) as avg_order_value
       FROM Customer_Orders co
       JOIN Retailer_Outlets ro ON co.outlet_id = ro.outlet_id
       WHERE ro.retailer_id = ? AND co.status != 'Cancelled'`,
      [retailerId, retailerId]
    );

    // Inventory value
    const [[inventory_metrics]] = await db.query(
      `SELECT 
        COALESCE(SUM(i.quantity_on_hand), 0) as total_units,
        COALESCE(SUM(i.quantity_on_hand * pd.base_price), 0) as inventory_value,
        COUNT(DISTINCT i.product_def_id) as unique_products
       FROM Inventory i
       JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
       JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
       WHERE ro.retailer_id = ?`,
      [retailerId]
    );

    // B2B spending (purchases from manufacturers)
    const [[b2b_spending]] = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total_amount ELSE 0 END), 0) as monthly_spending,
        COALESCE(SUM(total_amount), 0) as total_spending
       FROM B2B_Orders
       WHERE retailer_id = ? AND status IN ('Approved', 'Shipped', 'Delivered')`,
      [retailerId]
    );

    res.json({
      sales_trend,
      top_products,
      category_breakdown,
      customer_stats: {
        new_customers: parseInt(customer_stats?.new_customers) || 0,
        repeat_customers: parseInt(customer_stats?.repeat_customers) || 0,
        avg_order_value: parseFloat(customer_stats?.avg_order_value) || 0
      },
      inventory_metrics: {
        total_units: parseInt(inventory_metrics?.total_units) || 0,
        inventory_value: parseFloat(inventory_metrics?.inventory_value) || 0,
        unique_products: parseInt(inventory_metrics?.unique_products) || 0
      },
      b2b_spending: {
        monthly_spending: parseFloat(b2b_spending?.monthly_spending) || 0,
        total_spending: parseFloat(b2b_spending?.total_spending) || 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ALERTS (IoT + Recalls)
// ============================================
export const getAlerts = async (req, res) => {
  try {
    const retailerId = req.user.id;

    // Get recalls for products in retailer inventory
    const [recalls] = await db.query(
      `SELECT r.recall_id, r.reason, r.recall_date, r.status,
              b.batch_number, pd.name as product_name, m.company_name as manufacturer
       FROM Recalls r
       JOIN Batches b ON r.batch_id = b.batch_id
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
       WHERE r.status = 'Active'
       AND EXISTS (
         SELECT 1 FROM Inventory i
         JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
         WHERE ro.retailer_id = ? AND i.product_def_id = pd.product_def_id
       )
       ORDER BY r.recall_date DESC`,
      [retailerId]
    );

    // Get IoT alerts (temperature/humidity issues)
    const [iot_alerts] = await db.query(
      `SELECT iot.reading_id, iot.temperature, iot.humidity, iot.location, iot.recorded_at,
              b.batch_number, pd.name as product_name
       FROM IoT_Readings iot
       JOIN Batches b ON iot.batch_id = b.batch_id
       JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
       WHERE (iot.temperature > 25 OR iot.temperature < 2 OR iot.humidity > 80 OR iot.humidity < 20)
       AND EXISTS (
         SELECT 1 FROM Inventory i
         JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
         WHERE ro.retailer_id = ? AND i.product_def_id = pd.product_def_id
       )
       ORDER BY iot.recorded_at DESC LIMIT 20`,
      [retailerId]
    );

    // Get low stock alerts
    const [low_stock_alerts] = await db.query(
      `SELECT i.inventory_id, i.quantity_on_hand, pd.name as product_name, pd.category
       FROM Inventory i
       JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
       JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
       WHERE ro.retailer_id = ? AND i.quantity_on_hand < 10 AND i.quantity_on_hand > 0
       ORDER BY i.quantity_on_hand ASC`,
      [retailerId]
    );

    res.json({
      recalls,
      iot_alerts,
      low_stock_alerts,
      stats: {
        active_recalls: recalls.length,
        iot_issues: iot_alerts.length,
        low_stock_count: low_stock_alerts.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getDashboardStats,
  getManufacturers,
  getProductsByManufacturer,
  createOrder,
  getRetailerOrders,
  getOrderDetails,
  getRetailerInventory,
  getIncomingShipments,
  confirmShipmentDelivery,
  getDashboardMetrics,
  searchProducts,
  getCustomers,
  getShipments,
  getAnalytics,
  getAlerts
};
