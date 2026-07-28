const sequelize = require('./config/database');
const { User, Teacher, Student, Class, Attendance, Mark, Task, TaskCompletion } = require('./models');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Supabase has been established successfully.');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
    
    // Run seeders if the database is empty
    const seedDatabase = require('./config/seeder');
    await seedDatabase();
    console.log('Database seeding complete.');
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

testConnection();
