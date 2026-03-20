import { pool } from '../config/db.js';

const placeOrder = async (req, res) => {
  const userId = req.user.id;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cartItems] = await conn.query(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );


    if (cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}". Available: ${item.stock}`,
        });
      }
    }

    const totalPoints = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const [users] = await conn.query('SELECT wallet_points FROM users WHERE id = ?', [userId]);
    const walletBalance = Number(users[0].wallet_points);

    if (walletBalance < totalPoints) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet points. Required: ${totalPoints}, Available: ${walletBalance}`,
      });
    }


    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_points, status, payment_status) VALUES (?, ?, ?, ?)',
      [userId, totalPoints, 'pending', 'pending']
    );
    const orderId = orderResult.insertId;

    //  Insert order items + deduct stock
    for (const item of cartItems) {
      const subtotal = Number(item.price) * item.quantity;

      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, subtotal]
      );


      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await conn.query(
      'UPDATE users SET wallet_points = wallet_points - ? WHERE id = ?',
      [totalPoints, userId]
    );

    await conn.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        total_points: totalPoints,
        status: 'pending',
        payment_status: 'pending',
        items: cartItems.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('PlaceOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};


const handlePayment = async (req, res) => {
  const userId = req.user.id;
  const { order_id, payment_status } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, userId]
    );

    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];


    if (order.payment_status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Payment already processed: ${order.payment_status}`,
      });
    }

    if (payment_status === 'success') {
      await conn.query(
        "UPDATE orders SET payment_status = 'success', status = 'paid' WHERE id = ?",
        [order_id]
      );

      await conn.commit();
      return res.status(200).json({
        success: true,
        message: 'Payment successful! Order confirmed',
        order_id,
        status: 'paid',
      });

    } else {
      const [orderItems] = await conn.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [order_id]
      );

      for (const item of orderItems) {
        await conn.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await conn.query(
        'UPDATE users SET wallet_points = wallet_points + ? WHERE id = ?',
        [order.total_points, userId]
      );


      await conn.query(
        "UPDATE orders SET payment_status = 'failure', status = 'failed' WHERE id = ?",
        [order_id]
      );

      await conn.commit();
      return res.status(200).json({
        success: false,
        message: 'Payment failed. Stock restored and wallet points refunded. ❌',
        order_id,
        status: 'failed',
        refunded_points: order.total_points,
      });
    }
  } catch (err) {
    await conn.rollback();
    console.error('HandlePayment error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

export { placeOrder, handlePayment };


