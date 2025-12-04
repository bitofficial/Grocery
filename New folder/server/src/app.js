// Express application setup with session, routes, and error handling
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userService = require('./services/userService');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json());

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'grocery_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Ensure there is only one admin account and it is admin@gmail.com with password Admin123
const path = require('path');
const { writeJson } = require('./models/fileDb');
(async () => {
  try {
    const users = await userService.getAll();
    // remove any existing admin entries
    const nonAdmins = users.filter(u => u.role !== 'admin');
    const hashed = await bcrypt.hash('Admin123', 10);
    const admin = { id: 'admin-0001', name: 'Admin', email: 'admin@gmail.com', password: hashed, role: 'admin' };
    nonAdmins.push(admin);
    const USERS_PATH = path.join(__dirname, '../data/users.json');
    await writeJson(USERS_PATH, nonAdmins);
    console.log('Ensured admin account: admin@gmail.com / Admin123');
  } catch (e) { console.error('Admin seed failed', e) }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
