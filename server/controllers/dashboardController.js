import db from '../config/db.js';

// 1. Fetch Stats for the Top Cards
export const getStats = async (req, res) => {
    try {
        const [batches] = await db.query('SELECT COUNT(*) as count FROM Batches');
        const [items] = await db.query('SELECT COUNT(*) as count FROM Product_Items');
        const [transit] = await db.query('SELECT COUNT(*) as count FROM Deliveries WHERE status = "In_Transit"');
        const [alerts] = await db.query('SELECT COUNT(*) as count FROM Risk_Alerts WHERE severity = "High"');

        res.json({
            batches: batches[0].count,
            units: items[0].count,
            transit: transit[0].count,
            alerts: alerts[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Fetch Shipment Tracking Table Data
export const getShipments = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.tracking_number as id, 
                b.batch_code as batch, 
                d.current_location as dest, 
                i.temperature as temp, 
                d.status
            FROM Deliveries d
            JOIN Batches b ON d.order_id = b.order_id
            LEFT JOIN (
                SELECT batch_id, temperature 
                FROM IoT_Readings 
                WHERE (batch_id, recorded_at) IN (SELECT batch_id, MAX(recorded_at) FROM IoT_Readings GROUP BY batch_id)
            ) i ON b.batch_id = i.batch_id
            LIMIT 5`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Fetch Recent Ledger Events
export const getLedger = async (req, res) => {
    try {
        const query = `
            SELECT action as title, created_at as time, current_hash as hash 
            FROM Product_Transactions 
            ORDER BY created_at DESC LIMIT 3`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
