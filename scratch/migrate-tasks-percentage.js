const { QueryInterface } = require('sequelize');
const sequelize = require('../config/database');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  
  try {
    console.log('Adding requiresPercentage column to Tasks table...');
    await qi.addColumn('Tasks', 'requiresPercentage', {
      type: require('sequelize').DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    console.log('Successfully added requiresPercentage to Tasks.');
  } catch (err) {
    console.log('Tasks.requiresPercentage column may already exist:', err.message);
  }

  try {
    console.log('Adding percentage column to TaskCompletions table...');
    await qi.addColumn('TaskCompletions', 'percentage', {
      type: require('sequelize').DataTypes.INTEGER,
      allowNull: true
    });
    console.log('Successfully added percentage to TaskCompletions.');
  } catch (err) {
    console.log('TaskCompletions.percentage column may already exist:', err.message);
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate();
