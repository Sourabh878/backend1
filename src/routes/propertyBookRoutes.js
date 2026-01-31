const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticate, isAdmin} = require('../middlewares/authMiddleware');

router.post("/book",authenticate, async (req, res)=>{
const {user_id,property_id, function_type, booking_date, time_slot } = req.body;
    const id = user_id; // Extracted from your Auth Middleware

    try {
        // Optional: Check if the date/slot is already booked
        const availabilityCheck = await pool.query(
            'SELECT * FROM property_bookings WHERE property_id = $1 AND booking_date = $2 AND status = $3',
            [property_id, booking_date, 'CONFIRMED']
        );

        if (availabilityCheck.rows.length > 0) {
            return res.status(400).json({ message: "This property is already booked for the selected date." });
        }

        const newBooking = await pool.query(
            `INSERT INTO property_bookings 
            (id, property_id, function_type, booking_date, time_slot) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, property_id, function_type, booking_date, time_slot]
        );

        res.status(201).json({ message: "Booking Request Sent Successfully!", booking: newBooking.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get("/all",authenticate,isAdmin, async (req, res)=>{
    try{

        const result =await pool.query(
            `SELECT pb.booking_id, pb.booking_date, pb.time_slot, pb.function_type,tp.price_per_day,
             pb.status, u.full_name AS user_name, tp.property_name FROM property_bookings pb
             JOIN users u ON pb.id = u.id JOIN temple_properties tp
             ON pb.property_id = tp.property_id ORDER BY pb.booking_date DESC`
              
        );
        res.status(200).json(result.rows);

    }
    catch(err)
    {
         console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put("/status/:id",authenticate,isAdmin, async (req, res)=>{
    const {id} = req.params;
    const {status} =req.body;

    try{
        const updatedBooking =await pool.query(
            `update property_bookings set status=$1 where booking_id=$2 returning *`,
            [status,id]

        );
    }
    catch(err)
    {
        res.status(err.status || 500).json({ error: err.message});
    }
});


module.exports= router;