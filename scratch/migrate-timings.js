const { sequelize } = require('../models');

async function migrate() {
  console.log('Starting migration for Class and Attendance timings...');
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // 1. Alter Classes Table
    console.log('Altering Classes table to add startTime, endTime, graceTime...');
    
    // Check if columns already exist (safe-guard)
    const classTableInfo = await queryInterface.describeTable('Classes');
    
    if (!classTableInfo.startTime) {
      await sequelize.query("ALTER TABLE Classes ADD COLUMN startTime TIME NOT NULL DEFAULT '08:30:00'");
      console.log('Added startTime column to Classes.');
    } else {
      console.log('startTime already exists in Classes.');
    }

    if (!classTableInfo.endTime) {
      await sequelize.query("ALTER TABLE Classes ADD COLUMN endTime TIME NOT NULL DEFAULT '09:30:00'");
      console.log('Added endTime column to Classes.');
    } else {
      console.log('endTime already exists in Classes.');
    }

    if (!classTableInfo.graceTime) {
      await sequelize.query("ALTER TABLE Classes ADD COLUMN graceTime INTEGER NOT NULL DEFAULT 10");
      console.log('Added graceTime column to Classes.');
    } else {
      console.log('graceTime already exists in Classes.');
    }

    // 2. Alter Attendances Table
    console.log('Altering Attendances table to add checkInTime...');
    const attendanceTableInfo = await queryInterface.describeTable('Attendances');
    
    if (!attendanceTableInfo.checkInTime) {
      await sequelize.query("ALTER TABLE Attendances ADD COLUMN checkInTime TIME");
      console.log('Added checkInTime column to Attendances.');
    } else {
      console.log('checkInTime already exists in Attendances.');
    }

    console.log('✅ Migration complete! Database schema is successfully updated.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
