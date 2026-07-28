const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { sequelize } = require('./models');
const seedDatabase = require('./config/seeder');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'madrasa_super_secret_key_1298',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Global Variables Middleware
app.use((req, res, next) => {
  res.locals.user = req.session;
  next();
});

// Load Routers
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const parentRoutes = require('./routes/parent');

// Register Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/parent', parentRoutes);

// Root Redirect to Dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Error handling for 404
app.use((req, res) => {
  res.status(404).render('auth/login', { error: 'Page not found.', success: null });
});

// Database Synchronization & Server Listening
sequelize
  .sync({ force: false }) // preserves existing table schema without constraint conflicts
  .then(async () => {
    console.log('Database synchronized.');
    
    // Ensure fixed classes 1-12 exist in the database
    const { Class } = require('./models');
    const classCount = await Class.count();
    if (classCount === 0) {
      console.log('Creating fixed classes 1-12...');
      const classesData = [];
      for (let i = 1; i <= 12; i++) {
        classesData.push({
          name: `Class ${i}`,
          level: i,
          section: 'A',
          startTime: '08:30:00',
          endTime: '15:30:00',
          graceTime: 10
        });
      }
      await Class.bulkCreate(classesData);
      console.log('Fixed classes 1-12 created successfully.');
    }

    // Seed initial database records if empty
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database sync failed:', err);
  });

module.exports = app;


