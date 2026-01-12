import db from '../config/db.js';

// ------------------------------------------------------------------
// PLACE CUSTOMER ORDER
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

    // Calculate total and validate stock
    let totalAmount = 0;
    for (const item of items) {
      // Check stock availability
      const [products] = await connection.query(
        'SELECT current_stock, base_price FROM Product_Definitions WHERE product_def_id = ? AND is_active = TRUE',
        [item.product_def_id]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.product_def_id} not found`);
      }

      if (products[0].current_stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_def_id}`);
      }

      totalAmount += item.unit_price * item.quantity;
    }

    // Create the order
    const [orderResult] = await connection.query(
      `INSERT INTO Customer_Orders (customer_id, outlet_id, total_amount, payment_method, status) 
       VALUES (?, ?, ?, ?, 'Processing')`,
      [customerId, outlet_id, totalAmount, payment_method]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of items) {
      await connection.query(
        `INSERT INTO Order_Items (order_id, product_def_id, quantity, unit_price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_def_id, item.quantity, item.unit_price]
      );

      // Update stock
      await connection.query(
        'UPDATE Product_Definitions SET current_stock = current_stock - ? WHERE product_def_id = ?',
        [item.quantity, item.product_def_id]
      );
    }

    // Create delivery record
    const trackingNumber = `TRK-${Date.now()}-${orderId}`;
    const estimatedArrival = new Date();
    estimatedArrival.setDate(estimatedArrival.getDate() + 5); // 5 days delivery

    await connection.query(
      `INSERT INTO Deliveries (order_id, tracking_number, current_location, estimated_arrival, status) 
       VALUES (?, ?, ?, ?, 'Dispatched')`,
      [orderId, trackingNumber, shipping_address || 'Processing Center', estimatedArrival]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        order_id: orderId,
        tracking_number: trackingNumber,
        total_amount: totalAmount,
        estimated_arrival: estimatedArrival
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
