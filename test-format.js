const sequelize = require('./config/database');
const seedDatabase = require('./config/seeder');

async function formatSupabase() {
  try {
    console.log('Connecting to Supabase...');
    await sequelize.authenticate();
    console.log('Connected to:', sequelize.options.dialect);
    
    console.log('Dropping and recreating tables (force: true)...');
    await sequelize.sync({ force: true });
    
    console.log('Tables recreated. Seeding default admin...');
    await seedDatabase();
    
    console.log('Format complete. Checking User count...');
    const { User } = require('./models');
    const count = await User.count();
    console.log(`Total users in DB: ${count}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error formatting Supabase:', err);
    process.exit(1);
  }
}

formatSupabase();
