const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, isAdmin} = require('../middlewares/authMiddleware');
const upload = require("../middlewares/upload");
const uploadImage = require("../utils/supabaseupload");


// --------------------------------------
// GET ALL NEWS & EVENTS (PUBLIC)
// --------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM news_events ORDER BY event_date ASC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news/events" });
  }
});


// --------------------------------------
// GET UPCOMING EVENTS (HOME PAGE)
// --------------------------------------
router.get("/upcoming", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM news_events
       WHERE event_date >= CURRENT_DATE
       ORDER BY event_date ASC
       LIMIT 4`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
});


// --------------------------------------
// ADD NEWS / EVENT (ADMIN)
// --------------------------------------


router.post("/", upload.single("image"), async (req, res) => {
  const { title, description, event_date } = req.body;
  let image_url = null;

  try {
    if (req.file) {
      image_url = await uploadImage(req.file, "events");
      // console.log("Uploaded Image URL:", image_url);
    }

    const result = await pool.query(
      `INSERT INTO news_events (title, description, event_date, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, event_date, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add event" });
  }
});



// --------------------------------------
// UPDATE NEWS / EVENT (ADMIN)
// --------------------------------------
router.put("/:id",authenticate,isAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, event_date, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE news_events
       SET title=$1,
           description=$2,
           event_date=$3,
           image_url=$4
       WHERE news_id=$5
       RETURNING *`,
      [title, description, event_date, image_url, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "News/Event not found" });
    }

    res.status(200).json({
      message: "News/Event updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update news/event" });
  }
});


// --------------------------------------
// DELETE NEWS / EVENT (ADMIN)
// --------------------------------------
router.delete("/:id",authenticate,isAdmin,async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM news_events WHERE news_id = $1",
      [req.params.id]
    );

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete news/event" });
  }
});

module.exports = router;
