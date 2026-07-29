const sequelize = require('../config/database');
const { Student } = require('../models');

async function addPhotoUrlColumn() {
  try {
    console.log('Migrating Students table for photoUrl column...');
    try {
      await sequelize.query('ALTER TABLE Students ADD COLUMN photoUrl TEXT;');
      console.log('Added photoUrl column to Students table.');
    } catch (e) {
      console.log('photoUrl column might already exist or:', e.message);
    }
    await Student.sync({ alter: true });
    console.log('Students migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

addPhotoUrlColumn();
