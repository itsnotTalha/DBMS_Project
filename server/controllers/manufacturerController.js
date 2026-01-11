import db from '../config/db.js';
import crypto from 'crypto';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const generateBatchNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BATCH-${dateStr}-${rand}`;
};

const generateSerialCode = (batchNumber, index) => {
    return `${batchNumber}-${String(index).padStart(4, '0')}`;
};

const generateAuthHash = (serialCode) => {
    const secret = process.env.QR_SECRET || 'supply-chain-secret-key';
    return crypto.createHash('sha256')
        .update(serialCode + secret + Date.now())
        .digest('hex');
};

// ============================================================
// 1. DASHBOARD STATS
// ============================================================

export const getDashboardStats = async (req, res) => {
    try {
        const manufacturer_id = req.user.id;

        const [[stats]] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM Product_Definitions WHERE manufacturer_id = ?) as total_products,
                (SELECT COUNT(*) FROM Batches WHERE manufacturer_id = ? AND status = 'Active') as active_batches,
                (SELECT COUNT(*) FROM B2B_Orders WHERE manufacturer_id = ? AND status = 'Pending') as pending_orders,
                (SELECT COALESCE(SUM(current_stock), 0) FROM Product_Definitions WHERE manufacturer_id = ?) as total_stock
        `, [manufacturer_id, manufacturer_id, manufacturer_id, manufacturer_id]);

        // Get recent activity count
        const [[activity]] = await db.query(`
            SELECT COUNT(*) as recent_transactions
            FROM Product_Transactions pt
            JOIN Product_Items pi ON pt.item_id = pi.item_id
            JOIN Batches b ON pi.batch_id = b.batch_id
            WHERE b.manufacturer_id = ? AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `, [manufacturer_id]);

        res.json({
            total_products: stats.total_products || 0,
            active_batches: stats.active_batches || 0,
            pending_orders: stats.pending_orders || 0,
            total_stock: stats.total_stock || 0,
            recent_transactions: activity.recent_transactions || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// 2. PRODUCTS MANAGEMENT (Blueprints)
// ============================================================

export const getProducts = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Product_Definitions WHERE manufacturer_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addProduct = async (req, res) => {
    try {
        const { name, description, category, base_price, image_url } = req.body;

        if (!name || !base_price) {
            return res.status(400).json({ error: 'Product name and base price are required' });
        }

        const [result] = await db.query(`
            INSERT INTO Product_Definitions 
            (manufacturer_id, name, description, category, base_price, image_url, current_stock, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 0, TRUE)
        `, [req.user.id, name, description || '', category || '', base_price, image_url || '']);

        res.status(201).json({
            message: 'Product created successfully',
            product_def_id: result.insertId
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// 3. PRODUCTION BATCHES (with QR Hash Generation)
// ============================================================

export const getProduction = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                b.batch_id, 
                b.batch_number, 
                b.manufacturing_date, 
                b.expiry_date, 
                b.status,
                b.created_at,
                p.name as product_name,
                p.product_def_id,
                (SELECT COUNT(*) FROM Product_Items WHERE batch_id = b.batch_id) as items_count
            FROM Batches b 
            JOIN Product_Definitions p ON b.product_def_id = p.product_def_id 
            WHERE b.manufacturer_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching production:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createProduction = async (req, res) => {
    const { product_def_id, quantity, manufacturing_date, expiry_date } = req.body;

    if (!product_def_id || !quantity || !manufacturing_date || !expiry_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const batch_number = generateBatchNumber();

        // Create batch
        const [batchResult] = await connection.query(`
            INSERT INTO Batches (
                product_def_id, 
                manufacturer_id, 
                batch_number, 
                manufacturing_date, 
                expiry_date, 
                status, 
                created_at
            )
            VALUES (?, ?, ?, ?, ?, 'Active', NOW())
        `, [product_def_id, req.user.id, batch_number, manufacturing_date, expiry_date]);

        const batch_id = batchResult.insertId;

        // Create individual product items with QR hashes
        for (let i = 1; i <= quantity; i++) {
            const serial_code = generateSerialCode(batch_number, i);
            const authentication_hash = generateAuthHash(serial_code);

            // Insert product item
            const [itemResult] = await connection.query(`
                INSERT INTO Product_Items (batch_id, serial_code, authentication_hash, status)
                VALUES (?, ?, ?, 'Manufacturing')
            `, [batch_id, serial_code, authentication_hash]);

            // Create transaction record (blockchain-style ledger)
            const previous_hash = i === 1 ? '0'.repeat(64) : authentication_hash;
            await connection.query(`
                INSERT INTO Product_Transactions 
                (item_id, action, actor_user_id, location, previous_hash, current_hash)
                VALUES (?, 'Manufactured', ?, 'Factory', ?, ?)
            `, [itemResult.insertId, req.user.id, previous_hash, authentication_hash]);
        }

        // Update Product Stock
        await connection.query(`
            UPDATE Product_Definitions 
            SET current_stock = current_stock + ? 
            WHERE product_def_id = ?
        `, [quantity, product_def_id]);

        await connection.commit();
        res.status(201).json({
            message: 'Batch created successfully',
            batch_id: batch_id,
            batch_number: batch_number,
            items_created: quantity
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating batch:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// ============================================================
// 4. B2B ORDERS MANAGEMENT
// ============================================================

export const getOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                o.b2b_order_id,
                o.order_date,
                o.status,
                o.total_amount,
                r.business_name,
                r.tax_id,
                r.headquarters_address
            FROM B2B_Orders o
            JOIN Retailers r ON o.retailer_id = r.retailer_id
            WHERE o.manufacturer_id = ?
            ORDER BY o.order_date DESC
        `, [req.user.id]);

        // Get items for each order
        for (let order of orders) {
            const [items] = await db.query(`
                SELECT 
                    i.b2b_item_id,
                    i.product_def_id,
                    i.quantity,
                    i.unit_price,
                    p.name as product_name
                FROM B2B_Order_Items i
                JOIN Product_Definitions p ON i.product_def_id = p.product_def_id
                WHERE i.b2b_order_id = ?
            `, [order.b2b_order_id]);
            order.items = items;
        }

        res.json({ data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
};

export const acceptOrder = async (req, res) => {
    const { fulfillment_type } = req.body; // 'inventory' or 'production'
    const order_id = req.params.id;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get order details
        const [[order]] = await connection.query(
            'SELECT * FROM B2B_Orders WHERE b2b_order_id = ? AND manufacturer_id = ?',
            [order_id, req.user.id]
        );

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'Pending') {
            throw new Error('Order is not in pending status');
        }

        // Get order items
        const [items] = await connection.query(
            'SELECT * FROM B2B_Order_Items WHERE b2b_order_id = ?',
            [order_id]
        );

        if (fulfillment_type === 'inventory') {
            // Check and deduct from inventory
            for (const item of items) {
                const [[product]] = await connection.query(
                    'SELECT current_stock FROM Product_Definitions WHERE product_def_id = ?',
                    [item.product_def_id]
                );

                if (!product || product.current_stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ID ${item.product_def_id}`);
                }

                await connection.query(
                    'UPDATE Product_Definitions SET current_stock = current_stock - ? WHERE product_def_id = ?',
                    [item.quantity, item.product_def_id]
                );
            }

            await connection.query(
                'UPDATE B2B_Orders SET status = ? WHERE b2b_order_id = ?',
                ['Approved', order_id]
            );
        } else if (fulfillment_type === 'production') {
            // Create production batches for each item
            for (const item of items) {
                const batch_number = generateBatchNumber();
                const manufacturing_date = new Date().toISOString().split('T')[0];
                const expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                await connection.query(`
                    INSERT INTO Batches 
                    (product_def_id, manufacturer_id, retailer_order_id, batch_number, manufacturing_date, expiry_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'In Progress')
                `, [item.product_def_id, req.user.id, order_id, batch_number, manufacturing_date, expiry_date]);
            }

            await connection.query(
                'UPDATE B2B_Orders SET status = ? WHERE b2b_order_id = ?',
                ['Approved', order_id]
            );
        }

        await connection.commit();
        res.json({ message: 'Order accepted successfully', fulfillment_type });
    } catch (error) {
        await connection.rollback();
        console.error('Error accepting order:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const rejectOrder = async (req, res) => {
    const order_id = req.params.id;

    try {
        const [result] = await db.query(
            'UPDATE B2B_Orders SET status = ? WHERE b2b_order_id = ? AND manufacturer_id = ? AND status = ?',
            ['Cancelled', order_id, req.user.id, 'Pending']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found or not in pending status' });
        }

        res.json({ message: 'Order rejected successfully' });
    } catch (error) {
        console.error('Error rejecting order:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// 5. SHIPMENTS
// ============================================================

export const getShipments = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                o.b2b_order_id as shipment_id,
                b.batch_number,
                r.business_name as destination,
                r.headquarters_address as address,
                o.status,
                o.order_date,
                o.total_amount
            FROM B2B_Orders o
            JOIN Retailers r ON o.retailer_id = r.retailer_id
            LEFT JOIN Batches b ON b.retailer_order_id = o.b2b_order_id
            WHERE o.manufacturer_id = ? AND o.status IN ('Shipped', 'Delivered', 'Approved')
            ORDER BY o.order_date DESC
        `, [req.user.id]);

        // Calculate stats
        const inTransit = rows.filter(r => r.status === 'Shipped').length;
        const delivered = rows.filter(r => r.status === 'Delivered').length;

        res.json({
            shipments: rows,
            stats: {
                in_transit: inTransit,
                delivered: delivered,
                total: rows.length
            }
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// 6. IoT ALERTS
// ============================================================

export const getAlerts = async (req, res) => {
    try {
        const manufacturer_id = req.user.id;

        // Get risk alerts for this manufacturer's batches and products
        const [alerts] = await db.query(`
            SELECT ra.* FROM Risk_Alerts ra
            WHERE (ra.related_entity = 'Batch' AND ra.entity_id IN 
                (SELECT batch_id FROM Batches WHERE manufacturer_id = ?))
            OR (ra.related_entity = 'Product' AND ra.entity_id IN 
                (SELECT product_def_id FROM Product_Definitions WHERE manufacturer_id = ?))
            ORDER BY ra.created_at DESC
        `, [manufacturer_id, manufacturer_id]);

        // Get IoT readings with threshold violations
        const [iotAlerts] = await db.query(`
            SELECT 
                ir.reading_id,
                ir.batch_id,
                ir.temperature,
                ir.humidity,
                ir.location,
                ir.recorded_at,
                b.batch_number,
                CASE 
                    WHEN ir.temperature > 8 OR ir.temperature < 2 THEN 'High'
                    WHEN ir.humidity > 80 THEN 'Medium'
                    ELSE 'Low'
                END as severity
            FROM IoT_Readings ir
            JOIN Batches b ON ir.batch_id = b.batch_id
            WHERE b.manufacturer_id = ?
            AND (ir.temperature > 8 OR ir.temperature < 2 OR ir.humidity > 80)
            ORDER BY ir.recorded_at DESC
            LIMIT 50
        `, [manufacturer_id]);

        // Calculate stats
        const criticalCount = alerts.filter(a => a.severity === 'High').length;
        const highCount = alerts.filter(a => a.severity === 'Medium').length;
        const mediumCount = iotAlerts.filter(a => a.severity === 'Medium').length;
        const lowCount = iotAlerts.filter(a => a.severity === 'Low').length;

        res.json({
            alerts: [...alerts, ...iotAlerts.map(r => ({
                alert_id: `iot-${r.reading_id}`,
                alert_type: 'IoT Reading',
                severity: r.severity,
                description: `Temperature: ${r.temperature}°C, Humidity: ${r.humidity}% at ${r.location}`,
                related_entity: 'Batch',
                entity_id: r.batch_id,
                batch_number: r.batch_number,
                created_at: r.recorded_at,
                status: 'New'
            }))],
            stats: {
                critical: criticalCount,
                high: highCount,
                medium: mediumCount,
                low: lowCount
            }
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// 7. LEDGER AUDIT (Blockchain-style Transaction History)
// ============================================================

export const getLedger = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                pt.tx_id,
                pt.action,
                pt.location,
                pt.previous_hash,
                pt.current_hash,
                pt.created_at,
                pi.serial_code,
                b.batch_number,
                pd.name as product_name,
                u.email as actor_email
            FROM Product_Transactions pt
            JOIN Product_Items pi ON pt.item_id = pi.item_id
            JOIN Batches b ON pi.batch_id = b.batch_id
            JOIN Product_Definitions pd ON b.product_def_id = pd.product_def_id
            LEFT JOIN Users u ON pt.actor_user_id = u.user_id
            WHERE b.manufacturer_id = ?
            ORDER BY pt.created_at DESC
            LIMIT 100
        `, [req.user.id]);

        // Calculate stats
        const totalTransactions = rows.length;
        const verifiedCount = rows.filter(r => r.current_hash && r.current_hash.length === 64).length;

        res.json({
            transactions: rows,
            stats: {
                total_transactions: totalTransactions,
                verified_blocks: verifiedCount,
                integrity_score: totalTransactions > 0 ? Math.round((verifiedCount / totalTransactions) * 100) : 100
            }
        });
    } catch (error) {
        console.error('Error fetching ledger:', error);
        res.status(500).json({ error: error.message });
    }
};