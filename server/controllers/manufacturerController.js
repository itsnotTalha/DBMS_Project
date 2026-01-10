import db from '../config/db.js';

// controllers/manufacturerController.js

// server/controllers/manufacturerController.js

export const getProducts = async (req, res) => {
    try {
        // FIXED: Changed specific columns to '*' to get description, price, category, stock, etc.
        const [rows] = await db.query(
            'SELECT * FROM Product_Definitions WHERE manufacturer_id = ?', 
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getProduction = async (req, res) => {
    try {
        // FIXED: Selected 'batch_number' as 'batch_number' so frontend logic doesn't break
        const [rows] = await db.query(`
            SELECT b.batch_id, b.batch_number as batch_number, b.quantity, b.manufacturing_date, b.expiry_date, b.status,
                   p.name as product_name 
            FROM Batches b 
            JOIN Product_Definitions p ON b.product_def_id = p.product_def_id 
            WHERE p.manufacturer_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching production:', error);
        res.status(500).json({ error: error.message });
    }
};

// controllers/manufacturerController.js

// controllers/manufacturerController.js

export const createProduction = async (req, res) => {
    const { product_def_id, quantity, manufacturing_date, expiry_date } = req.body;
    
    if (!product_def_id || !quantity || !manufacturing_date || !expiry_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        // This variable name must match the column name in your database
        const batch_number = `BATCH-${dateStr}-${rand}`; 

        // --- THE FIX IS HERE ---
        // We are adding 'manufacturer_id' to the columns list and 'req.user.id' to the values
        const [result] = await connection.query(`
            INSERT INTO Batches (
                product_def_id, 
                manufacturer_id, 
                batch_number, 
                quantity, 
                manufacturing_date, 
                expiry_date, 
                status, 
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())
        `, [
            product_def_id, 
            req.user.id,        // <--- This provides the missing value
            batch_number, 
            quantity, 
            manufacturing_date, 
            expiry_date
        ]);

        // Update Product Stock
        await connection.query(`
            UPDATE Product_Definitions 
            SET current_stock = current_stock + ? 
            WHERE product_def_id = ?
        `, [quantity, product_def_id]);

        await connection.commit();
        res.status(201).json({ message: 'Batch created successfully', batchId: result.insertId });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating batch:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};