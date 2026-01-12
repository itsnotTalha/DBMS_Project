import db from '../config/db.js';

// ------------------------------------------------------------------
// GET ALL PRODUCTS (Public - No Auth Required)
// ------------------------------------------------------------------
export const getPublicProducts = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;

    let query = `
      SELECT 
        pd.product_def_id,
        pd.name,
        pd.description,
        pd.category,
        pd.base_price,
        pd.image_url,
        pd.current_stock,
        m.company_name as manufacturer_name,
        m.license_number,
        CASE 
          WHEN pd.current_stock > 0 THEN TRUE 
          ELSE FALSE 
        END as in_stock
      FROM Product_Definitions pd
      JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
      WHERE pd.is_active = TRUE
    `;

    const params = [];

    if (category && category !== 'All') {
      query += ` AND pd.category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (pd.name LIKE ? OR pd.description LIKE ? OR m.company_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY pd.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [products] = await db.query(query, params);

    res.json({ products });

  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// ------------------------------------------------------------------
// GET SINGLE PRODUCT DETAILS (Public)
// ------------------------------------------------------------------
export const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(`
      SELECT 
        pd.product_def_id,
        pd.name,
        pd.description,
        pd.category,
        pd.base_price,
        pd.image_url,
        pd.current_stock,
        pd.created_at,
        m.company_name as manufacturer_name,
        m.license_number,
        m.manufacturer_id,
        CASE 
          WHEN pd.current_stock > 0 THEN TRUE 
          ELSE FALSE 
        END as in_stock
      FROM Product_Definitions pd
      JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
      WHERE pd.product_def_id = ? AND pd.is_active = TRUE
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: products[0] });

  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
};

// ------------------------------------------------------------------
// GET ALL CATEGORIES (Public)
// ------------------------------------------------------------------
export const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT DISTINCT category 
      FROM Product_Definitions 
      WHERE category IS NOT NULL AND is_active = TRUE
      ORDER BY category
    `);

    res.json({ 
      categories: categories.map(c => c.category)
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// ------------------------------------------------------------------
// GET FEATURED MANUFACTURERS (Public)
// ------------------------------------------------------------------
export const getFeaturedManufacturers = async (req, res) => {
  try {
    const [manufacturers] = await db.query(`
      SELECT 
        m.manufacturer_id,
        m.company_name,
        m.license_number,
        COUNT(pd.product_def_id) as product_count
      FROM Manufacturers m
      LEFT JOIN Product_Definitions pd ON m.manufacturer_id = pd.manufacturer_id AND pd.is_active = TRUE
      GROUP BY m.manufacturer_id, m.company_name, m.license_number
      HAVING product_count > 0
      ORDER BY product_count DESC
      LIMIT 10
    `);

    res.json({ manufacturers });

  } catch (error) {
    console.error('Get manufacturers error:', error);
    res.status(500).json({ error: 'Failed to fetch manufacturers' });
  }
};

// ------------------------------------------------------------------
// GET RETAILER OUTLETS (For checkout - requires auth)
// ------------------------------------------------------------------
export const getRetailerOutlets = async (req, res) => {
  try {
    const [outlets] = await db.query(`
      SELECT 
        ro.outlet_id,
        ro.location_name,
        ro.address,
        ro.geo_lat,
        ro.geo_lng,
        r.business_name as retailer_name
      FROM Retailer_Outlets ro
      JOIN Retailers r ON ro.retailer_id = r.retailer_id
      WHERE ro.is_active = TRUE
      ORDER BY ro.location_name
    `);

    res.json({ outlets });

  } catch (error) {
    console.error('Get outlets error:', error);
    res.status(500).json({ error: 'Failed to fetch outlets' });
  }
};
