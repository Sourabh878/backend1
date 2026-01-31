const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const {authenticate,isAdmin} = require('../middlewares/authMiddleware');


 // client
router.post('/',authenticate, async (req, res) => {
  const { user_id, seva_id, seva_date, time_slot, payment_id } = req.body;
  
  try {
    // Optional: Check if the max_bookings_per_day has been reached
    const checkLimit = await pool.query(
      'SELECT count(*) FROM seva_bookings WHERE seva_id = $1 AND seva_date = $2',
      [seva_id, seva_date]
    );
    
    // You could query the sevas table here to compare against max_bookings_per_day
    
    const query = `
      INSERT INTO seva_bookings (user_id, seva_id, seva_date, time_slot, payment_id)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const values = [user_id, seva_id, seva_date, time_slot, payment_id];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: "Seva booked successfully!",
      booking: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. READ USER'S BOOKINGS (HTTP GET)
// Used by devotees to see their "My Bookings" page
router.get('/user/:userId',authenticate, async (req, res) => {
  try {
    const query = `
      SELECT b.*, s.seva_name, s.price 
      FROM seva_bookings b
      JOIN sevas s ON b.seva_id = s.seva_id
      WHERE b.user_id = $1
      ORDER BY b.seva_date DESC;
    `;
    const result = await pool.query(query, [req.params.userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. READ ALL BOOKINGS (HTTP GET)
// Used by Admin to see the daily schedule
router.get('/admin/all',authenticate,isAdmin, async (req, res) => {
  try {
    const query = `
      SELECT b.*, s.seva_name, u.email as user_email,u.full_name as full_name,s.price as price
      FROM seva_bookings b
      JOIN sevas s ON b.seva_id = s.seva_id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.seva_date ASC;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. CANCEL BOOKING (HTTP PATCH)
router.patch('/cancel/:id',authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE seva_bookings SET status = 'CANCELLED' WHERE booking_id = $1 RETURNING *",
      [req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;