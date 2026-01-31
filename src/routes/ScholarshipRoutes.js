const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, isAdmin} = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM scholarship_info ORDER BY s_id DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', authenticate, isAdmin, async (req, res)=>{
    const {description, link} = req.body;
    try{
        const newScholarship = await pool.query(
            `INSERT INTO scholarship_info (description, link)
            VALUES ($1, $2) RETURNING *`,
            [description, link]
        );
        res.status(201).json({ message: "Scholarship Added Successfully!", scholarship: newScholarship.rows[0] });
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', authenticate, isAdmin, async (req, res)=>{
    const {id} = req.params;
    try{
         await pool.query(
            'DELETE FROM scholarship_info WHERE s_id = $1',
            [id]
            );

            res.status(200).json({message:err.message ||'Server error' });
    }
    catch(err)
    {
        res.status(err.status || 500).json({ message: err.message || 'Server Error' })
    }
});


module.exports= router;


