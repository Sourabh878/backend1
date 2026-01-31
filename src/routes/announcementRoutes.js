const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, isAdmin} = require('../middlewares/authMiddleware');


// --------------------------------------
// GET ACTIVE ANNOUNCEMENTS (PUBLIC)
// --------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM announcements
       WHERE is_active = TRUE
       ORDER BY priority ASC, created_at DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});


// --------------------------------------
// ADD ANNOUNCEMENT (ADMIN)
// --------------------------------------
router.post("/",authenticate,isAdmin,async (req, res) => {
  const { title, priority } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO announcements (title, priority)
       VALUES ($1, $2)
       RETURNING *`,
      [title, priority]
    );

    res.status(201).json({
      message: "Announcement added",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to add announcement" });
  }
});


// --------------------------------------
// UPDATE ANNOUNCEMENT (ADMIN)
// --------------------------------------
router.put("/:id", async (req, res) => {
  const { title, is_active, priority } = req.body;

  try {
    const result = await pool.query(
      `UPDATE announcements
       SET title=$1,
           is_active=$2,
           priority=$3
       WHERE announcement_id=$4
       RETURNING *`,
      [title, is_active, priority, req.params.id]
    );

    res.status(200).json({
      message: "Announcement updated",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});


// --------------------------------------
// DELETE ANNOUNCEMENT (ADMIN)
// --------------------------------------
router.delete("/:id",authenticate,isAdmin,async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM announcements WHERE announcement_id=$1",
      [req.params.id]
    );

    res.status(200).json({ message: "Announcement deleted" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;
