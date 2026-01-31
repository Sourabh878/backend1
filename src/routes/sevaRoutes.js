const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate} = require('../middlewares/authMiddleware');


router.post('/',authenticate, async (req, res) => {
  const { seva_name, description, price, max_bookings_per_day } = req.body;
  try {
    const query = `
      INSERT INTO sevas (seva_name, description, price, max_bookings_per_day)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [seva_name, description, price, max_bookings_per_day];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. READ ALL (Fetch) - HTTP GET
router.get('/',authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sevas WHERE is_active = TRUE ORDER BY seva_id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// 4. DELETE - HTTP DELETE
router.delete('/:id',authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sevas WHERE seva_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Seva not found" });
    res.status(200).json({ message: "Seva deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
