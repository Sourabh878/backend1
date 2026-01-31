const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const newsRoutes= require('./routes/newsRoutes');
const announcementRoutes = require("./routes/announcementRoutes");
const sevaRoutes = require('./routes/sevaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const propertRoutes = require('./routes/propertyRoutes');
const propertyBookRoutes = require('./routes/propertyBookRoutes');
const scholarshipRoutes = require('./routes/ScholarshipRoutes');
// const {createOrder,verifyPayment} = require('./routes/razorpayRoute');
const pool = require('./config/db');


const app = express();

// app.use(cors({origin: `https://frontend-one-sandy-24.vercel.app`}));


app.use(cors());


// app.options("/api/(.*)", cors()); // ✅ Correct syntax for modern Express/Vercel environments
// The :any part gives the wildcard a name, which satisfies the new safety rules
// app.options("/api/:any*", cors());


// 1. Define allowed origins



// 3. Handle Preflight Globally (Safe Syntax)
// app.options('*', cors());

app.use(express.json());


//test database

app.get('/',(req,res)=>{
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/news',newsRoutes);

app.use("/api/announcements", announcementRoutes);

app.use('/api/sevas', sevaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/properties',propertRoutes);
// app.use('/api/razorpay',createOrder);
// app.use('/api/razorpay',verifyPayment);
app.use('/api/propertyBookings',propertyBookRoutes);
app.use('/api/scholarships',scholarshipRoutes);


app.use('/api/getId',(req,res)=>{
  const {ab,cd,curr_user}=require('./controllers/authController');
  console.log("Current User ID:",curr_user);
  res.json({userId:curr_user});

});


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB Error:', err.message);
  } else {
    console.log('🕒 DB Time:', res.rows[0].now);
  }
});



module.exports = app;
