const { sequelize } = require('../models');

async function migrate() {
  console.log('Starting migration for Tasks targetRole...');
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    const tableInfo = await queryInterface.describeTable('Tasks');
    if (!tableInfo.targetRole) {
      await sequelize.query("ALTER TABLE Tasks ADD COLUMN targetRole VARCHAR(255) NOT NULL DEFAULT 'parent'");
      console.log('Added targetRole column to Tasks table.');
    } else {
      console.log('targetRole column already exists in Tasks table.');
    }
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
