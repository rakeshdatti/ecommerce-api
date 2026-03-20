import { pool } from '../config/db.js';

const getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const [items] = await pool.query(
      `SELECT c.id AS cart_id, p.id AS product_id, p.name, p.price,
              c.quantity, (p.price * c.quantity) AS subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    return res.status(200).json({
      success: true,
      cart: items,
      total_wallet_points: total.toFixed(2),
    });
  } catch (err) {
    console.error('GetCart error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  try {

    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units in stock.`,
      });
    }


    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, product_id, quantity, quantity]
    );

    return res.status(200).json({
      success: true,
      message: `${product.name} added to cart.`,
    });
  } catch (err) {
    console.error('AddToCart error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};


export { getCart, addToCart};