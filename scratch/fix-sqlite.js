const sequelize = require('../config/database');

async function fixSqlite() {
  try {
    console.log('Migrating SQLite database schema...');
    
    // Add level column to Classes table if missing
    try {
      await sequelize.query('ALTER TABLE Classes ADD COLUMN level INTEGER DEFAULT 1;');
      console.log('Added level column to Classes table.');
    } catch (e) {
      console.log('Column level might already exist or:', e.message);
    }

    // Sync all models to be sure
    await sequelize.sync({ alter: true });
    console.log('SQLite schema sync completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error migrating SQLite:', err);
    process.exit(1);
  }
}

fixSqlite();
