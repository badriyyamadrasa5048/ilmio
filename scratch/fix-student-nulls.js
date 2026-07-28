const sequelize = require('../config/database');
const { Student } = require('../models');

async function fixStudentTable() {
  try {
    console.log('Re-syncing Students table schema for optional fields...');
    
    // Drop and sync Student model table in SQLite
    await Student.sync({ alter: true });
    
    console.log('Students table schema updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating Students table:', err);
    process.exit(1);
  }
}

fixStudentTable();
