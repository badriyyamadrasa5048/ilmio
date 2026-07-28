const { sequelize } = require('../models');

async function migrate() {
  console.log('Starting migration for Attendances parentRemarks...');
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    const tableInfo = await queryInterface.describeTable('Attendances');
    if (!tableInfo.parentRemarks) {
      await sequelize.query("ALTER TABLE Attendances ADD COLUMN parentRemarks VARCHAR(255)");
      console.log('Added parentRemarks column to Attendances table.');
    } else {
      console.log('parentRemarks column already exists in Attendances table.');
    }
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
