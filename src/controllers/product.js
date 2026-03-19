import { pool } from '../config/db.js';


const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT id, name, description, price, stock FROM products ORDER BY id ASC'
    );
    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error('GetAllProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};


const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [products] = await pool.query(
      'SELECT id, name, description, price, stock FROM products WHERE id = ?',
      [id]
    );
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({ success: true, product: products[0] });
  } catch (err) {
    console.error('GetProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};


export { getAllProducts, getProduct };