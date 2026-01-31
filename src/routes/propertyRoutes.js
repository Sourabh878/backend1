const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, isAdmin} = require('../middlewares/authMiddleware');

router.get("/active", authenticate, async (req, res)=>{
    try {
        const result = await pool.query(
            'SELECT * FROM temple_properties WHERE is_active = TRUE ORDER BY property_name ASC'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post("/add",authenticate,isAdmin,async function (req, res) {
        const { property_name, property_type, capacity, img1, img2, img3, price_per_day, rules } = req.body;
        try {
            const newProperty = await pool.query(
                `INSERT INTO temple_properties 
            (property_name, property_type, capacity, img1, img2, img3, price_per_day, rules) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [property_name, property_type, capacity, img1, img2, img3, price_per_day, rules]
            );
            res.status(201).json(newProperty.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });


router.delete("/:id",authenticate,isAdmin, async (req, res)=>{
  try{
     await pool.query(
        'DELETE FROM temple_properties WHERE id = $1'
        ,[req.params.id]
     )
        res.status(200).json({message:"Property Deleted Successfully"});
    }
    catch(err){
        res.status(500).send('Server Error');
    }
  }
);

module.exports = router;